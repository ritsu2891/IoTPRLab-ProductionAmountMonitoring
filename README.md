<div align="center" style="vertical-align: center;">
  <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/icon.png" height="80px" />
  <h1>IoTPRLab-ProductionAmountMonitoring</h1>
  <h1>生産個数モニタリングIoTシステム</h1>
  <h2>愛知県IoT推進ラボ 2018-2019</h2><br>
  <div>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/raspberry-pi.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/c-lang.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/dustnet.jpg" height="80px"/>
  </div><br>
  <div>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/mysql.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/Python.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/php.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/laravel.svg" height="80px"/>
  </div><br>
  <div>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/typescript.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/vue.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/vuetify.svg" height="80px" style="margin-right: 10px"/>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/chartjs.svg" height="80px"/>
  </div><br>
  <div>
    <img src="https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/docker.svg" height="80px"/>
  </div>
</div><br>

![動作イメージ](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/web_1_map.png)

## 概要

愛知県IoT推進ラボの活動の一環として開発し、実際に工場に導入した「生産個数モニタリングIoTシステム」です。生産個数を無線で送信し、リアルタイムで記録・表示するというものです。

## 構成

![全体構成](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/arch-whole-b.jpg)

本システムはA. センサによる生産個数のカウントおよび送信(`1_rpi`)、B. カウントの受信および記録(`2_dust_manager`)、C. カウントの表示(`3_web_back`, `4_web_front`)の3つに分かれています。Aについてはシングルボードコンピュータ「Raspberry Pi」を用いて、BおよびCについてはWindows PC上でMySQLのDBに記録してブラウザにより表示するようにしました。データの受信・記録以外については通常のWebアプリケーションと変わりはありません。

### A. センサによる生産個数のカウントおよび送信

Raspberry Piに接続したセンサにより生産個数をカウントし、1分毎の集計を送信しています。センサは物が通過した際に一定時間特定の高さの電圧を出す物でこれを単純にカウントしているだけです。C言語で構築しています。

通信はWiFiではなくアナログ・デバイセズ社の[dust network (SmartMesh)](https://www.analog.com/jp/applications/technology/smartmesh-pavilion-home.html)により行っています。工場内部は様々な機械が稼働している事からWiFiでは通信が難しいのですが、dust networkは複数の通信子機がメッシュ状のネットワークを形成する事により他の通信方式よりも信頼性の高い通信を可能としています。こういった理由からdust networkが使われています。

実際に工場に設置した際は以下のRaspberry Pi・光電センサアンプ・dust networks通信モジュールを一つのボックスにまとめて設置しています。生産機械自体の大幅な改造を必要とせず後付けで取り付けられるようになっています。

![ハードウェアボックス](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/hardware-box.jpeg)


### B. カウントの受信および記録

dust networkにより受信した生産個数のカウントはPythonスクリプトによりMySQLデータベースに保存しています。データは1分毎に来るので1分毎に記録するのですが、同時に1時間毎・1日毎・1ヶ月毎・1年毎の集計も記録しています。これはデータを長い幅で集計して表示する際に集計処理に時間がかかるのを防ぐためです。（例: 1分ごとのデータ1年分: 60\*60\*24\*365=3153600件）

データを更新する事があればこれらの集計データも同時に更新しなければならないので実装が若干面倒になりますが、記録したデータは基本的に変更する事がないためこのようにしています。


### C. カウントの表示

![カウントの表示の構成](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/arch-display.jpg)

カウントの表示はWEBブラウザ上で行います。ブラウザからのデータの取得はAJAXで随時取得して壁画を更新するため、リロード操作は不要で最新のデータが自動的に表示されるようにしています。

バックエンド（=DBからのデータをJSONで包んで応答）はphp + Laravelで構築しています。これは開発当時php + Laravelをよく使っていたからですが、DBからのデータをJSONで包むくらいしかしないのでもっと軽量でシンプルなフレームワークにしたほうが良かったと思います。

フロントエンド（=グラフ等の表示を行う）はTypeScript + Nuxt.jsで構築しており、主にVuetify.jsを用いてUIを作成しました。またグラフ表示にChart.jsを、立体でのマップ表示にThree.jsを用いています。Chart.jsによるグラフは独自実装でマウスによる時間軸の移動や時間軸のスケールの変更などができるようにしています。

## カウントの表示画面

### マップ画面

工場内を俯瞰で見下ろしたイメージで作成した画面です。モニタリングしている機械の位置とそれぞれの生産個数を立体マップで表示しています。

![マップ画面](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/web_1_map.png)

### グラフ画面

生産個数の履歴を折れ線グラフで表示する画面です。この画面では任意の時刻の生産個数の記録を表示する事ができます。また1分以上の集計幅（2分, 3分, 5分…）で、分以外の集計単位（1時間、1日、1ヶ月…）で生産個数を集計してグラフ表示する事もできます。

![グラフ画面](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/web_2_graph.png)

時間軸の移動はテキスト入力・日付・時刻ピッカー（Vuetify.js）やマウス操作で行えます。

![ピッカーによる時間軸移動](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/web_3_movetime.png)

![マウスによる時間軸移動](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/web_4_movetime_mouse.gif)

集計単位の切り替えはボタンを押すか、マウスによりスケールを変更していくと自動的に変わります。

![マウスによる時間スケール変更](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/web_5_changescale.gif)

集計幅の切り替えは文字入力により行えます。

![集計幅の変更](https://raw.githubusercontent.com/ritsu2891/IoTPRLab-ProductionAmountMonitoring/master/md-img/web_6_chunksize.gif)

その他、以下のような機能があります。

- グラフの色の変更
- カウント記録のCSV形式での出力

また、利用イメージを[動画にして公開](https://www.youtube.com/watch?v=WLeKaG5sIhw)していますのでよろしければご覧ください。

## 利用ライブラリ等

### A. センサによる生産個数のカウントおよび送信 (C)

- [SmartMeshSDK C Library](https://github.com/dustcloud/sm_clib)

### B. カウントの受信および記録 (Python)

- [Python SmartMesh SDK](https://github.com/dustcloud/smartmeshsdk)

### C. カウントの表示

#### バックエンド (php)

- [laravel](https://github.com/laravel/laravel)

#### フロントエンド (TypeScript/JavaScript)

- [Nuxt.js](https://github.com/nuxt/nuxt.js)
- [Vue.js](https://github.com/vuejs/vue)
- [Vuetify.js](https://github.com/vuetifyjs/vuetify)
- [Chart.js](https://github.com/chartjs/Chart.js)
- [pixi.js](https://github.com/pixijs/pixi.js)
- [three.js](https://github.com/mrdoob/three.js)
- [luxon](https://github.com/moment/luxon)
- [jfromaniello/url-join](https://github.com/jfromaniello/url-join#readme)
- [boycgit/ts-debounce-throttle](https://github.com/boycgit/ts-debounce-throttle)