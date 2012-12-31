/**
 * @author KOMATSU Issei
 * 
 * 1時間おきに起動し，20時にアラームする
 */

// ApiMapper ロード
var ApiMapper = require("lib/apiMapper").ApiMapper;

// 時刻
var date = new Date();
var hour = date.getHours();

// interval 取得
var service = Titanium.Android.currentService;
var interval = service.intent.getIntExtra('interval', 0);

Ti.API.log('Starting Notification Service: interval=' + interval + ' hour=' + hour);

if(interval == 0){
	// インターバルなし（from module)起動のときは 1 時間間隔の起動に変更
	Ti.API.log('Setting boot service (hourly)');
	var intent = Titanium.Android.createServiceIntent({url:'lib/NotificationService.js'});
	intent.putExtra('interval', 3600000);
//	intent.putExtra('interval', 10000);
	var newService = Titanium.Android.createService(intent);
	newService.initialized = true;
	newService.start();
}else if(hour == 19){		// TODO : リリース時は hour == 19 とする
//}else if(hour == 20){		// TODO : リリース時は hour == 19 とする
//}else{
	// interval による起動
	Ti.API.log('Boot by interval');
	
	// 通知領域	TODO : 設定変更
	var intent = Ti.Android.createIntent({
		className: 'ti.modules.titanium.ui.TiTabActivity',
		packageName: 'com.cheek_it.freezealarm',
		flags: Titanium.Android.FLAG_ACTIVITY_CLEAR_TOP | Titanium.Android.FLAG_ACTIVITY_SINGLE_TOP
	});
	var pending = Ti.Android.createPendingIntent({ 
		activity: 'com.cheek_it.freezealarm.FreezealarmActivity',
		type: Titanium.Android.PENDING_INTENT_FOR_ACTIVITY,
		intent: intent,
	});
	
	// 現在位置取得
	Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
	Ti.Geolocation.distanceFilter = 10;
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_THREE_KILOMETERS;
	Ti.Geolocation.getCurrentPosition(function(e){
		if ( ! e.success || e.error){
			Ti.API.error(e.error);
			var notification = Ti.Android.createNotification({
					contentIntent : pending,
					contentTitle: 'Freeze Alarm',
					contentText:  '天気予報の取得に失敗しました',
					tickerText : '天気予報の取得に失敗しました',
			});
			
			// 通知領域へ表示
			// TODO: プロパティどうつかうか調べる https://developer.appcelerator.com/apidoc/mobile/1.7.2/Titanium.Android.NotificationManager-module
			Ti.Android.NotificationManager.notify(1, notification);
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
				
				var title = '';
				var text = '';
				var tickerText = '';
				if(min <= -4){
					title = '【警告】Freeze Alarm';
					text = '【警告】翌朝の最低気温は ' + min + ' 度です．水道管凍結対策をしてください．';
					tickerText = text;
				}else if (min <= 0){
					title = '【注意】Freeze Alarm';
					text = '【注意】翌朝の最低気温は ' + min + ' 度です．水道管凍結には注意してください．';
					tickerText = text;
				}else{
					// 0 度より高いときは Notification しない
					return;
				}
				
				var notification = Ti.Android.createNotification({
						contentIntent : pending,
						contentTitle: title,
						contentText:  text,
						tickerText : tickerText,
				});
				
				// 通知領域へ表示
				// TODO: プロパティどうつかうか調べる https://developer.appcelerator.com/apidoc/mobile/1.7.2/Titanium.Android.NotificationManager-module
				Ti.Android.NotificationManager.notify(1, notification);
				Titanium.Media.vibrate();		// 振動させる TODO: パターン変更
			},
			function(){
				// 失敗したとき
				Ti.API.error('天気予報の取得に失敗しました');
				var notification = Ti.Android.createNotification({
						contentIntent : pending,
						contentTitle: 'Freeze Alarm',
						contentText:  '天気予報の取得に失敗しました',
						tickerText : '天気予報の取得に失敗しました',
				});
				
				// 通知領域へ表示
				// TODO: プロパティどうつかうか調べる https://developer.appcelerator.com/apidoc/mobile/1.7.2/Titanium.Android.NotificationManager-module
				Ti.Android.NotificationManager.notify(1, notification);
			}
		);
	});
}

// サービス起動フラグ
service.initialized = true;
