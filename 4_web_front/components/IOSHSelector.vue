<template>
  <div class="iOSHSelector" :style="style">
    <v-row style="border-radius: 5px; margin: 0; background-color: #dddddd;">
      <v-col
        v-for="(link, index) in links"
        :key="`menuLink${index}`"
        :id="`iOSHSelectorItem${id}${link.id}`"
        class="iOSHSelector__item"
        align="center"
        @click="onButtonClicked(link)"
      >
        <v-icon v-if="!fold && link.icon" color="black" large>{{link.icon}}</v-icon>
        <span v-if="!fold && link.txt" class="iOSHSelector__itemText">{{link.txt}}</span>
      </v-col>
      <div v-if="!fold" class="iOSHSelector__hilighter elevation-3" :id="`iOSHSelectorHilighter${id}`"></div>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';

@Component
export default class iOSHSelector extends Vue {
  @Prop({default: false})
  vertical!: Boolean;

  @Prop({default: 500})
  length!: number;

  @Prop({default: 80})
  width!: number;

  @Prop()
  id!: number;

  fold: boolean = false;

  @Prop()
  links!: Object[];

  @Prop()
  value!: string

  @Prop({default: true})
  gAnimation!: boolean
  
  get styleH() { return {
    height: `${this.width}px`,
    padding: `5px`,
  }};

  get styleV() { return {
    height: `${this.length}px`,
  }};

  get style() {
    let style = this.vertical ? this.styleV : this.styleH;
    if (this.fold) {
      style = Object.assign({}, style);
      style = Object.assign(style, {"width": "140px"});
    }
    return style;
  };

  mounted() {
    this.changeLinkHilight(this.value, false);
  }

  @Watch('value')
  onPropValueChange(value: string) {
    this.changeLinkHilight(value, true);
  }

  pushRoute(link: any) {
    if (link) {
      this.$router.push(link);
    }
  }

  changeLinkHilight(id: string, animate: boolean) {
    const paddingX = -8;
    const paddingY = -8;

    const hilighter = document.getElementById(`iOSHSelectorHilighter${this.id}`);
    const targetLink = document.getElementById(`iOSHSelectorItem${this.id}${id}`);

    if (!targetLink) {
      return;
    }

    let tXr = hilighter!.style.transform.match(/translateX\((-?[0-9.]+)(px)\)/);
    let tYr = hilighter!.style.transform.match(/translateY\((-?[0-9.]+)(px)\)/);
    const tX = tXr ? parseInt(tXr[1]) : 0;
    const tY = tYr ? parseInt(tYr[1]) : 0;

    hilighter!.style.width = `${targetLink!.clientWidth + paddingX * 2}px`;
    hilighter!.style.height = `${targetLink!.clientHeight + paddingY * 2}px`;

    requestAnimationFrame(() => {
      if (animate &&  this.gAnimation) {
        hilighter!.style.transition = "all 200ms ease";
      } else {
        hilighter!.style.transition = "";
      }

      const diffX =
        targetLink!.clientWidth -
        hilighter!.clientWidth +
        tX +
        targetLink!.getBoundingClientRect().left -
        hilighter!.getBoundingClientRect().left +
        paddingX;

      const diffY =
        targetLink!.clientHeight -
        hilighter!.clientHeight +
        tY +
        targetLink!.getBoundingClientRect().top -
        hilighter!.getBoundingClientRect().top +
        paddingY;

      hilighter!.style.transform = `translateX(${diffX}px) translateY(${diffY}px)`;
    });

    // hilighter!.style.transform = `translateX(${diffX}px)`;
    // hilighter!.style.background = this.items[id].color;

    // this.activeId = id;
    // this.$emit("input", this.activeId);
  }

  @Emit('input')
  onSeletItemChnage(value: string) {
    return value;
  }

  onButtonClicked(link: any) {
    this.changeLinkHilight(link.id, true);
    this.onSeletItemChnage(link.id);
    if (link.href) this.pushRoute(link.href);
  }
}
</script>
<style lang="scss">
.iOSHSelector {
  border-radius: 5px;
  transition: all 500ms ease-in-out;
  overflow: hidden;

  &__item {
    z-index: 6;
  }

  &__itemText {
    font-size: 25px;
  }

  &__hilighter {
    position: absolute;
    right: 0;
    height: 0px;
    width: 0px;
    // background: linear-gradient(to bottom, #22b09c 0%, #00b050 100%);
    background: white;
    z-index: 5;
    border-radius: 5px;
  }
}
</style>