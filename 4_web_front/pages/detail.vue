<template>
  <globalMenuAndFAB view-select="second">
    <template v-slot:QuickActionArea>
      <IOSHSelector
        :id="2"
        :length="350"
        :links="graphScaleItem"
        v-model="graphScaleSelectedItem"
        class="RangeScaleSelector"
      ></IOSHSelector>
      <v-text-field
        label="集計幅"
        filled v-model="chunkSizeInput"
        :rules="[rules.isdigit]"
        :suffix="currentTimeRangeSuffix"
        height="58px"
        class="ChunkSizeInput"
      ></v-text-field>
    </template>

    <template v-slot:FABActions>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn fab small dark color="green" v-on="on" @click.stop="onCSVOutputModalOpen()">
            <v-icon>mdi-file-table</v-icon>
          </v-btn>
        </template>
        <span>CSVで出力</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn fab small color="primary" v-on="on" @click="onMoveToCurrentBtnClicked()">
            <v-icon>mdi-arrow-collapse-right</v-icon>
          </v-btn>
        </template>
        <span>現在時刻に移動</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn fab small color="primary" v-on="on" @click="onFetchLatestAndSyncClicked()">
            <v-icon>mdi-sync</v-icon>
          </v-btn>
        </template>
        <span>最新データを取得して追従</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn fab small color="primary" v-on="on" @click.stop="onMoveDateModalOpen()">
            <v-icon>mdi-timeline-clock-outline</v-icon>
          </v-btn>
        </template>
        <span>日時を指定して移動</span>
      </v-tooltip>
    </template>

    <div style="padding: 30px;">
      <DataGraph
        style="height: 600px; width: 100%;"
        :id="1"
        :data="chartdata"
        :options="chartOption"
        :range="range"
        @rangeChanged="onRangeChanged"
        @requestWider="onGraphScaleChanged('wider')"
        @requestNarrower="onGraphScaleChanged('narrower')"
        ref="graph"
      />
    </div>

    <!-- モーダル -->
    <!-- 日時を指定して移動 -->
    <v-dialog v-model="dialog_moveDatePick_show" max-width="900">
      <v-card>
        <v-card-title class="headline">日時を指定して移動</v-card-title>
        <v-card-text>
          <date-input-field label="移動先" v-model="dialog_moveDatePick_point_dt" />
          <div align="right">
            <v-btn color="primary" @click="onMoveDateModalSubmit()">OK</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- CSV -->
    <v-dialog v-model="dialog_csv_show" max-width="900">
      <v-card>
        <v-card-title class="headline">CSV出力</v-card-title>
        <v-card-text>
          <v-select
            v-model="dialog_csv_scale"
            :items="graphScaleItem.map((item) => {
              return {
                text: item.txt,
                value: item.id
              };
            })"
            label="時間単位"
          ></v-select>
          <date-input-field label="開始" v-model="dialog_csv_start" />
          <date-input-field label="終了" v-model="dialog_csv_end" />
          <div align="right">
            <v-btn
              color="primary"
              :disabled="!(dialog_csv_start && dialog_csv_end)"
              @click="onCSVOutputModalSubmit()"
            >
              ダウンロード
            </v-btn>
            <v-btn
              color="primary"
              @click="dialog_csv_show = false"
            >
              閉じる
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </globalMenuAndFAB>
</template>
<style scoped>
.RangeScaleSelector {
  display: inline-block;
  width: 300px;
}
.ChunkSizeInput {
  display: inline-block;
  position: relative;
  top: -31px;
  margin-left: 5px;
  width: 120px;
}
</style>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { DateTime, Duration } from 'luxon'
import { debounce } from 'ts-debounce-throttle';

import globalMenuAndFAB from '../pages/globalMenuAndFAB.vue'

