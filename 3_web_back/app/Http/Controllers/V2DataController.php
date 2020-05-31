<?php
/*
Copyright (c) 2018-2019, Ritsuki KOKUBO. All rights reserved.
*/
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use \Exception;

class V2DataController {
  //レイヤ1 DBから取得
  private function _getData($moteMacAddr = null, $limitNum = null, $id = null, $startDate = null, $endDate = null, $range = 'minutes') {
    //データソースの切り替え
    if ($range == 'minutes') {
      $tableName = 'data_table';
    } else if (in_array($range, array('hours', 'days', 'months', 'years'))) {
      $tableName = sprintf("data_%s_table", $range);
    } else {
      throw new Exception(sprintf("DataController#_getData() <Layer1> : Invalid range type: %s", $range));
    }
    $data = DB::table($tableName);

    // \Log::debug(sprintf("%s %s %s", $tableName, $startDate, $endDate));

    //モートアドレスによる絞り込み
    if ($moteMacAddr != null) {
      $data = $data->where('moteMacAddr', '=', $moteMacAddr);
    }

    //IDによる絞り込み
    if ($id != null) {
      $data = $data->where('id', '>', $id);
    }

    //日時による絞り込み
    if ($startDate != null) {
      $data = $data->where('datetime', '>=', date_create($startDate));
    }
    if ($endDate != null) {
      $data = $data->where('datetime', '<=', date_create($endDate));
    }

    //レコード数の制限
    if ($limitNum) {
      \Log::debug($data->toSql());
      \Log::debug($data->getBindings());
      return $data
        ->latest('datetime')
        ->take($limitNum)
        ->get()
        ->sortBy('datetime')
        ->values();
    } else {
      \Log::debug($data->toSql());
      \Log::debug($data->getBindings());
      return $data->get();
    }
  }

  //レイヤ2 データ形式
  private function _json($data) {
    return response()->json($data);
  }

  private function _csv($datas, $filename) {
    $stream = fopen('php://temp', 'w');
    array_unshift($datas, ['id', 'data', 'moteMacAddr', 'datetime']);
    foreach ($datas as $data) {
      $data = (array) $data;
      fputcsv($stream, $data);
    }
    rewind($stream); //ポインタ先頭へ
    $csv = mb_convert_encoding(
      str_replace(PHP_EOL, "\r\n", stream_get_contents($stream)),
      'SJIS',
      'UTF-8'
    );
    $headers = [
      'Content-Type' => 'text/csv',
      'Content-Disposition' => 'attachment; filename="'.$filename.'"'
    ];
    return \Response::make($csv, 200, $headers);
  }

  //レイヤ3 API
  public function all($startDate, $endDate, $range) {
    return $this->_json($this->_getData(null, null, null, $startDate, $endDate, $range));
  }

  public function latest($howMany, $moteMacAddr = null, $startDate = null) {
    if ($startDate != null) {
      $startDate = date_create($startDate)->modify('+1 sec')->format(\DateTime::ATOM);
    }
    return $this->_json($this->_getData($moteMacAddr, $howMany, null, $startDate, null));
  }

  public function csv() {
    return $this->_csv(
      $this->_getData()->toArray(),
      date('Ymd')."-all.csv"
    );
  }

  public function csvdr($startDate, $endDate, $range) {
    return $this->_csv(
      $this->_getData(null, false, null, $startDate, $endDate, $range)->toArray(),
      $startDate."-".$endDate."_".$range.".csv"
    );
  }
}