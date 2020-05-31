<template>
  <div class="DataMetaInfo">
    <div><v-icon large class="DataMetaInfo__icon">mdi-cogs</v-icon>{{machineName}}</div>
    <div><v-icon large class="DataMetaInfo__icon">mdi-clock-outline</v-icon>{{dateTime}}</div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DataMetaInfo extends Vue {
  @Prop({default: "-----"})
  machineName!: String;

  @Prop({default: "-----"})
  dateTime!: String;
}
</script>
<style lang="scss">
.DataMetaInfo {
  & * {
    font: {
      size: 17px;
    }
  }
  &__icon {
    padding-right: 5px;
  }
}
</style>