@extends('layout')
@section('title', 'CSVダウンロード')
@section('css')
<link rel="stylesheet" href="/css/bootstrap.min.css">
<link rel="stylesheet" href="/css/bootstrap-datepicker.min.css">
<link rel="stylesheet" href="/css/font-awesome.min.css">
@endsection
@section('content')
<div class="container" style="margin: 30px auto; width: 600px;">
  <h1>CSVダウンロード</h1>
  <form class="form-horizontal">
    <div class="form-group row">
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="type" id="typeAll" value="all" checked>
        <label class="form-check-label" for="typeAll">全データ</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="type" id="typeDateRange" value="daterange">
        <label class="form-check-label" for="typeDateRange">日付指定</label>
      </div>
    </div>
    <div class="form-group row" id="datepicker-daterange">
      <label class="col-sm-3 control-label">日付</label>
      <div class="col-sm-9 form-inline">
        <div class="input-daterange input-group" id="datepicker">
          <input type="text" class="input-sm form-control" name="start" />
          <div class="input-grou-prepend"><div class="input-group-text">から</div></div>
          <input type="text" class="input-sm form-control" name="end" />
        </div>
      </div>
      <button type="button" class="btn btn-primary" id="dlbtn">ダウンロード</button>
    </div>
  </form>
</div>
@endsection
@section('js')
<script type="text/javascript" src="/js/bootstrap.bundle.js"></script>
<script type="text/javascript" src="/js/bootstrap-datepicker.min.js"></script>
<script type="text/javascript" src="/js/bootstrap-datepicker.ja.min.js"></script>
<script type="text/javascript" src="/js/csv.js"></script>
@endsection