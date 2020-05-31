@extends('layout')
@section('title', 'グラフ画面')
@section('content')
<div class="graphWrapper">
  <canvas id="graph0"></canvas>
</div>
<div class="graphWrapper">
  <canvas id="graph1"></canvas>
</div>
<div class="graphWrapper">
  <canvas id="graph2"></canvas>
</div>
@endsection
@section('js')
<script type="text/javascript" src="/js/app.js"></script>
@endsection