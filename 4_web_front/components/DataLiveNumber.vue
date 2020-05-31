<template>
  <div>
    <span class="DataLiveNumber__Num" style="line-height: 100%;">{{ liveData }}</span>
    <span class="DataLiveNumber__Dot" :style="{color: dotColor}">●</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DataLiveNumber extends Vue {
  @Prop({default: 0})
  liveData!: number;

  @Prop({default: -1})
  aimData!: number;

  get dotColor(): string {
    let gp: number = 0;
    let rp: number = 0;
    if (this.liveData > this.aimData || this.aimData == -1) {
        gp = 1;
        rp = 0;
    } else if (this.liveData > this.aimData / 2) {
        gp = 1;
        rp = 1 - (this.liveData - (this.aimData / 2)) / (this.aimData - (this.aimData / 2));
    } else {
        gp = this.liveData / (this.aimData / 2);
        rp = 1;
    }
    const rgb = [
        220 * rp,
        220 * gp,
        0
    ];
    return `rgb(${rgb.join(',')})`;
  }
}
</script>
<style lang="scss">
.DataLiveNumber {
  &__Num {
    font: {
      size: 80px
    }
  }
}
</style>
