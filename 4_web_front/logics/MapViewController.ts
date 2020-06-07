import { DateTime } from 'luxon'
import { CountDataRepository, CountDataRepositoryImpl, SettingRepository, SettingRepositoryImpl } from '../logics/Repositories'
import { CountData } from '../entities/CountData'

type RepoDataEntity = CountData;
type ProcessDataEntity = {y: number, t: DateTime};
type ChartDataEntity = {y: number, t: Date};

type RepoDataSets = {[moteMacAddr: string]: RepoDataEntity[]};
type ChartDataSets = {[moteMacAddr: string]: ChartDataEntity[]};

type MapView = { 
  data: ChartDataSets,
  chartData: {[moteMacAddr: string]: number[]},
  liveDt: {[moteMacAddr: string]: string}
};

export class MapViewController {
  repo: CountDataRepository = new CountDataRepositoryImpl();
  dest: MapView
  howMany: number = 10
  itvlTime: number = 5000 //ms
  latestDt: {[moteAddr: string]: DateTime} = {}
  runner: number = -1;
  setting: SettingRepository = new SettingRepositoryImpl();

  constructor(dest: MapView) {
    this.dest = dest;
    this.prepareDataStore();
    this.update();
    this.setInterval();
  }

  prepareDataStore() {
    if (this.setting && this.setting.moteMacAddrs) {
      this.setting.moteMacAddrs.forEach(moteAddr => {
        this.dest.data[moteAddr] = [];
        this.dest.chartData[moteAddr] = [];
        this.dest.liveDt[moteAddr] = "-----";
      });
    }
  }

  setInterval() {
    // this.runner = window.setInterval(() => this.update(), this.itvlTime);
  }

  clearInterval() {
    window.clearInterval(this.runner);
  }

  update() {
    const self = this;
    const moteAddrs = this.setting.moteMacAddrs;
    let latestDtRegistered: boolean[] = moteAddrs.map((moteAddr) => !!self.latestDt[moteAddr]); //MoteAddrのソースに注意
    let allRegistered = latestDtRegistered.every((v) => v);
    let allUnRegistered = latestDtRegistered.every((v) => !v);

    if (!(allRegistered || allUnRegistered)) return;

    (async () => {
      let repoDatas: RepoDataSets = {};
      let repoDataResolver: Promise<void>[] = [];
      if (allUnRegistered) {
        repoDatas = await self.repo.getLatest(self.howMany);
      } else {
        moteAddrs.forEach((moteAddr) => {
          repoDataResolver.push((async (moteAddr) => {
            const repoSingleData = (await self.repo.getLatest(self.howMany, self.latestDt[moteAddr], moteAddr))[moteAddr]; //@TODO: moteAddrを指定しているんだから、帰ってくるのは配列であるべき。
            repoDatas[moteAddr] = repoSingleData ? repoSingleData : [];
          })(moteAddr));
        });
        await Promise.all(repoDataResolver);
      }
      moteAddrs.forEach((moteAddr) => {
        if (!(repoDatas[moteAddr])) return;
        if ((repoDatas[moteAddr]).length < 1) return;
        self.latestDt[moteAddr] = repoDatas[moteAddr].concat().sort(
          (A: CountData, B: CountData) => {return A.datetime.valueOf() > B.datetime.valueOf() ? -1 : 1}
        )[0].datetime;
      })
      self.dest.data = this.convert(repoDatas);
    })();
  }

  convert(repoDatas: RepoDataSets): ChartDataSets {
    const self = this;
    let chartDatas: ChartDataSets = {};
    Object.keys(repoDatas).forEach((moteMacAddr) => {
      chartDatas[moteMacAddr] = self.chartDataFromProcessData( self.processDataFromRepoDatas( repoDatas[moteMacAddr] ) );
    });
    return chartDatas;
  }

  //@TODO: 以下をDetailViewControllerと共通化するべき

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
}