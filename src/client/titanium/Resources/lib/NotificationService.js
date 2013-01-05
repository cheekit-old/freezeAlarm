/**
 * @author KOMATSU Issei
 * 
 * 1時間おきに起動し，20時にアラームする
 */
// ApiMapper ロード
var ApiMapper = require("lib/apiMapper").ApiMapper;

// 位置情報取得サブルーチン
// すごく汚いので直す
var getServiceLocation = function (e){
	Ti.API.log('Started getServiceLocation');
	
	// 通知領域設定
	var intent = Ti.Android.createIntent({
		className: 'com.cheek_it.freezealarm.FreezealarmActivity',
		packageName: 'com.cheek_it.freezealarm',
		flags: Ti.Android.FLAG_ACTIVITY_CLEAR_TOP | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP | Ti.Android.FLAG_ACTIVITY_NEW_TASK,
	});
	intent.addCategory(Ti.Android.CATEGORY_LAUNCHER);
	var pending = Ti.Android.createPendingIntent({ 
		activity: 'com.cheek_it.freezealarm.FreezealarmActivity',
		type: Ti.Android.PENDING_INTENT_FOR_ACTIVITY,
		flags : Ti.Android.FLAG_UPDATE_CURRENT,
		intent: intent,
	});
	
	if ( ! e.success || e.error){
		Ti.API.error(e.error);
		var notification = Ti.Android.createNotification({
				contentIntent : pending,
				contentTitle: 'Freeze Alarm',
				contentText:  '天気予報の取得に失敗しました',
				tickerText : '天気予報の取得に失敗しました',
				icon : Ti.App.Android.R.drawable.appicon,
		});
		Titanium.Media.vibrate();		// 振動させる TODO: パターン変更
		
		// 通知領域へ表示
		// TODO: プロパティどうつかうか調べる https://developer.appcelerator.com/apidoc/mobile/1.7.2/Titanium.Android.NotificationManager-module
		Ti.Android.NotificationManager.notify(1, notification);
		return;
	}
	Ti.API.log('Success: get location from gps');
	
	// 成功したら自動取得をやめる
	Ti.Geolocation.removeEventListener( 'serviceLocation', getServiceLocation ); 
	
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
					icon : Ti.App.Android.R.drawable.appicon,
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
			Titanium.Media.vibrate();		// 振動させる TODO: パターン変更
		}
	);
};

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
//	intent.putExtra('interval', 10000);		// for test
	var newService = Titanium.Android.createService(intent);
	newService.initialized = true;
	newService.start();
}else if(hour == 19){		// TODO : リリース時は hour == 19 とする for production
//}else if(hour == 20){		// TODO : リリース時は hour == 19 とする for test
//}else{	// for test
	// interval による起動
	Ti.API.log('Boot by interval');
	
	if(Ti.Geolocation.locationServicesEnabled){
		// 現在位置取得
	    Ti.Geolocation.purpose = "Get Lat/Long of your current position";
	    Ti.Geolocation.distanceFilter = 0;
	    Ti.Geolocation.frequency = 0;
	    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_LOW;
		/*
		var providerGps = Ti.Geolocation.Android.createLocationProvider({
		    name: Ti.Geolocation.PROVIDER_GPS,
		    minUpdateDistance: 0.0,
		    minUpdateTime: 0
		});
		Ti.Geolocation.Android.addLocationProvider(providerGps);
		Ti.Geolocation.Android.manualMode = true;
		Ti.Geolocation.addEventListener( 'serviceLocation', getServiceLocation ); 
		*/
		Ti.Geolocation.addEventListener( 'serviceLocation', getServiceLocation ); 
		//Ti.Geolocation.getCurrentPosition(getServiceLocation); 
	}else{
		Ti.API.error('Location Services is Disabled');
	}
}

// サービス起動フラグ
service.initialized = true;
Ti.API.log('Finished NotificationService');