import PageTitle from '../components/PageTitle.vue'
import DataGraph from '../components/DataGraph.vue'
import MenuButtonPalette from '../components/MenuButtonPalette.vue'
import IOSHSelector from '../components/IOSHSelector.vue'
import DateInputField from '../components/DateInputField.vue'

import { DataRange } from '../entities/DataRange'
import { DetailViewController } from '../logics/DetailViewController'
import { CountDataCSVRepositoryImpl, SettingRepositoryImpl, SettingRepository } from '../logics/Repositories'

type TimeScale = "minutes" | "hours" | "days" | "months" | "years"
type GraphScaleItem = {id: TimeScale, txt: string}
type FormRules = {[ruleName: string]: (value: string) => boolean | string}
type WholeDatasetsItnl = {[moteMacAddr: string]: {y: number, t: Date}[]}

Component.registerHooks([
  'beforeRouteLeave'
])
@Component({
  components: {
    globalMenuAndFAB,
    PageTitle,
    DataGraph,
    MenuButtonPalette,
    IOSHSelector,
    DateInputField
  }
})
export default class IndexPage extends Vue {
  settings: SettingRepository = new SettingRepositoryImpl();
  rules: FormRules = {
    isdigit: (value: string) => {
      const pattern = /^\d+$/
      return pattern.test(value) || '数字のみ可'
    },
  }

  //===================================
  /*-------------.
  | ライフサイクル |
  `-------------*/
  mounted() {
    this.range.begin = DateTime.local();
    this.controller = new DetailViewController(this);
    this.onDataChanged();
  }
  beforeRouteLeave (to: any, from: any, next: any) {
    this.controller.clearInterval();
    next();
  }


