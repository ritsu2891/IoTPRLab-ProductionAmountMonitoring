<template>
  <div :style="styles.root">
    <v-row style="height: 100%;" class="align-center">
      <DataGraph
        style="height: calc(100% - 110px); width: 100%;"
        :uid="id"
        :data="chartdata"
        :options="chartOption"
        :simple="true"
        :stream="true"
        :sample-size="sampleSize"
        ref="chart"
      />
      <v-col>
        <DataLiveNumber
          style="padding: 0 10px; text-align: center;"
          :live-data="liveData"
          :aim-data="aimData"
        />
      </v-col>
      <v-col md="auto">
        <DataMetaInfo :machineName="machineName" :dateTime="liveDt" />
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import DataGraph from '~/components/DataGraph.vue'
import DataLiveNumber from '~/components/DataLiveNumber.vue'
import DataMetaInfo from '~/components/DataMetaInfo.vue'

@Component({
  components: { DataGraph, DataLiveNumber, DataMetaInfo },
})
export default class DataSummarizeCard extends Vue {
  @Prop({default: 0})
  x!: Number;

  @Prop({default: 0})
  y!: Number;

  @Prop()
  id!: number

  @Prop()
  data!: number[]
  @Prop()
  label!: string[]
  @Prop({default: ""})
  machineName!: string;

  liveData: number = 0;
  @Prop()
  liveDt!: string

  @Prop()
  sampleSize!: number

  @Prop()
  aimData!: number
  
  get styles() {return {
    root: {
      height: "100%",
      position: "absolute",
      left: `${(this.x as number) + 32}px`,
      top: `${(this.y as number) + 32}px`,
      backgroundColor: 'white'
    }
  };}

  chartdata: Object = {};

  chartOption: Object = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 8
    },
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        display: true,
      }],
      xAxes: [{
        display: false
      }]
    },
    // animation: {
    //   duration: 0,
    // }
  }

  created() {
    this.onDataChanged();
  }

  @Watch('data')
  onDataChanged() {
    if (!this.data) return;
    let label: string[] = [];
    let n: number = this.data.length;
    if (this.data && n > 2) {
      label = ' '.repeat(n - 1).split(' ');
    } else if (this.data && n == 1) {
      label = [''];
    }
    if (this.data && n > 0) {
      this.liveData = this.data[n-1];
    }
    this.chartdata = {
      labels: label,
      datasets: [
        {
          label: '生産個数',
          borderColor: 'rgb(0, 0, 0)',
          borderWidth: 5,
          fill: false,
          data: this.data.concat(),
          lineTension: 0
        }
      ]
    };
  }
}
</script>
