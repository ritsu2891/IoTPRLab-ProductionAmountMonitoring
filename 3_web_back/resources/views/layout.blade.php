<!doctype html>
<html lang="{{ app()->getLocale() }}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/css/material.min.css">
    <link rel="stylesheet" type="text/css" href="/css/material-icons.css">
    <link rel="stylesheet" type="text/css" href="/css/app.css">
    @yield('css')
    <script type="text/javascript" src="/js/Chart.bundle.min.js"></script>
    <script type="text/javascript" src="/js/jquery-3.3.1.min.js"></script>
    <script type="text/javascript" src="/js/material.min.js"></script>
    <script type="text/javascript" src="/js/fabric.min.js"></script>
    <script type="text/javascript" src="/js/getData.js"></script>
    <script type="text/javascript" src="/js/statusMarker.js"></script>
    <title>生産個数モニタリング - @yield('title')</title>
  </head>
  <body>
    <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
      <header class="mdl-layout__header">
        <div class="mdl-layout__header-row">
          <span class="mdl-layout-title">愛知県立大学 IoT推進ラボ<br />生産個数モニタリング - @yield('title')</span>
          <div class="mdl-layout-spacer"></div>
          <nav class="mdl-navigation mdl-layout--large-screen-only">
            <a class="mdl-navigation__link" href="/">グラフ</a>
            <a class="mdl-navigation__link" href="/dev">一覧</a>
            <a class="mdl-navigation__link" href="/csv">CSV</a>
            <a class="mdl-navigation__link" onclick="$('.config').show()">設定</a>
            <a class="mdl-navigation__link" href="/Manual.pdf">マニュアル</a>
            <a class="mdl-navigation__link" href="/about">About</a>
          </nav>
        </div>
      </header>
      
      <main class="mdl-layout__content">
        @yield('content')
      </main>

      @component('config')@endcomponent
    </div>
  </body>

  <script type="text/javascript" src="/js/config.js"></script>
  @yield('js')
</html>