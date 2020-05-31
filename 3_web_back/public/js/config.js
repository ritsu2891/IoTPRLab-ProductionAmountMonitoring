/*
Copyright (c) 2018-2019,
Ritsuki KOKUBO (dev.rpaka),
IoT Promotion Lab,
Aichi Prefectural University.
All rights reserved.
*/

var n = 3;
var moteMacAddrs = [];
var posLabel = [];
var normalCount = 10;
var REMAIN_SIZE = 0;

initConfig();
initConfigWindow();

function initConfig() {
    moteMacAddrs = tryLocalStorage(
        'moteMacAddrs',
        [
            'dm01',
            'dm02',
            'dm03'
        ]
    );
    n = moteMacAddrs.length;
    posLabel = tryLocalStorage(
        'posLabel',
        [
            'マシンA',
            'マシンB',
            'マシンC'
        ]
    );
    normalCount = Number(tryLocalStorage(
        'normalCount',
        10
    ));
    REMAIN_SIZE = Number(tryLocalStorage(
        'graphMax',
        10
    ))
}

function tryLocalStorage(key, source) {
    if (localStorage.getItem(key) == null) {
        dest = source;
        localStorage.setItem(key, JSON.stringify(source));
    } else {
        dest = JSON.parse(localStorage.getItem(key));
    }
    return dest;
}

function saveLocalStroage(key, source) {
    localStorage.setItem(key, JSON.stringify(source));
}

function initConfigWindow() {
    $('#config__macAddr').val(moteMacAddrs.join('\n'));
    $('#config__posLabel').val(posLabel.join('\n'));
    $('#config__normalCount').val(normalCount);
    $('#config__graphMax').val(REMAIN_SIZE);
    $('#config__save').on('click', function () {saveConfig(); $('.config').hide();});
}

function saveConfig() {
    moteMacAddrs = $('#config__macAddr').val().split('\n');
    posLabel = $('#config__posLabel').val().split('\n');
    normalCount = Number($('#config__normalCount').val());
    REMAIN_SIZE = Number($('#config__graphMax').val());
    saveLocalStroage('moteMacAddrs', moteMacAddrs);
    saveLocalStroage('posLabel', posLabel);
    saveLocalStroage('normalCount', normalCount);
    saveLocalStroage('graphMax', REMAIN_SIZE);
    location.reload();
}