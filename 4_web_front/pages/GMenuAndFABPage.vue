<template>
  <div>
    <slot></slot>
    <div class="l-quickActionArea">
      <IOSHSelector
        :id="1"
        :length="350"
        :links="viewSelectorItem"
        v-model="viewSelectorSelectedItem"
        class="ViewSelector"
        :g-animation="false"
      />
      <slot name="QuickActionArea"></slot>
      <v-text-field label="集計幅" filled height="58px" style="display: inline-block; width: 120px; position: relative; top: -31px; margin-left: 5px; visibility: hidden;"></v-text-field>
    </div>
    <div class="l-floatingActionArea">
      <v-speed-dial
        v-model="fab"
        :bottom="true"
        :right="true"
        direction="top"
        :open-on-hover="true"
      >
        <template v-slot:activator>
          <v-btn v-model="fab" large color="blue darken-2" dark fab>
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon v-else>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
        <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-btn fab small dark color="green" v-on="on" @click.stop="onSettingModalOpen()">
            <v-icon>mdi-settings</v-icon>
          </v-btn>
        </template>
        <span>設定</span>
      </v-tooltip>
        <slot name="FABActions"></slot>
      </v-speed-dial>
    </div>

    <!-- 設定モーダル -->
    <v-dialog v-model="dialog_setting" max-width="900">
      <v-card>
        <v-card-title class="headline">設定</v-card-title>
        <v-card-text>
          <div v-for="(addr, i) in settings.moteMacAddrs" :key="`machineProfileField${i}`">
            <v-row>
              <v-col>
                <v-text-field label="ラベル" v-model="machineProfiles[addr].name"></v-text-field>
              </v-col>
              <v-col>
                <v-text-field label="正常時生産個数（/分）" v-model="machineProfiles[addr].goalCount"></v-text-field>
              </v-col>
              <v-col>
                <v-color-picker hide-canvas hide-inputs v-model="machineProfiles[addr].color" mode="hexa"></v-color-picker>
              </v-col>
            </v-row>
          </div>
          <v-text-field label="一覧画面のグラフ表示データ数" v-model="nGraphPlot"></v-text-field>
          <div align="right">
            <v-btn color="gray" @click="dialog_setting = false;">キャンセル</v-btn>
            <v-btn color="primary" @click="onSettingModalSubmit()">保存して適用</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import IOSHSelector from '~/components/IOSHSelector.vue'
import { SettingRepositoryImpl, SettingRepository } from '~/logics/Repositories'

@Component({components: {IOSHSelector}})
export default class GMenuAndFABPage extends Vue {
  fab: boolean = false;
  dialog_setting: boolean = false;

  settings: SettingRepository = new SettingRepositoryImpl();
  moteMacAddrs: string[] = this.settings.moteMacAddrs;
  machineProfiles: {[addr: string]: {name: string, color: string, goalCount: number}} = this.settings.machineProfile;
  nGraphPlot: number = this.settings.nGraphPlot;

  viewSelectorItem: Object[] = [
    {
      id: 'first',
      icon: "mdi-map-search",
      href: "/"
    },
    {
      id: 'second',
      icon: "mdi-chart-line",
      href: "/detail"
    }
  ]
  viewSelectorSelectedItem: string = 'second';

  @Prop()
  viewSelect!: string

  constructor() {
    super();
    this.viewSelectorSelectedItem = this.viewSelect;
  }

  onSettingModalOpen() {
    this.nGraphPlot = this.settings.nGraphPlot;
    this.machineProfiles = this.settings.machineProfile;
    this.dialog_setting = true;
  }

  onSettingModalSubmit() {
    this.settings.nGraphPlot = this.nGraphPlot;
    this.settings.machineProfile = this.machineProfiles;
    location.reload();
  }
}
</script>
<style lang="scss">
// Layout

.l-quickActionArea {
  position: fixed;
  bottom: 10px;
  left: 20px;
}

.l-floatingActionArea {
  position: fixed;
  bottom: 60px;
  right: 20px;
}

.ViewSelector {
  display: inline-block;
  width: 300px;
}
</style>