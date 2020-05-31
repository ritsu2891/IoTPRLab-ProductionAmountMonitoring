/*
Copyright (c) 2018-2019,
Ritsuki KOKUBO (dev.rpaka),
IoT Promotion Lab,
Aichi Prefectural University.
All rights reserved.
*/

$(function() {
    $('#datepicker-daterange .input-daterange').datepicker({
      language: 'ja',
      format: "yyyy-mm-dd",
      autoclose: true,
    });

    $('#dlbtn').on('click', function() {
      var type = $('[name="type"]:checked').val();
      console.log(type);

      var start = $('[name="start"]').val();
      var end = $('[name="end"]').val();
      console.log(start);
      console.log(end);

      var url = 'http://127.0.0.1/csv';
      switch (type) {
        case 'all':
          url += '/all'
          break;
        case 'daterange':
          url += '/daterange/' + start + '/' + end;
          break;
        default:
          return;
      }
      window.open(url);
    })
});