<template>
  <div>
    <canvas id="map3d"></canvas>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as THREE from 'three'
import { Renderer } from 'pixi.js';

enum MouseState {
  Free,
  LeftClick,
  RightClick
}

@Component
export default class Map3D extends Vue {
  @Prop({}) machineRenderedPoses!: {x: number, y: number}[]

  canvas!: HTMLCanvasElement
  renderer!: THREE.WebGLRenderer
  scene!: THREE.Scene
  camera!: THREE.Camera
  box!: THREE.Mesh
  factoryOutlineBoxes!: THREE.Mesh[]
  machinePositionBoxes!: THREE.Mesh[]

  width!: number
  height!: number

  mouse!: {x?: number, y?: number, lastX?: number, lastY?: number, state: MouseState}
  wheel!: {deltaX: number, deltaY: number}
  radian!: {x: number, y:number}
  r!: number

  constructor() {
    super();
    this.mouse = {
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      state: MouseState.Free
    };
    this.wheel = {
      deltaX: 0,
      deltaY: 0
    }
    this.radian = {
      x: 35,
      y: 0
    }
    this.r = 280;
    this.factoryOutlineBoxes = [];
    this.machinePositionBoxes = [];
  }

  mounted() {
    this.canvas = <HTMLCanvasElement> document.getElementById('map3d');
    this.width = window.innerWidth;
    this.height = window.innerHeight - 64;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height);
    this.initCameraPos();

    ////////////////////////////////////////////////////////////////////////////////////
    // ラベル付け
    ////////////////////////////////////////////////////////////////////////////////////
    var texture = new THREE.TextureLoader().load('/label_entrance.png',
    (tex) => { // 読み込み完了時
        // 縦横比を保って適当にリサイズ
        const w = 50;
        const h = tex.image.height/(tex.image.width/w);

        // 平面
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial( { map:texture } );
        const plane = new THREE.Mesh( geometry, material );
        plane.scale.set(w, h, 1);
        plane.rotation.x = -90 * (Math.PI / 180);
        plane.position.y = -8;

        plane.position.x = 80;
        plane.position.z = 120;
        self.scene.add( plane );
    });

    var texture2 = new THREE.TextureLoader().load('/label_officew.png',
    (tex) => { // 読み込み完了時
        // 縦横比を保って適当にリサイズ
        const w = 40;
        const h = tex.image.height/(tex.image.width/w);

        // 平面
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial( { map:texture2 } );
        const plane = new THREE.Mesh( geometry, material );
        plane.scale.set(w, h, 1);
        plane.rotation.x = -90 * (Math.PI / 180);
        plane.position.y = -8;

        plane.position.x = -200;
        self.scene.add( plane );
    });

    

    ////////////////////////////////////////////////////////////////////////////////////
    // 工場の壁面
    ////////////////////////////////////////////////////////////////////////////////////
    const outlineBoxPoses = [
      { x: +1, y: 0 },
      { x: 0, y: +1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
    ];
    const outlineBoxLength = 200;
    const outlineBoxHeight = 50;

    for (let i = 0; i < 4; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(10,outlineBoxHeight,outlineBoxLength),
        new THREE.MeshLambertMaterial({color: 0xdddddd})
      );
      box.rotation.y = 90 * (Math.PI / 180) * i;
      box.position.x = box.position.x + outlineBoxPoses[i].x * (outlineBoxLength / 2 - 4);
      box.position.z = box.position.z + outlineBoxPoses[i].y * (outlineBoxLength / 2 - 4);
      box.position.y = outlineBoxHeight / 2 - 8;
      this.factoryOutlineBoxes.push(box);
    }
    const self = this;
    this.factoryOutlineBoxes.forEach(function(factoryOutlineBox) {
      self.scene.add(factoryOutlineBox);
    })
    ////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////
    // 機械の位置
    ////////////////////////////////////////////////////////////////////////////////////
    const machineBoxPoses = [
      { x: +1, z: -1 },
      { x: -1, z: +1 },
      { x: +1, z: +1 }
    ];

