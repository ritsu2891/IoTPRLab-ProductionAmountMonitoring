<?php
Route::get('/', function () {
    return view('home');
});
Route::get('/dev', function () {
    return view('dev');
});
Route::get('/csv', function () {
    return view('csv');
});
Route::get('/about', function () {
    return view('about');
});
Route::get('/csv/all/', 'DataController@csv');
Route::get('/csv/daterange/{startDate}/{endDate}', 'DataController@csvdr');

Route::middleware(['cors'])->group(function () {
    Route::get('/data/all/{moteMacAddr}', 'DataController@all');
    Route::get('/data/init/{moteMacAddr}', 'DataController@init');
    Route::get('/data/new/{moteMacAddr}/{id}', 'DataController@new');
    Route::get('/data/daterange/{startDate}/{endDate}', 'DataController@daterange');

    Route::get('/api/v2/data/all/{range}/{startDate}/{endDate}', function($range, $startDate, $endDate) {
        return App::call('App\Http\Controllers\V2DataController@all', ['range' => $range, 'startDate' => $startDate, 'endDate' => $endDate]);
    });
    Route::get('/api/v2/data/latest/{howMany}', function($howMany) {
        return App::call('App\Http\Controllers\V2DataController@latest', ['howMany' => $howMany]);
    });
    Route::get('/api/v2/data/latest/{howMany}/{moteMacAddr}', function($howMany, $moteMacAddr) {
        return App::call('App\Http\Controllers\V2DataController@latest', ['howMany' => $howMany, 'moteMacAddr' => $moteMacAddr]);
    });
    Route::get('/api/v2/data/latest/{howMany}/{startDate}/{moteMacAddr}', function($howMany, $startDate, $moteMacAddr) {
        return App::call('App\Http\Controllers\V2DataController@latest', ['howMany' => $howMany, 'startDate' => $startDate, 'moteMacAddr' => $moteMacAddr]);
    });
    Route::get('/api/v2/csv/all/{range}/{startDate}/{endDate}', function($range, $startDate, $endDate) {
        return App::call('App\Http\Controllers\V2DataController@csvdr', ['range' => $range, 'startDate' => $startDate, 'endDate' => $endDate]);
    });
});