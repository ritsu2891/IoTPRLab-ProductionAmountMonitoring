<template>
  <div class="FPSwitch row">
    <div
      :class="{ 'FPSwitch__item': true, 'FPSwitch__item--vertical': vertical, 'FPSwitch__item--active': item.id == value, 'col': !vertical, 'col-12': vertical}"
      v-for="item in items"
      :key="item.id"
      :id="`switem${id}${item.id}`"
      v-on:click="changeLinkHilight(item.id, true)"
    >{{item.label}}</div>
    <div class="FPSwitch__hilight" :id="`FPSwitchHilighter${id}`"></div>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      activeId: 0,
      id: this._uid
    };
  },
  props: { value: {}, items: {}, vertical: { type: Boolean, default: false } },
  mounted: function() {
    this.activeId = this.value;
    this.changeLinkHilight(this.activeId, false);
  },
  methods: {
    changeLinkHilight: function(id, animate) {
      const padding = 0;

      const hilighter = document.getElementById(`FPSwitchHilighter${this.id}`);
      const targetLink = document.getElementById(`switem${this.id}${id}`);

      let tX = hilighter.style.transform.match(/translateX\((-?[0-9.]+)(px)\)/);
      let tY = hilighter.style.transform.match(/translateY\((-?[0-9.]+)(px)\)/);
      tX = tX ? parseInt(tX[1]) : 0;
      tY = tY ? parseInt(tY[1]) : 0;

      if (animate) {
        hilighter.style.transition = "all 200ms ease";
      } else {
        hilighter.style.transition = "";
      }

      hilighter.style.width = `${targetLink.clientWidth + padding * 2}px`;
      hilighter.style.height = `${targetLink.clientHeight + padding * 2}px`;

      const diffX =
        targetLink.clientWidth -
        hilighter.clientWidth +
        tX +
        targetLink.getBoundingClientRect().left -
        hilighter.getBoundingClientRect().left +
        padding;

      const diffY =
        targetLink.clientHeight -
        hilighter.clientHeight +
        tY +
        targetLink.getBoundingClientRect().top -
        hilighter.getBoundingClientRect().top +
        padding;

      hilighter.style.transform = `translateX(${diffX}px) translateY(${diffY}px)`;
      hilighter.style.background = this.items[id].color;

      this.activeId = id;
      this.$emit("input", this.activeId);
    }
  }
};
</script>
<style lang="scss">
.FPSwitch {
  position: relative;
  &__item {
    font-size: 45px;
    transition: all 200ms ease;
    z-index: 6;

    & + & {
      margin-left: 20px;
    }

    &--vertical + &--vertical {
      margin-left: 0;
    }
  }
  &__item--active {
    color: white;
    font-weight: 800;
  }
  &__hilight {
    position: absolute;
    right: 0;
    height: 0px;
    width: 0px;
    // background: linear-gradient(to bottom, #22b09c 0%, #00b050 100%);
    z-index: 5;
  }
}
</style>