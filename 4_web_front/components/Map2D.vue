<template>
  <div>
    <canvas id="map2d"></canvas>
  </div>
</template>
<script lang="ts">
import * as PIXI from "pixi.js";
import { Component, Prop, Vue } from 'vue-property-decorator';

interface locatable {
  locate(): void
}

class RectGraphic {
  width: number
  height: number
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  drawRect(color: number, fill: boolean, width: number, height: number) {
    let rectangle = new PIXI.Graphics();
    rectangle.lineStyle(4, color, 1);
    if (fill) {
      rectangle.beginFill(color)
    }
    rectangle.drawRect(0, 0, width, height);
    if (fill) {
      rectangle.endFill();
    }
    return rectangle;
  }
}

class FactoryOutlineGraphic extends RectGraphic implements locatable {
  graphic: PIXI.Graphics
  app: PIXI.Application
  constructor(app: PIXI.Application) {
    super(800, 600);
    this.graphic = this.drawRect(0x000000, false, this.width, this.height);
    this.app = app;
    this.locate();
  }
  locate() {
    this.graphic.x = (this.app.screen.width - this.width) / 2;
    this.graphic.y = (this.app.screen.height - this.height) / 2;
  }
}

class MachinePositionGraphic extends RectGraphic implements locatable {
  graphic: PIXI.Graphics
  factoryOutline: FactoryOutlineGraphic
  machineRenderedPos!: {x: number, y: number}
  x: number
  y: number
  constructor(x: number, y: number, factoryOutline: FactoryOutlineGraphic, machineRenderedPos: {x: number, y: number}) {
    super(64, 64);
    this.graphic = this.drawRect(0xee0000, true, this.width, this.height);
    this.factoryOutline = factoryOutline;
    this.machineRenderedPos = machineRenderedPos;
    this.x = x;
    this.y = y;
    this.locate();
  }
  locate() {
    this.graphic.x = this.factoryOutline.graphic.x + this.x;
    this.graphic.y = this.factoryOutline.graphic.y + this.y;
    this.machineRenderedPos.x = this.graphic.x;
    this.machineRenderedPos.y = this.graphic.y;
  }
}

@Component
export default class Map2D extends Vue {
  app!: PIXI.Application
  relocateTargets!: locatable[]
  factoryOutline!: FactoryOutlineGraphic
  machines!: MachinePositionGraphic[]
  machinePoses!: {x: number, y: number}[]

  @Prop({}) machineRenderedPoses!: {x: number, y: number}[]

  constructor() {
    super()
    this.machinePoses = [
      { x: 100, y: 400 },
      { x: 500, y: 400 },
      { x: 500, y: 100 }
    ]
  }

  public get machinePosGraphicPoses() {
    let poses: {x: number, y: number}[] = []
    this.machines.forEach(function(machine) {
      poses.push({ x: machine.x, y: machine.y });
    });
    return poses;
  }

  mounted() {
    this.initCanvas();
    this.resize();
    window.addEventListener('resize', this.resize);

    this.relocateTargets = [];

    // 工場の外郭
    this.factoryOutline = new FactoryOutlineGraphic(this.app);
    this.relocateTargets.push(this.factoryOutline);
    this.app.stage.addChild(this.factoryOutline.graphic);

    // 機械の位置
    const self = this;
    self.machines = [];
    this.machinePoses.forEach(function(machinePos, index) {
      const machine = new MachinePositionGraphic(machinePos.x, machinePos.y, self.factoryOutline, self.machineRenderedPoses[index]);
      self.machines.push(machine);
      self.relocateTargets.push(machine);
      self.app.stage.addChild(machine.graphic);
    });
  }

  initCanvas() {
    const canvas = <HTMLCanvasElement> document.getElementById("map2d");
    this.app = new PIXI.Application({
      width: 1500,
      height: 500,
      view: canvas,
      backgroundColor: 0xffffff,
      resolution: devicePixelRatio 
    });
  }

  resize() {
    const parent = <HTMLElement> this.app.view.parentNode;
    this.app.renderer.resize(parent.clientWidth, parent.clientHeight);
    if (this.relocateTargets) {
      this.relocateTargets.forEach(function (target) {
        target.locate();
      });
    }
    
  }

}
</script>
