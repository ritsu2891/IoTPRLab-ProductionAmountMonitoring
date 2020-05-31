<template>
  <div class="MenuButtonPalette" :style="style">
    <div v-if="!vertical" style="height: 100%; position: relative;">
      <v-row :style=" {'height': '100%',} ">
        <!-- 'width': `${length - width}px` -->
        <v-col md="auto">
          View<v-icon color="black" large @click="fold=!fold">mdi-chevron-right</v-icon>
        </v-col>
        <v-col style="padding: 0;">
          <v-row style="background: #dddddd; border-radius: 5px;">
            <v-col
              v-for="(link, index) in links"
              :key="`menuLink${index}`"
              :id="`MenuButtonPaletteItem${id}${link.id}`"
              class="MenuButtonPalette__item"
              align="center"
              @click="changeLinkHilight(link.id, true)"
            >
              <v-icon v-if="!fold" color="black" large>{{link.icon}}</v-icon>
            </v-col>
            <div v-if="!fold" class="MenuButtonPalette__hilighter elevation-3" :id="`MenuButtonPaletteHilighter${id}`"></div>
          </v-row>
        </v-col>
      </v-row>
    </div>

    <div v-if="vertical">
      <v-row align="center" v-for="(link, index) in links" :key="`menuLink${index}`">
        <v-col align="center">
          <v-icon color="black" large>{{link.icon}}</v-icon>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MenuButtonPalette extends Vue {
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
  
  get styleH() { return {
    height: `${this.width}px`,
    padding: `5px`,
    // width: `${this.length}px`,
    // padding: `10px ${this.width / 2}px`
  }};

  get styleV() { return {
    height: `${this.length}px`,
    // width: `${this.width}px`,
    // padding: `${this.width / 2}px 10px`
  }};

  get style() {
    let style = this.vertical ? this.styleV : this.styleH;
    if (this.fold) {
      style = Object.assign({}, style);
      style = Object.assign(style, {"width": "140px"});
    }
    return style;
  };

  changeLinkHilight(id: string, animate: boolean) {
      const paddingX = -5;
      const paddingY = -5;

      const hilighter = document.getElementById(`MenuButtonPaletteHilighter${this.id}`);
      const targetLink = document.getElementById(`MenuButtonPaletteItem${this.id}${id}`);

      let tXr = hilighter!.style.transform.match(/translateX\((-?[0-9.]+)(px)\)/);
      let tYr = hilighter!.style.transform.match(/translateY\((-?[0-9.]+)(px)\)/);
      const tX = tXr ? parseInt(tXr[1]) : 0;
      const tY = tYr ? parseInt(tYr[1]) : 0;

      if (animate) {
        hilighter!.style.transition = "all 200ms ease";
      } else {
        hilighter!.style.transition = "";
      }

      hilighter!.style.width = `${targetLink!.clientWidth + paddingX * 2}px`;
      hilighter!.style.height = `${targetLink!.clientHeight + paddingY * 2}px`;

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
      // hilighter!.style.transform = `translateX(${diffX}px)`;
      // hilighter!.style.background = this.items[id].color;

      // this.activeId = id;
      // this.$emit("input", this.activeId);
    }
}
</script>
<style lang="scss">
.MenuButtonPalette {
  background-color: rgb(245, 245, 245);
  border-radius: 5px;
  transition: all 500ms ease-in-out;
  overflow: hidden;

  &__item {
    z-index: 6;
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