    for (let i = 0; i < 3; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(16,16,16),
        new THREE.MeshLambertMaterial({color: 0xff0000})
      );
      box.position.x = box.position.x + machineBoxPoses[i].x * 40;
      box.position.z = box.position.z + machineBoxPoses[i].z * 40;
      box.position.y = 0;
      this.machinePositionBoxes.push(box);
    }
    this.machinePositionBoxes.forEach(function(machinePositionBox) {
      self.scene.add(machinePositionBox);
    })
    ////////////////////////////////////////////////////////////////////////////////////

    const alight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    this.scene.add(alight);
    const light = new THREE.PointLight(0xFFFFFF, 1, 5, 0);
    light.position.set(80, 100, 50);
    light.lookAt(0, 0, 0);
    this.scene.add(light);

    this.tick();
    this.calcScreenPos();
    
    //////////
    this.setEvent();
  }
  tick() {
    if (this.mouse.state != MouseState.Free || this.wheel.deltaY != 0) {
      this.calcCameraPos();
      this.calcScreenPos();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.tick);
  }
  initCameraPos() {
    this.radian = {
      x: 35,
      y: 0
    }
    this.r = 280;
    this.camera.position.set(0, 0, 0);
    this.calcCameraPos();
    this.camera.lookAt(new THREE.Vector3(50, 38, 65));
    requestAnimationFrame(() => {
      this.calcScreenPos(); // For manual reset
    });
  }
  calcCameraPos() {
    const deltaX = this.mouse.lastX! - this.mouse.x!;
    const deltaY = this.mouse.lastY! - this.mouse.y!;
    this.mouse.lastX = this.mouse.x;
    this.mouse.lastY = this.mouse.y;

    this.radian.x = this.radian.x + deltaX * 0.3;
    const radianX = this.radian.x * Math.PI / 180;
    this.radian.y = this.radian.y + deltaY * 0.3;
    const radianY = this.radian.y * Math.PI / 180;

    this.r = this.r + this.wheel.deltaY * 0.05;
    this.wheel.deltaY = 0;

    this.camera.position.x = this.r * Math.sin(radianX);
    this.camera.position.y = this.r * Math.cos(radianY);
    this.camera.position.z = this.r * Math.cos(radianX);
    this.camera.lookAt(new THREE.Vector3(50, 38, 65));
  }
  calcScreenPos() {
    const self = this;
    this.machinePositionBoxes.forEach(function(machinePositionBox, i) {
      const vector = new THREE.Vector3();
      machinePositionBox.updateMatrixWorld();
      vector.setFromMatrixPosition(machinePositionBox.matrixWorld);
      vector.project(self.camera);

      self.machineRenderedPoses[i].x = self.width * ((vector.x + 1.0) / 2);
      self.machineRenderedPoses[i].y = self.height * ((-vector.y + 1.0) / 2);
    });
  }
  setEvent() {
    const self = this;
    this.canvas.oncontextmenu = () => false;
    this.canvas.addEventListener('mousedown', function(event) {
      self.mouse.x = event.clientX;
      self.mouse.y = event.clientY;
      self.mouse.lastX = event.clientX;
      self.mouse.lastY = event.clientY;
      if (event.button == 0) {
        self.mouse.state = MouseState.LeftClick
      } else {
        self.mouse.state = MouseState.RightClick
      }
    });
    this.canvas.addEventListener('mousemove', function(event) {
      if (self.mouse.state != MouseState.Free) {
        self.mouse.x = event.clientX;
        self.mouse.y = event.clientY;
      }
    });
    this.canvas.addEventListener('mouseup', function(event) {
      self.mouse.x = 0;
      self.mouse.y = 0;
      self.mouse.lastX = 0;
      self.mouse.lastY = 0;
      self.mouse.state = MouseState.Free;
    });

    ////////////////////////////////////////////////////////////
    // スクロール

    this.canvas.addEventListener('mousewheel', function(event) {
      self.wheel.deltaY = (event as WheelEvent).deltaY;
    });
  }
}
</script>