  //===================================
  /*---------------.
  | グラフオプション |
  `---------------*/
  chartLabelFontSize: number = 16
  chartLabelFontColor: string = "black"
  chartOption: Object = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 8
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        fontSize: this.chartLabelFontSize,
        fontColor: this.chartLabelFontColor
      }
    },
    tooltips: {
      titleFontSize: this.chartLabelFontSize,
      bodyFontSize: this.chartLabelFontSize,
    },
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          min: 0,
          padding: 20,
          fontSize: this.chartLabelFontSize,
          fontColor: this.chartLabelFontColor
        },
      }],
      xAxes: [{
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'H:mm',
            hour: 'H',
            day: 'M/D',
            month: 'YY/M',
            year: 'YYYY'
          }
        },
        ticks: {
          fontSize: this.chartLabelFontSize,
          fontColor: this.chartLabelFontColor
        }
      }]
    },
    animation: {
      duration: 0,
    }
  }


  /*-----------.
  | グラフデータ |
  `-----------*/
  controller!: DetailViewController;
  l_requestUpdateData: any = debounce(this.requestUpdateData, 300);
  requestUpdateData() {
    this.controller.update()
  }
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  data: WholeDatasetsItnl = {};
  chartdata: Object = {datasets: []};
  @Watch('data')
  onDataChanged() {
    this.chartdata = this.buildGraphDataSets();
  }
  buildGraphDataSets() {
    let datasets: any = [];
    const machineProfiles = this.settings.machineProfile;
    let visiblity = ((this.$refs.graph as any).getVisiblity());
    visiblity = visiblity.length != 0 ? visiblity : this.settings.moteMacAddrs.map(() => true);
    this.settings.moteMacAddrs.forEach((addr, i) => {
      datasets.push({
        label: machineProfiles[addr].name,
        borderColor: machineProfiles[addr].color,
        borderWidth: 5,
        fill: false,
        spanGaps: false,
        data: this.data[addr],
        hidden: !visiblity[i],
        lineTension: 0
      });
    });
    return this.chartdata = {
      labels: [],
      datasets: datasets
    }
  }


  /*----------.
  | グラフ範囲 |
  `----------*/
  range: DataRange = new DataRange();
  onRangeChanged(newRange: DataRange) {
    this.controller.autoFetch = false;
    this.range = newRange;
    this.l_requestUpdateData();
  }
  @Watch('range', {deep: true}) 
  appllyRangeChange() {
    (this.$refs.graph as any).onRangeChanged();
  }


  /*-------------.
  | グラフスケール |
  `--------------*/
  graphScaleItem: GraphScaleItem[] = [
    {
      id: 'minutes',
      txt: '分',
    },
    {
      id: 'hours',
      txt: '時',
    },
    {
      id: 'days',
      txt: '日',
    },
    {
      id: 'months',
      txt: '月',
    },
    {
      id: 'years',
      txt: '年',
    },
  ]
  graphScaleSelectedItem: TimeScale = "minutes"
  get currentTimeRangeSuffix(): string {
    let res: string = '';
    this.graphScaleItem.forEach((item: any) => {
      if (item.id == this.range.type) {
        res = item.txt;
      }
    });
    return res;
  }
  @Watch('graphScaleSelectedItem')
  onGraphScaleChanged(rangeType: TimeScale | "wider" | "narrower") {
    this.data = {};
    switch (rangeType) {
      case "wider":
        this.range.setRangeWider(true);
        this.graphScaleSelectedItem = this.range.type;
        break;
      case "narrower":
        this.range.setRangeNarrower(true);
        this.graphScaleSelectedItem = this.range.type;
        break;
      default:
        this.range.type = rangeType;
        break;
    }
    this.controller.update();
    (this.$refs.graph as any).onRangeChanged();
    return rangeType;
  }


  /*----------------.
  | チャンク（集計幅） |
  `-----------------*/
  chunkSize: number = 1;
  chunkSizeInput: string = `${this.chunkSize}`;
  @Watch('chunkSizeInput')
  onChunkSizeChanged() {
    if (this.rules.isdigit(this.chunkSizeInput) === true && parseInt(this.chunkSizeInput) > 0) {
      this.chunkSize = parseInt(this.chunkSizeInput);
      this.data = {};
      this.controller.update();
      (this.$refs.graph as any).onRangeChanged();
    }
  }


  /*-------------------.
  | クイックアクション関係 |
  `--------------------*/
  // 現在時刻に移動
  onMoveToCurrentBtnClicked() {
    const currentDt = DateTime.local();
    this.range.finish = currentDt;
    this.l_requestUpdateData();
    (this.$refs.graph as any).onRangeChanged();
  }
  // 最新データを取得して追従
  onFetchLatestAndSyncClicked() {
    this.controller.autoFetch = true;
  }


  /*-------------.
  | ダイアログ関係 |
  `-------------*/
  // 日付を指定して移動
  dialog_moveDatePick_show: boolean = false
  dialog_moveDatePick_point_dt: DateTime = DateTime.local()
  onMoveDateModalOpen() {
    this.dialog_moveDatePick_show = true;
  }
  onMoveDateModalSubmit() {
    this.dialog_moveDatePick_show = false;
    if (this.dialog_moveDatePick_point_dt) {
      this.range.center = this.dialog_moveDatePick_point_dt;
      this.l_requestUpdateData();
      (this.$refs.graph as any).onRangeChanged();
    }
  }
  // CSV出力
  dialog_csv_show: boolean = false
  dialog_csv_start: DateTime | null = null
  dialog_csv_end: DateTime | null = null
  dialog_csv_scale: TimeScale = "minutes"
  onCSVOutputModalOpen() {
    this.dialog_csv_scale = this.range.type;
    this.dialog_csv_show = true;
  }
  onCSVOutputModalSubmit() {
    if (!(this.dialog_csv_start && this.dialog_csv_end)) {
      return;
    }
    if (this.dialog_csv_start > this.dialog_csv_end) {
      return;
    }
    const dlurl = (new CountDataCSVRepositoryImpl()).getAll(this.dialog_csv_scale, this.dialog_csv_start!, this.dialog_csv_end!);
    window.open(dlurl, '_blank');
  }
}
</script>