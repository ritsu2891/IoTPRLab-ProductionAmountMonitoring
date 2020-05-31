<div class="config mdl-shadow--6dp">
<h3>設定</h3>
<form action="#">
  <b>モートMACアドレス<br />(通常時は触らないで下さい)</b>
  <div class="mdl-textfield mdl-js-textfield">
    <textarea class="mdl-textfield__input" type="text" rows= "3" id="config__macAddr" ></textarea>
    <label class="mdl-textfield__label" for="config__macAddr">モートMACアドレス</label>
  </div>
  <b>データ取得位置の名前</b>
  <div class="mdl-textfield mdl-js-textfield">
    <textarea class="mdl-textfield__input" type="text" rows= "5" id="config__posLabel" ></textarea>
    <label class="mdl-textfield__label" for="config__posLabel">データ取得位置の名前</label>
  </div>
  <b>「グラフ画面」<br />グラフのデータ表示個数（最大）</b>
  <div class="mdl-textfield mdl-js-textfield">
    <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="config__graphMax">
    <label class="mdl-textfield__label" for="config__graphMax">データ表示個数</label>
    <span class="mdl-textfield__error">数字を入力して下さい</span>
  </div>
  <b>「一覧画面」<br />基準のネジ個数</b>
  <div class="mdl-textfield mdl-js-textfield">
    <input class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="config__normalCount">
    <label class="mdl-textfield__label" for="config__normalCount">基準のネジ個数</label>
    <span class="mdl-textfield__error">数字を入力して下さい</span>
  </div>
</form>
<div align="right">
<button id="config__save" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect">
  保存して閉じる
</button>
</div>
</div>