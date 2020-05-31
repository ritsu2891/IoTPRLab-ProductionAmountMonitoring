/*
Copyright (c) 2018-2019,
Ritsuki KOKUBO (dev.rpaka),
IoT Promotion Lab,
Aichi Prefectural University.
All rights reserved.
*/

var datasets = [];
var interval = 3 * 1000; //[ms]

function initDatasets() {
    for (i=0; i<n; i++) {
        datasets.push({
            data: [], // Counts of screws (Value)
            label: [], // When data arrives (Date & Time)
            lastid: -1,
            moteMacAddr: moteMacAddrs[i],
        });
    }
}

function configDataFetch(cb) {
    window.setInterval(function() {
        for (i=0; i<n; i++) {
            getNewData(datasets[i]);
        }
        cb();
    }, interval);
}

function _getData(uri, datasets) {
	$.ajax({
	  url: uri,
      type: "GET",
      async: true,
      data: null,
      dataType: "json",
      success : function(result) {
    	Object.keys(result).forEach(function(key) {
    	  if (result[key].data >= 0) {
            datasets.label.push(new Date(result[key].datetime));
            datasets.data.push(result[key].data);
            datasets.lastid = result[key].id;
        }
      });
    }
  });
}

//画面に収まるデータ分だけ全て取得
function getInitData(datasets) {
    _getData(`/data/init/${datasets.moteMacAddr}`, datasets);
}
  
//全データの取得
function getAllData(datasets) {
    _getData(`/data/all/${datasets.moteMacAddr}`, datasets);
}
  
//新しいデータの取得
function getNewData(datasets) {
    _getData(`/data/new/${datasets.moteMacAddr}/${datasets.lastid}`, datasets);
}

//データ個数の調節
function reduceData(data, remain) {
    if (data.length > remain) {
        data.splice(0, data.length - remain);
    }
  }

function formatDate(date, format) {
    if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    if (format.match(/S/g)) {
        var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
    }
    return format;
};

function formatMacAddr(addr) {
    var raddr = addr.slice(-4);
    return raddr.slice(0, 2).toUpperCase() + '-' + raddr.slice(2, 4).toUpperCase();
}