<template>
  <div>
    <div style="position: relative; height: 100%; width: 100%;">
      <div style="height: 100%; width: 100%; position: absolute; bottom: 0; left: 0;">
        <canvas :id="`datagraphLabel${this.uid}`"></canvas>
      </div>
      <div :style="{height: simple ? '100%' : `calc(100% - ${labelGap}px)`, width: '100%', position: 'absolute', bottom: '0', left: '0'}">
        <canvas :id="`datagraph${this.uid}`"></canvas>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Chart, ChartConfiguration } from 'chart.js'
import { Component, Prop, Vue, Mixins, Watch, Emit } from 'vue-property-decorator'
import { DateTime, Duration } from 'luxon'
import { DataRange } from '../entities/DataRange'

enum MouseState { LeftDrag, Free }

@Component
export default class DataGraph extends Vue {
  @Prop({default: () => ({})})
  data!: any;

  mouseState: MouseState = MouseState.Free;
  mouseDragStart: number = 0;
  wheelDeltaY: number = 0;

  @Prop({default: () => ({})})
  options!: Object;

  canvas!: HTMLCanvasElement
  labelCanvas!: HTMLCanvasElement
  chart!: any
  labelCtx!: CanvasRenderingContext2D

  label!: {idx: number, label: string}

  @Prop({default: () => ({})})
  range!: DataRange
  chunkSize: number = 1

  labelGap: number = 40

  @Prop({default: false})
  simple!: boolean

  @Prop({default: false})
  stream!: boolean

  @Prop()
  sampleSize!: number

  @Prop()
  uid!: number

  lastRangeBegin!: DateTime

  get labelEdgeTimes() {
    let prevEdge: DateTime;
    let labelEdgeTimes: {i: number, t: DateTime}[] = [];
    if (this.range.width < 1) {
      return [];
    } else {
      prevEdge = this.range.begin.startOf(this.range.adjRangeType("wider") as any);
      labelEdgeTimes.push({i: 0, t: prevEdge});
    }
    for (let i = 1; i < this.range.width; i++) {
      let current = this.range.begin.plus(this.range.duration(i)).startOf(this.range.adjRangeType("wider") as any);
      if (prevEdge < current) {
        labelEdgeTimes.push({i: i, t: current});
        prevEdge = current;
      }
    }
    return labelEdgeTimes;
  }

  mounted() {
    let prop = {
      type: 'line',
      data: this.data,
      options: this.options
    };
    this.canvas = document.getElementById(`datagraph${this.uid}`) as HTMLCanvasElement;
    this.labelCanvas = document.getElementById(`datagraphLabel${this.uid}`) as HTMLCanvasElement;
    this.chart = new Chart(this.canvas.getContext('2d') as CanvasRenderingContext2D, prop as ChartConfiguration);
    this.labelCtx = this.labelCanvas.getContext('2d') as CanvasRenderingContext2D;

    if (!this.simple) {
      this.lastRangeBegin = this.range.begin;
    }
    if (!this.simple) this.setEvent();

    this.labelCanvas.width = this.chart.width;
    this.labelCanvas.height = this.chart.height + this.labelGap;

    this.chart.update();
    if (!this.simple) this.drawEdgeTimeLabel();
  }

  setEvent() {
    const self = this;
    this.canvas.addEventListener('mousedown', function(event) {
      self.mouseState = MouseState.LeftDrag;
      self.mouseDragStart = event.clientX;
    });
    this.canvas.addEventListener('mousemove', function(event) {
      if (self.mouseState == MouseState.LeftDrag) {
        let diff = self.mouseDragStart - event.clientX;
        
        let diffObj: {[key: string]: number} = {};
        diffObj[self.range.type] = diff * self.range.width * 0.001;
        self.range.finish = self.range.finish.plus(Duration.fromObject(diffObj));
        self.onRangeChanged();
        self.mouseDragStart = event.clientX;
      }
    });
    this.canvas.addEventListener('mouseup', function(event) {
      self.mouseState = MouseState.Free;
      const diff = Math.abs(self.range.begin.valueOf() - self.lastRangeBegin.valueOf());
      if (diff > 1) {
        self.rangeChanged();
      }
      self.lastRangeBegin = self.range.begin;
    });
    this.canvas.addEventListener('mousewheel', function(event) {
      self.wheelDeltaY = (event as WheelEvent).deltaY;
      const newWidth = self.range.width + self.wheelDeltaY * 0.05;
      if (newWidth < self.range.widthMin) {
        self.requestNarrower();
      } else if (newWidth > self.range.widthMax) {
        self.requestWider();
      } else {
        self.range.width = newWidth;
        self.onRangeChanged();
        self.rangeChanged();
      }
      
    });
  }

