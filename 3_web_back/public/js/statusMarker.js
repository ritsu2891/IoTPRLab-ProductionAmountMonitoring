/*
Copyright (c) 2018-2019,
Ritsuki KOKUBO (dev.rpaka),
IoT Promotion Lab,
Aichi Prefectural University.
All rights reserved.
*/

function updateStatusMarker(i) {
    ctx = `#statusMarker${i}`;
    value = datasets[i].data[datasets[i].data.length - 1];
    normalValue = normalCount;
    if (value > normalValue) {
        gp = 1;
        rp = 0;
    } else if (value > normalValue / 2) {
        gp = 1;
        rp = 1 - (value - (normalValue / 2)) / (normalValue - (normalValue / 2));
    } else {
        gp = value / (normalValue / 2);
        rp = 1;
    }
    rgb = [
        parseInt(220 * rp),
        parseInt(220 * gp),
        0
    ];
    $(ctx).css("color", `rgb(${rgb.join(',')})`);
}