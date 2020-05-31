<template>
  <v-app light>
    <v-app-bar app>
      <v-toolbar-title>ネジ生産個数モニタリングシステム</v-toolbar-title>
    </v-app-bar>
    <div style="height: 64px"></div>
    
    <nuxt />
    <v-footer
      :fixed="true"
      app
    >
      <span>&copy; 2019 Ritsuki KOKUBO (dev.rpaka)</span>
      <span style="position: absolute; right: 0; padding-right: 5px;" @click="dialog_about = true">About</span>
    </v-footer>

    <v-dialog v-model="dialog_about" max-width="400">
      <v-card>
        <v-card-title class="headline">About</v-card-title>
        <v-card-text>
          <h2>ネジ生産個数モニタリングシステム<br />WEBクライアント ver2.0</h2>
          <hr style="margin: 10px 0" />
          <p>&copy; 2019 Ritsuki KOKUBO (dev.rpaka)<br />愛知県IoT推進ラボ, 愛知県立大学</p>
          <hr style="margin: 10px 0" />
          <p>このWEBクライアントでは以下のライブラリを用いています。</p>
          <ul>
            <li><b>Vue.js</b>, <a href="https://vuejs.org/">https://vuejs.org/</a></li>
            <li><b>Vuetify.js</b>, <a href="https://vuetifyjs.com/">https://vuetifyjs.com/</a></li>
            <li><b>Luxon</b>, <a href="https://moment.github.io/luxon/">https://moment.github.io/luxon/</a></li>
            <li><b>Chart.js</b>, <a href="https://www.chartjs.org/">https://www.chartjs.org/</a></li>
            <li><b>Three.js</b>, <a href="https://threejs.org/">https://threejs.org/</a></li>
          </ul>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      dialog_about: false
    }
  }

}
</script>