  @Emit('requestWider')
  requestWider() {
    // Nothing to do
  }

  @Emit('requestNarrower')
  requestNarrower() {
    // Nothing to do
  }

  @Emit('rangeChanged')
  rangeChanged() {
    return this.range;
  }

  applyRange() {
    const tooltipformat = {
      minutes: 'H:mm',
      hours: 'H',
      days: 'M/D',
      months: 'YY/M',
      years: 'YYYY'
    }

    this.chart.scales['x-axis-0'].options.time.unit = this.range.type.slice(0,-1);
    this.chart.scales['x-axis-0'].options.time.tooltipFormat = tooltipformat[this.range.type];
    this.chart.scales['x-axis-0'].options.ticks.max = this.range.finish.valueOf();
    this.chart.scales['x-axis-0'].options.ticks.min = this.range.begin.valueOf();
    this.chart.update();
    this.drawEdgeTimeLabel();
  }

  drawEdgeTimeLabel() {
    const self = this;
    this.labelCtx.clearRect(0, 0, this.labelCanvas.width, this.labelCanvas.height);

    if (!this.range.hasAdjRangeType('wider')) {
      return;
    }

    this.labelCtx.font = '25px "游ゴシック体", "Hiragino Kaku Gothic ProN",sans-serif';
    // self.labelCtx.fillStyle = "#999999";
    this.labelEdgeTimes.forEach(function(labelEdgeTime, i) {
      const x = i == 0 ? self.chart.chartArea.left : self.chart.scales['x-axis-0'].getPixelForTick(labelEdgeTime.i-1);
      const timeLabel = self.edgeTimeLabelText(labelEdgeTime.t);

      if (i < self.labelEdgeTimes.length-1) {
        const nextX = self.chart.scales['x-axis-0'].getPixelForTick(self.labelEdgeTimes[i+1].i-1);
        const timeLabelWidth = self.labelCtx.measureText(timeLabel).width;
        if (x + timeLabelWidth + 10 > nextX) {
          return;
        }
      }
      self.labelCtx.fillText(timeLabel, x + 3, self.chart.chartArea.top + 25 + 3);
      self.labelCtx.beginPath();
      self.labelCtx.moveTo(x, self.chart.chartArea.top);
      self.labelCtx.lineTo(x, self.chart.chartArea.bottom + self.labelGap);
      self.labelCtx.stroke();
    })
  }

  edgeTimeLabelText(dt: DateTime): string {
    const type = this.range.type;
    switch (type) {
      case 'minutes':
        return dt.setLocale('ja').toFormat("yy/MM/dd H時");
        break;
      case 'hours':
        return dt.setLocale('ja').toFormat("yy/MM/dd");
        break;
      case 'days':
        return dt.setLocale('ja').toFormat("yy/MM");
        break;
      case 'months':
        return dt.setLocale('ja').toFormat("yy");
        break;
      default:
        return '';
    }
  }

  @Watch('data')
  onDataChanged() {
    if (this.stream) {
      for (let i = 0; i < this.chart.data.datasets.length; i++) {
        let addItems = this.data.datasets[i].data;
        let addLabels = this.data.labels;
        if (addItems && addItems.length > 0) this.chart.data.datasets[i].data.push(...addItems);
        if (addLabels && addLabels.length > 0) this.chart.data.labels.push(...addLabels);

        if (this.sampleSize && this.sampleSize > 0) {
          const reduceSize = this.chart.data.datasets[i].data.length - this.sampleSize;
          if (reduceSize > 0) {
            this.chart.data.datasets[i].data.splice(0, reduceSize);
            this.chart.data.labels.splice(0, reduceSize);
          }
        }

      }
    } else {
      this.chart.data = this.data;
    }
    this.chart.update();
  }

  @Watch('range')
  onRangeChanged() {
    if (!this.simple && this.mouseState != MouseState.LeftDrag) this.lastRangeBegin = this.range.begin;
    if (!this.simple) this.applyRange();
  }

  getVisiblity() {
    let res: boolean[] = [];
    for (var i=0; i < this.chart.data.datasets.length; i++) {
      res.push(this.chart.isDatasetVisible(i)); 
    }
    return res;
  }
}
</script>
