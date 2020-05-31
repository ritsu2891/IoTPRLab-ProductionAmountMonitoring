<template>
  <GMenuAndFABPage view-select="second">
    <template v-slot:QuickActionArea>
      <IOSHSelector :id="2" :length="350" :links="graphScaleItem" v-model="graphScaleSelectedItem" style="display: inline-block; width: 300px;" />
      <v-text-field label="集計幅" filled v-model="chunkSizeInput" :rules="[rules.isdigit]" :suffix="currentTimeRangeSuffix" height="58px" style="display: inline-block; width: 120px; position: relative; top: -31px; margin-left: 5px;"></v-text-field>
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
          <v-btn fab small color="primary" v-on="on" @click="controller.autoFetch = true">
            <v-icon>mdi-sync</v-icon>
          </v-btn>
        </template>
        <span>最新データを取得して追従</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn fab small color="primary" v-on="on" @click.stop="dialog_moveDatePick = true">
            <v-icon>mdi-timeline-clock-outline</v-icon>
          </v-btn>
        </template>
        <span>日時を指定して移動</span>
      </v-tooltip>
    </template>

    <div style=" padding: 30px;">
      <DataGraph
        style="height: 600px; width: 100%;"
        :id="1"
        :data="chartdata"
        :options="chartoption"
        :range="range"
        @rangeChanged="onRangeChanged"
        @requestWider="onWiderRequested"
        @requestNarrower="onNarrowerRequested"
        ref="graph"
      />
    </div>

    <!-- モーダル -->
    <!-- 日時を指定して移動 -->
    <v-dialog v-model="dialog_moveDatePick" max-width="900">
      <v-card>
        <v-card-title class="headline">日時を指定して移動</v-card-title>
        <v-card-text>
          <date-input-field label="移動先" v-model="point_dt" />
          <div align="right">
            <v-btn color="primary" @click="onDateMoveDateModalSubmit()">OK</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- CSV -->
    <v-dialog v-model="dialog_csv" max-width="900">
      <v-card>
        <v-card-title class="headline">CSV出力</v-card-title>
        <v-card-text>
          <v-select v-model="csv_scale" :items="graphScaleItem.map((item) => {return {text: item.txt, value: item.id};})" label="時間単位"></v-select>
          <date-input-field label="開始" v-model="csv_start_dt" />
          <date-input-field label="終了" v-model="csv_end_dt" />
          <div align="right">
            <v-btn color="primary" :disabled="!(csv_start_dt && csv_end_dt)" @click="onCSVOutputModalSubmit()">ダウンロード</v-btn>
            <v-btn color="primary" @click="dialog_csv = false">閉じる</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </GMenuAndFABPage>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { DateTime, Duration } from 'luxon'
import { debounce } from 'ts-debounce-throttle';

import GMenuAndFABPage from '~/pages/GMenuAndFABPage.vue'

import PageTitle from '~/components/PageTitle.vue'
import DataGraph from '~/components/DataGraph.vue'
import MenuButtonPalette from '~/components/MenuButtonPalette.vue'
import IOSHSelector from '~/components/IOSHSelector.vue'
import DateInputField from '~/components/DateInputField.vue'

import { DataRange } from '~/entities/DataRange'
import { DetailViewController } from '~/logics/DetailViewController'
import { CountDataCSVRepositoryImpl, SettingRepositoryImpl, SettingRepository } from '~/logics/Repositories'

Component.registerHooks([
  'beforeRouteLeave'
])

@Component({components: {GMenuAndFABPage, PageTitle, DataGraph, MenuButtonPalette, IOSHSelector, DateInputField}})
export default class IndexPage extends Vue {
  data: {[moteMacAddr: string]: {y: number, t: Date}[]} = {};
  settings: SettingRepository = new SettingRepositoryImpl();
  range: DataRange = new DataRange();
  chunkSize: number = 1;
  chunkSizeInput: string = `${this.chunkSize}`;
  controller!: DetailViewController;
  fab: boolean = false;

