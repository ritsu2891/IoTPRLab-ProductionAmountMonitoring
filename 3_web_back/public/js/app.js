/*
Copyright (c) 2018-2019,
Ritsuki KOKUBO (dev.rpaka),
IoT Promotion Lab,
Aichi Prefectural University.
All rights reserved.
*/

var myCharts = [];
var graphInit = false;
initDatasets();
for (i=0; i<n; i++) {
  datasets[i].glabel = [];
}
initGraph();
configDataFetch(function () {
  if (graphInit) {
    for (i=0; i<n; i++) {
      reduceData(datasets[i].label, REMAIN_SIZE);
      reduceData(datasets[i].data, REMAIN_SIZE);
      myCharts[i].update();
    }
    for (i=0; i<n; i++) {
      datasets[i].glabel = formatDateToMyGraph(datasets[i].label);
      myCharts[i].data.labels = datasets[i].glabel;
      myCharts[i].update();
    }
  }
});

// Local Functions
function initGraph() {
  $('.graphWrapper').width(window.innerWidth);
  $('.graphWrapper').height(window.innerHeight - $('header').height());
  for (i=0; i<n; i++) {
    ctx = document.getElementById(`graph${i}`).getContext('2d');
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 18;
    var graphOption = {
      type: 'bar',
      data: {
        labels: datasets[i].glabel,
        datasets: [{
          label: 'ネジの個数',
          data: datasets[i].data,
          borderColor: '#00008b',
          backgroundColor: '#00008b',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${posLabel[i]} (${moteMacAddrs[i]})`
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: '日付時刻'
            }
          }],
          yAxes: [{
            position: 'left',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'ネジの個数'
            },
            ticks: {
              min: 0,
              stepSize: 1,
            }
          }]
        }
      }
    }
    myCharts.push(new Chart(ctx, graphOption));
  }
  graphInit = true;
}

function formatDateToMyGraph(date) {
  if (date.length < 1) {
    return [];
  }
  var rdate = [];
  rdate[0] = formatDate(date[0], 'MM/DD hh:mm');
  if (date.length > 0) {
    for (var i = 1; i<date.length; i++) {
      rdate[i] = formatDate(date[i], 'hh:mm');
    }
  }
  return rdate;
}