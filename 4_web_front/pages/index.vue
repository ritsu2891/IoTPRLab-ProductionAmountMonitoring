<template>
  <globalMenuAndFAB view-select="first">
    <template v-slot:QuickActionArea>
      <div class="QuickActionAreaSpacer"></div>
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
      <div id="MapWrapper">
        <!--
          <Map2D ref="map" id="map" :machine-rendered-poses="machinePoses"></Map2D>
        -->
        <Map3D ref="map" id="Map" :machine-rendered-poses="machinePoses" />
        <DataSummarizeCard
          v-for="(addr, i) in moteMacAddr"
          :key="`dsc${i}`"
          :id="i"
          :x="machinePoses[i].x + cardPosOffsets[i].x"
          :y="machinePoses[i].y + cardPosOffsets[i].y"
          class="DataSummarizeCard elevation-5"
          :data="chartData[addr]"
          :live-dt="liveDt[addr]"
          :machine-name="settings.machineProfile[addr].name"
          :aim-data="settings.machineProfile[addr].goalCount"
          :sample-size="settings.nGraphPlot"
        />
      </div>
    </div>
  </globalMenuAndFAB>
</template>
<style scoped>
.QuickActionAreaSpacer {
  display: inline-block;
  height: 88px;
  width: 10px;
}
#MapWrapper {
  position: relative;
}
#Map {
  height: calc(100vh - (30px * 2 + 64px));
  z-index: 0;
}
.DataSummarizeCard {
  width: 350px;
  height: 300px;
  padding: 20px;
  z-index: 5;
}
</style>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import DataSummarizeCard from '../components/DataSummarizeCard.vue'
import PageTitle from '../components/PageTitle.vue'
import MenuButtonPalette from '../components/MenuButtonPalette.vue'
import Map2D from '../components/Map2D.vue'
import Map3D from '../components/Map3D.vue'
import { CountDataRepositoryImpl, SettingRepositoryImpl, SettingRepository } from '../logics/Repositories'
import IOSHSelector from '../components/IOSHSelector.vue'
import globalMenuAndFAB from '../pages/globalMenuAndFAB.vue'
import { MapViewController } from '../logics/MapViewController'
import { DateTime } from 'luxon'

type ChartDataEntity = {y: number, t: Date};
type ChartDataSets = {[moteMacAddr: string]: ChartDataEntity[]};

Component.registerHooks([
  'beforeRouteLeave'
])
@Component({
  components: {
    globalMenuAndFAB,
    PageTitle,
    DataSummarizeCard,
    MenuButtonPalette,
    Map2D,
    Map3D,
    IOSHSelector
  }
})
export default class IndexPage extends Vue {  
  settings: SettingRepository = new SettingRepositoryImpl();
  get moteMacAddr() {
    return this.settings.moteMacAddrs;
  }

  /*-------------.
  | ライフサイクル |
  `-------------*/
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
  created() {
    const repo = new CountDataRepositoryImpl();
    this.controller = new MapViewController(this);
  }
  beforeRouteLeave (to: any, from: any, next: any) {
    this.controller.clearInterval();
    next();
  }


  /*-----------.
  | グラフデータ |
  `-----------*/
  controller!: MapViewController;
  data: ChartDataSets = {};
  chartData: {[moteMacAddr: string]: number[]} = {};
  liveDt: {[moteMacAddr: string]: string} = {};
  @Watch('data')
  onDataChanged(newData: ChartDataSets) {
    this.chartData = {};
    this.liveDt = {};
    Object.keys(this.data).forEach((key) => {
      this.chartData[key] = this.data[key].map(dataRecord => dataRecord.y);
      if (this.chartData[key] && this.chartData[key].length > 0) {
        this.liveDt[key] = DateTime.fromMillis(this.data[key][this.data[key].length - 1].t.valueOf()).toFormat("HH:mm:ss");
      }
    });
  }


  /*----------.
  | マップ壁画 |
  `----------*/
  machinePoses: {x: number, y: number}[];
  cardPosOffsets: {x: number, y:number}[];
  get nMachines() {
    return this.machinePoses.length;
  }
  resetMapCameraPos() {
    (this.$refs.map as any).initCameraPos();
  }
}
</script>