  rules: any = {
    isdigit: (value: string) => {
      const pattern = /^\d+$/
      return pattern.test(value) || '数字のみ可'
    },
  }

  chartdata: Object = {
    datasets: []
  }

  chartLabelFontSize: number = 16
  chartLabelFontColor: string = "black"

  chartoption: Object = {
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
  updater: any = debounce(this.dataUpdate, 300)

  viewButtonItem: Object[] = [
    {
      id: 'first',
      icon: "mdi-map-search",
      href: "/"
    },
    {
      id: 'second',
      icon: "mdi-chart-line",
      href: "/detail"
    }
  ]

  viewButtonSelectedItem: string = 'second'

  graphScaleItem: Object[] = [
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

  get currentTimeRangeSuffix(): string {
    let res: string = '';
    this.graphScaleItem.forEach((item: any) => {
      if (item.id == this.range.type) {
        res = item.txt;
      }
    });
    return res;
  }

  graphScaleSelectedItem: "minutes" | "hours" | "days" | "months" | "years" = "minutes"

  dialog_moveDatePick: boolean = false
  point_dt: DateTime = DateTime.local()

  dialog_csv: boolean = false
  csv_start_dt: DateTime | null = null
  csv_end_dt: DateTime | null = null
  csv_scale: "minutes" | "hours" | "days" | "months" | "years" = "minutes"

  mounted() {
    this.range.begin = DateTime.local();
    this.controller = new DetailViewController(this);
    this.onDataChanged();
  }

  onRangeChanged(newRange: DataRange) {
    this.controller.autoFetch = false;
    this.range = newRange;
    this.updater();
  }

  @Watch('range', {deep: true}) 
  rc() {
    (this.$refs.graph as any).onRangeChanged();
  }

  dataUpdate() {
    this.controller.update()
  }

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

  onWiderRequested() {
    this.data = {};
    this.range.setRangeWider(true);
    this.graphScaleSelectedItem = this.range.type;
    this.controller.update();
    (this.$refs.graph as any).onRangeChanged();
  }

  onNarrowerRequested() {
    this.data = {};
    this.range.setRangeNarrower(true);
    this.graphScaleSelectedItem = this.range.type;
    this.controller.update();
    (this.$refs.graph as any).onRangeChanged();
  }

  // グローバル Viewスイッチの横のコントロールの処理
  @Watch('graphScaleSelectedItem')
  onRangeChangeSelected() {
    this.data = {};
    this.range.type = this.graphScaleSelectedItem;
    this.controller.update();
    (this.$refs.graph as any).onRangeChanged();
  }

  @Watch('chunkSizeInput')
  onChunkSizeChanged() {
    if (this.rules.isdigit(this.chunkSizeInput) === true && parseInt(this.chunkSizeInput) > 0) {
      this.chunkSize = parseInt(this.chunkSizeInput);
      this.data = {};
      this.controller.update();
      (this.$refs.graph as any).onRangeChanged();
    }
  }

  // FABダイレクト動作の処理
  onMoveToCurrentBtnClicked() {
    const currentDt = DateTime.local();
    this.range.finish = currentDt;
    this.updater();
    (this.$refs.graph as any).onRangeChanged();
  }

  // ダイアログの処理
  onDateMoveDateModalSubmit() {
    this.dialog_moveDatePick = false;
    if (this.point_dt) {
      this.range.center = this.point_dt;
      this.updater();
      (this.$refs.graph as any).onRangeChanged();
    }
  }

  onCSVOutputModalOpen() {
    this.csv_scale = this.range.type;
    this.dialog_csv = true;
  }

  onCSVOutputModalSubmit() {
    if (!(this.csv_start_dt && this.csv_end_dt)) {
      return;
    }
    if (this.csv_start_dt > this.csv_end_dt) {
      return;
    }
    const dlurl = (new CountDataCSVRepositoryImpl()).getAll(this.csv_scale, this.csv_start_dt!, this.csv_end_dt!);
    window.open(dlurl, '_blank');
  }

  beforeRouteLeave (to: any, from: any, next: any) {
    this.controller.clearInterval();
    next();
  }
}
</script>