<template>
  <GMenuAndFABPage view-select="first">
    <template v-slot:QuickActionArea>
      <div style="height: 88px; width: 10px; display: inline-block;"></div>
    </template>
    <template v-slot:FABActions>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn fab small dark color="red" v-on="on" @click="resetMapCameraPos()">
            <v-icon>mdi-undo-variant</v-icon>
          </v-btn>
        </template>
        <span>カメラポジションをリセット</span>
      </v-tooltip>
    </template>
    <div>
      <div style="position: relative;">
        <!-- <Map2D style="width: 100%; height: calc(100vh - 30px * 2); z-index: 0;" :machine-rendered-poses="machinePoses" ref="map"></Map2D> -->
        <Map3D ref="map" style="height: calc(100vh - (30px * 2 + 64px)); z-index: 0;" :machine-rendered-poses="machinePoses" />
        <DataSummarizeCard
          v-for="(addr, i) in moteMacAddr"
          :key="`dsc${i}`"
          :id="i"
          style="width: 350px; height: 300px; padding: 20px; z-index: 5;"
          :x="machinePoses[i].x + cardPosOffsets[i].x"
          :y="machinePoses[i].y + cardPosOffsets[i].y"
          class="elevation-5"
          :data="chartData[addr]"
          :live-dt="liveDt[addr]"
          :machine-name="settings.machineProfile[addr].name"
          :aim-data="settings.machineProfile[addr].goalCount"
          :sample-size="settings.nGraphPlot"
        />
      </div>
    </div>
  </GMenuAndFABPage>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import DataSummarizeCard from '~/components/DataSummarizeCard.vue'
import PageTitle from '~/components/PageTitle.vue'
import MenuButtonPalette from '~/components/MenuButtonPalette.vue'
import Map2D from '~/components/Map2D.vue'
import Map3D from '~/components/Map3D.vue'
import { CountDataRepositoryImpl, SettingRepositoryImpl, SettingRepository } from '~/logics/Repositories'
import IOSHSelector from '~/components/IOSHSelector.vue'
import GMenuAndFABPage from '~/pages/GMenuAndFABPage.vue'
import { MapViewController } from '~/logics/MapViewControllwe'
import { DateTime } from 'luxon'

type ChartDataEntity = {y: number, t: Date};
type ChartDataSets = {[moteMacAddr: string]: ChartDataEntity[]};

Component.registerHooks([
  'beforeRouteLeave'
])

@Component({components: {GMenuAndFABPage, PageTitle, DataSummarizeCard, MenuButtonPalette, Map2D, Map3D, IOSHSelector}})
export default class IndexPage extends Vue {
  machinePoses: {x: number, y: number}[];
  cardPosOffsets: {x: number, y:number}[];

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

  viewButtonSelectedItem: string = 'first'

  controller!: MapViewController;
  data: ChartDataSets = {dm01: [], dm02: [], dm03: []};
  chartData: {[moteMacAddr: string]: number[]} = {dm01: [], dm02: [], dm03: []};
  liveDt: {[moteMacAddr: string]: string} = {dm01: "-----"};

  settings: SettingRepository = new SettingRepositoryImpl();

  get nMachines() {
    return this.machinePoses.length;
  }

  get moteMacAddr() {
    return this.settings.moteMacAddrs;
  }

  constructor() {
    super();
    this.machinePoses = [
      {x: 0, y: 0},
      {x: 0, y: 0},
      {x: 0, y: 0},
    ];
    this.cardPosOffsets = [
      {x: 0, y: -300},
      {x: -300, y: 0},
      {x: 0, y: 0}
    ];
  }

  mounted() {
    const repo = new CountDataRepositoryImpl();
    this.controller = new MapViewController(this);
  }

  beforeRouteLeave (to: any, from: any, next: any) {
    this.controller.clearInterval();
    next();
  }

  @Watch('data')
  onDataChanged() {
    Object.keys(this.data).forEach((key) => {
      this.chartData[key] = this.data[key].map(dataRecord => dataRecord.y);
      if (this.chartData[key] && this.chartData[key].length > 0) {
        this.liveDt[key] = DateTime.fromMillis(this.data[key][this.data[key].length - 1].t.valueOf()).toFormat("HH:mm:ss");
      }
    })
  }

  resetMapCameraPos() {
    (this.$refs.map as any).initCameraPos();
  }
}
</script>