/*
Copyright (c) 2018-2019,
Ritsuki KOKUBO (dev.rpaka),
IoT Promotion Lab,
Aichi Prefectural University.
All rights reserved.
*/

REMAIN_SIZE = 10;

pos = {};
pos.base = {x: 100, y: 30};
pos.entrance = {x: pos.base.x + 669, y: pos.base.y + 572};
pos.targets = [
    {x: pos.base.x + 545, y: pos.base.y + 150}, //右上
    {x: pos.base.x + 380, y: pos.base.y + 475}, //右下
    {x: pos.base.x + 50, y: pos.base.y + 250}, //左下
];

var targets = [];
var canvas = initMap('myCanvas');
var myCharts = [];
initDatasets();
for (i=0; i<n; i++) {
    initDataWindow(i);
}
configDataFetch(function() {
    for (var i=0; i<n; i++) {
        reduceData(datasets[i].label, REMAIN_SIZE);
        reduceData(datasets[i].data, REMAIN_SIZE);
        myCharts[i].update();
        updateDataWindow(i);
        updateStatusMarker(i);
    }
});

function initMap(id) {
    var canvas = new fabric.Canvas(id);
    fabric.Image.fromURL('images/mapi.jpg', function(oImg) {
        oImg.left = pos.base.x;
        oImg.top = pos.base.y;
        canvas.add(oImg);

        drawRect(canvas);
    });
    

      $('.canvas-container').css('margin', '0 auto');

      return canvas;
}

function drawRect(canvas) {
    var base = new fabric.Rect({
        left: pos.base.x,
        top: pos.base.y,
        fill: 'rgba(0,0,0,0)',
        // strokeWidth: 2, stroke: 'rgb(0,0,0)',
        width: 800,
        height: 600,
        hasControls: false,
    });
    var entrance = new fabric.Rect({
        left: pos.entrance.x,
        top: pos.entrance.y,
        fill: 'rgba(255,255,255)',
        strokeWidth: 2, stroke: 'rgb(0,0,0)',
        width: 100,
        height: 50,
        hasControls: false,
    });
      
      for (var i=0; i<3; i++) {
          targets.push(new fabric.Rect({
              left: pos.targets[i].x,
              top: pos.targets[i].y,
              fill: "rgb(255, 0, 0)",
              width: 50,
              height: 50,
              hasControls: false,
          }));
      }
      
    //   var lbl_entrance = new fabric.Text("入口", {
    //       left: pos.entrance.x + 20,
    //       top: pos.entrance.y + 10,
    //       fontSize: 30
    //   });
      
      canvas.add(base);
    //   canvas.add(entrance);
      for (var i=0; i<3; i++) {
          canvas.add(targets[i]);
          targets[i].on('mousedown', function (options) {
              if (options.e.target) {
                  console.log(options.e);
              }
          });
      }
    //   canvas.add(lbl_entrance);
}

function initDataWindow(i) {
    var template = `
    <div id="ti${i}" class="mdl-shadow--4dp dataWindow">
        <div class="dataWindow__chart">
            <canvas id="myChart${i}"></canvas>
        </div>
        <div class="dataWindowInfo">
            <h1 id="ti${i}-value" class="dataWindowInfo__value">--</h1>
            <span id="statusMarker${i}" class="dataWindowInfo__status">●</span>
            <div class="dataWindowInfo__note">
                <span id="ti${i}-posLabel">${posLabel[i]}</span><br />
                <span id="ti${i}-addr">${formatMacAddr(moteMacAddrs[i])}</span><br />
                <span id="ti${i}-datetime">--:--</span>
            </div>
        </div>
        <div align="center">
            <button class="mdl-button mdl-js-button mdl-js-ripple-effect" onclick="location.href='/#graph${i}'">
                詳細を見る
            </button>
        </div>
    </div>
    `
    $('main').append(template);
    ti = $(`#ti${i}`);
    ti.offset({
        left: $('#myCanvas').offset().left + pos.targets[i].x + 25,
        top: $('#myCanvas').offset().top + pos.targets[i].y + 25
    });

    var ctx = document.getElementById(`myChart${i}`).getContext('2d');
    var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: datasets[i].label,
        datasets: [{
            data: datasets[i].data,
            borderColor: "rgb(0, 0, 0)",
            borderWidth: 5,
            fill: false,
        }]
    },
    options: {
        maintainAspectRatio: false,
        layout: {
            padding: 30,
        },
        legend: {
            display: false,
        },
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    min: 0,
                    stepSize: 1,
                }
            }],
            xAxes: [{
                display: false,
            }],
        }
    }
    });

    myCharts.push(myChart);
}

function updateDataWindow(i) {
    // console.log(datasets[i])

    n = datasets.length;
    if (n < 1 || datasets[i].lastid < 0) {
        val = '--';
        dt = '-----';
    } else {
        val = datasets[i].data[datasets[i].data.length-1];
        dt = formatDate(datasets[i].label[datasets[i].label.length-1], 'hh:mm');
    }

    // console.log(val);

    $(`#ti${i}-value`).html(val);
    $(`#ti${i}-datetime`).html(dt);
}