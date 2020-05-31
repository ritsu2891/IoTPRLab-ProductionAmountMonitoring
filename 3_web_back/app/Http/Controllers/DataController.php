<?php
/*
Copyright (c) 2018-2019, Ritsuki KOKUBO. All rights reserved.
*/
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class DataController {
  private $HOW_MANY = 4320;

  //レイヤ1 DBから取得
  private function _getData($moteMacAddr = null, $limitNum = false, $id = null, $startDate = null, $endDate = null) {
    $data = DB::table('data_table');
    if ($moteMacAddr != null) {
      $data = $data->where('moteMacAddr', '=', $moteMacAddr);
    }
    if ($id != null) {
      $data = $data->where('id', '>', $id);
    }
    if ($startDate != null && $endDate != null) {
      $data = $data
      ->where('datetime', '>=', date_create($startDate))
      ->where('datetime', '<=', date_create($startDate));
    }
    if ($limitNum) {
      return $data
        ->latest('id')
        ->take($this->HOW_MANY)
        ->get()
        ->sortBy('id')
        ->values();
    } else {
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
  public function all($moteMacAddr) {
    return $this->_json($this->_getData($moteMacAddr));
  }
  
  public function init($moteMacAddr) {
    return $this->_json($this->_getData($moteMacAddr, true));
  }

  public function new($moteMacAddr, $id) {
    return $this->_json($this->_getData($moteMacAddr, false, $id));
  }

  public function daterange($startDate, $endDate) {
    return $this->_json($this->_getData(null, false, null, $startDate, $endDate));
  }

  public function csv() {
    return $this->_csv(
      $this->_getData()->toArray(),
      date('Ymd')."-all.csv"
    );
  }

  public function csvdr($startDate, $endDate) {
    return $this->_csv(
      $this->_getData(null, false, null, $startDate, $endDate)->toArray(),
      date('Ymd')."-daterange-".$startDate."-to-".$endDate.".csv"
    );
  }
}