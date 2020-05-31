<template>
  <div class="PageTitle">
    <v-row align="center">
      <v-col md="auto">
        <div class="PageTitle__dcr">　</div>
      </v-col>
      <v-col md="auto">
        <h1 class="PageTitle__title">{{title}}</h1><br v-if="subtitle" />
        <span v-if="subtitle">{{subtitle}}</span>
      </v-col>
      <v-col md="auto">
        <span class="PageTitle__dcr">　</span>
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class PageTitle extends Vue {
  @Prop({default: "----------"})
  title!: String;

  @Prop({default: null})
  subtitle!: String;
}
</script>
<style lang="scss">
.PageTitle {
  height: 100%;
  &__dcr {
    width: 10px;
    height: 70px;
    background-color: black;
    display: inline-block;
  }
  &__title, &__content {
    display: inline-block;
  }
}
</style>