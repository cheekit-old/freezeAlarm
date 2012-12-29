/**
 * @author KOMATSU Issei
 * 
 * 1時間おきに起動し，20時にアラームする
 */
var ApiMapper = require("lib/apiMapper").ApiMapper;
var service = Titanium.Android.currentService;
var interval = service.intent.getIntExtra('interval', 0);

Ti.API.log('Notification Service: interval=' + interval);

var date = new Date();
var hour = date.getHours();
if(interval == 0){
	// moduleからの起動のときは 1 時間間隔の起動に変更
	Ti.API.log('Boot from module');
	var intent = Titanium.Android.createServiceIntent({url:'lib/NotificationService.js'});
	intent.putExtra('interval', 3600000);
	var service = Titanium.Android.createService(intent);
	service.start();
}else if(hour % 3 == 0){
	// interval による起動
	Ti.API.log(date.getHours());
	
	Ti.API.log('get location from GPS');
	
	/**
	 * 通知領域
	 */
	var intent = Ti.Android.createIntent({
		action: Ti.Android.ACTION_VIEW, 
	    data: "http://example.com"
	});
	var pending = Ti.Android.createPendingIntent({ 
		'intent' : intent,
	});
	
	// 現在位置取得
	Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
	Ti.Geolocation.distanceFilter = 10;
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_THREE_KILOMETERS;
	Ti.Geolocation.getCurrentPosition(function(e){
		if ( ! e.success || e.error){
			Ti.API.error(e.error);
			return;
		}
		
		// 位置情報処理
		gpslon = e.coords.longitude;
		gpslat = e.coords.latitude;
		Ti.API.log('GPS: ' + gpslat + ", " + gpslon);
		
		// 天気予報取得
		var apiMapper = new ApiMapper();
		apiMapper.forecastApi(
			gpslat,		// 緯度
			gpslon,		// 経度
			function(){
				// 成功したとき
				var json = eval('(' + this.responseText + ')');
				min = json.forecast.temperature.min;
				Ti.API.log('MIN: ' + min);
				var notification = Ti.Android.createNotification({
						contentIntent : pending,
						contentTitle: 'Freeze',
						contentText:  '翌朝の最低気温は ' + min + '度',
						tickerText : 'FreezeAlarm Ticker'
				});
				Ti.Android.NotificationManager.notify(1, notification);
				Titanium.Media.vibrate();
			},
			function(){
				// 失敗したとき
				Ti.API.error('天気予報の取得に失敗しました');
			}
		);
	});
}