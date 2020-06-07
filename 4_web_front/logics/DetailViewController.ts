import { DateTime } from 'luxon'
import { CountDataRepository, CountDataRepositoryImpl, SettingRepository, SettingRepositoryImpl } from '../logics/Repositories'
import { CountData } from '../entities/CountData'
import { DataRange } from '../entities/DataRange'

type RepoDataEntity = CountData;
type ProcessDataEntity = {y: number, t: DateTime};
type ChartDataEntity = {y: number, t: Date};

type RepoDataSets = {[moteMacAddr: string]: RepoDataEntity[]};
type ChartDataSets = {[moteMacAddr: string]: ChartDataEntity[]};

type DetailView = { 
  data: ChartDataSets,
  range: DataRange,
  chunkSize: number
};

export class DetailViewController {
  repo: CountDataRepository = new CountDataRepositoryImpl();
  setting: SettingRepository = new SettingRepositoryImpl();
  dest: DetailView
  autoFetch: boolean = true
  runner: number = -1
  itvlTime: number = 3000 //ms

  get range() {
    return this.dest.range;
  }

  get chunkSize() {
    return this.dest.chunkSize;
  }

  constructor(dest: any) {
    this.dest = dest;
    this.update();
    this.setInterval();
  }

  update() {
    const margin = this.dest.range.duration(this.chunkSize * 3);

    const range = this.dest.range.type;
    const startDt = this.dest.range.begin.minus(margin);
    const endDt = this.dest.range.finish.plus(margin);

    this.repo.getAll(range, startDt, endDt).then((repoDatas) => {
      if (repoDatas) {
        this.dest.data = this.convert(repoDatas);
      }
    })
  }

  setInterval() {
    this.runner = window.setInterval(() => this.fetchLatest(), this.itvlTime);
  }

  clearInterval() {
    window.clearInterval(this.runner);
  }

  fetchLatest() {
    const self = this;
    if (!this.autoFetch) return;
    (async () => {
      const latestData = await this.repo.getLatest(1);
      let latestDt = DateTime.fromMillis(0);
      this.setting.moteMacAddrs.forEach((addr) => {
        if (!latestData[addr] || latestData[addr].length < 1) {
          return;
        }
        if (latestDt < latestData[addr][0].datetime) {
          latestDt = latestData[addr][0].datetime;
        }
      });
      this.dest.range.finish = latestDt;
      self.update();
    })();
  }

  convert(repoDatas: RepoDataSets): ChartDataSets {
    const self = this;
    let chartDatas: ChartDataSets = {};
    Object.keys(repoDatas).forEach((moteMacAddr) => {
      chartDatas[moteMacAddr] = 
        self.chartDataFromProcessData(
          // self.makeLossDataItem(
            self.aggregate(
              self.processDataFromRepoDatas(
                repoDatas[moteMacAddr]
              )
            ).sort(
              (A: ProcessDataEntity, B: ProcessDataEntity) => {return A.t.valueOf() > B.t.valueOf() ? -1 : 1}
            )
          // )
        );
    });
    return chartDatas;
  }

  //RepoDataEntity -> ProcessDataEntity
  processDataFromRepoDatas(repoDatas: RepoDataEntity[]): ProcessDataEntity[] {
    let pDatas: ProcessDataEntity[] = [];

    repoDatas.forEach((data) => {
      pDatas.push({y: data.value, t: data.datetime});
    })

    return pDatas;
  }

  //ProcessDataEntity -> ChartDataEntity
  chartDataFromProcessData(pData: ProcessDataEntity[]): ChartDataEntity[] {
    let cDatas: ChartDataEntity[] = [];

    pData.forEach((data) => {
      cDatas.push({y: data.y, t: new Date(data.t.toISO())});
    });

    return cDatas;
  }

  //欠損データを明確にNaNとする
  makeLossDataItem(datas: ProcessDataEntity[]): ProcessDataEntity[] {
    const self = this;
    const range = self.dest.range;
    const chunkSize = self.dest.chunkSize;

    let prevDateTime: DateTime;
    let currentDateTime: DateTime;
    let diff: number = 0;
    let pDatas: ProcessDataEntity[] = [];

    datas.forEach((data) => {
      currentDateTime = data.t;
      if (prevDateTime) { //このガードは一回しか使わないけど、何とかできないか？
        diff = range.unitDiff(prevDateTime, currentDateTime)!;
        if (diff > chunkSize) {
          while ((diff -= chunkSize) > chunkSize) {
            prevDateTime = prevDateTime.plus(range.unitDuration());
            pDatas.push({y: NaN, t: prevDateTime});
          }
        }
      }
      pDatas.push(data);
      prevDateTime = currentDateTime;
    });

    return pDatas;
  }

  //チャンクで集計
  //【制約】チャンク幅は割り切れることを前提とする
  //万が一割り切れないチャンクサイズが指定されている場合、末尾のチャンクのみデータが入らない他、表示スケールによる集計結果の矛盾が生じる
  aggregate(datas: ProcessDataEntity[]): ProcessDataEntity[] {
    const self = this;
    const range = self.dest.range;
    const chunkSize = self.dest.chunkSize;

    let baseDt: DateTime = DateTime.fromSQL('2019-01-01 00:00:00');
    let chunkReprDt: DateTime;
    let aggrDatas: ProcessDataEntity[] = [];
    let aggrDataQueue: ProcessDataEntity[] = [];
    let aggrDataQueueItem: ProcessDataEntity;
    let lastAggrDataQueueItem: ProcessDataEntity;

    let yTmp: number = 0;

    datas.forEach((data, i) => {
      if (!chunkReprDt) {
        chunkReprDt = data.t;
      }
      if (!self.isSameChunk(baseDt, data.t, chunkReprDt)) {
        while (aggrDataQueueItem = aggrDataQueue.pop()!) {
          yTmp += aggrDataQueueItem.y ? aggrDataQueueItem.y : 0;
          lastAggrDataQueueItem = aggrDataQueueItem;
        }
        aggrDatas.push({y: yTmp, t: this.chunkBaseDt(baseDt, lastAggrDataQueueItem.t)});
        yTmp = 0;
        chunkReprDt = data.t;
      }
      aggrDataQueue.push(data);
      if (i == datas.length) {
        while (aggrDataQueueItem = aggrDataQueue.pop()!) {
          yTmp += aggrDataQueueItem.y ? aggrDataQueueItem.y : 0;
          lastAggrDataQueueItem = aggrDataQueueItem;
        }
        aggrDatas.push({y: yTmp, t: this.chunkBaseDt(baseDt, lastAggrDataQueueItem.t)});
      }
    });

    return aggrDatas;
  }

  isSameChunk(basedt: DateTime, dt1: DateTime, dt2: DateTime): boolean {
    const range = this.range;
    const chunkSize = this.chunkSize;
    const [diff1, diff2] = [dt1, dt2].map((dt) => {
      return Math.floor(range.unitDiff(basedt, dt) as number / chunkSize);
    });
    return diff1 == diff2;
  }

  chunkBaseDt(basedt: DateTime, dt: DateTime): DateTime {
    const range = this.range;
    const chunkSize = this.chunkSize;
    const offset = range.unitDiff(basedt, dt) as number % chunkSize;
    return dt.plus(range.duration(chunkSize - offset - 1));
  }
}