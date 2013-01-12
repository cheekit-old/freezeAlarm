// this sets the background color of the master UIView (when there are no windows/tab groups on it)
var ApiMapper = require("lib/apiMapper").ApiMapper;
Titanium.UI.setBackgroundColor('#95BEEA');
// Titanium.UI.currentWindow.barColor = "#CBDFF4";
// Titanium.UI.currentWindow.translucent = true;

// タブグループの生成
var tabGroup = Titanium.UI.createTabGroup();

/**
 * freeze : 現在位置の凍結情報表示 Tab の設定
 */
var freezeWindow = Titanium.UI.createWindow({  
  	backgroundGradient:{
	    type: 'linear',
		startPoint: { x: '50%', y: '0%' },
		endPoint: { x: '50%', y: '100%' },
		colors: [
		  { color: '#CBDFF4', offset: 0.0},
		  { color: '#95BEEA', offset: 0.5},
		  { color: '#5D9DDD', offset: 1.0 }
		]
	}
});
freezeWindow.hideNavBar();

var freezeTab = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'凍結情報',
    window:freezeWindow
});

var prefLabel = Ti.UI.createLabel({
    width:'100%',
    shadowOffset:{x:5,y:5},
    color:'#FFF',
    font:{fontSize:'68dp'},
	textAlign:'left',
    top:'10dp',
//    left: '10dp',
});

var wardLabel = Ti.UI.createLabel({
    width:'100%',
    shadowOffset:{x:5,y:5},
    font:{fontSize:'68dp'},
    color:'#FFF',
	textAlign:'right',
    top:'100dp',
    right: '10dp',
});

// 日付表示用ラベル
/*
var today = new Date();
var year = today.getFullYear();
var month = today.getMonth() + 1;
if(month < 10 ){
	month = '0' + month;
}
var day = today.getDate();
if(day < 10) {
	day = '0' + day
}
*/

var dateLabel = Ti.UI.createLabel({
	text: '翌朝の予想最低気温',
    width:'auto',
    shadowOffset:{x:5,y:5},
    color:'#FFF',
    font:{fontSize:'24dp'},
	textAlign:'left',
    top: '200dp',
    left: '10dp',
});

// 最低気温表示ラベル
var temparatureLabel1 = Ti.UI.createLabel({
	text: 'ー',
	color: '#FFF',
	width: '100%',
    font:{fontSize:'128dp'},
	textAlign:'right',
    top: '240dp',
    right: '80dp',
});
				
var temparatureLabel2 = Ti.UI.createLabel({
	text: '℃',
	color: '#FFF',
	width: '100%',
    font:{fontSize:'68dp'},
	textAlign:'right',
    top: '295dp',
    right: '5dp',
});

var getLocation = function(e) {
	progressBar.value = 2;
	
	// 位置情報取得
	Ti.Geolocation.purpose = "Recieve User Location";
	if(!Ti.Geolocation.locationServicesEnabled){
		alert('GPSを有効にしてください [' + e.error + ']');
		return;
	}
	
	if(e.error){
		alert(e.error);
		return;
	}
	
	try {
		// 位置情報処理
		gpslon = e.coords.longitude;
		gpslat = e.coords.latitude;
		Ti.API.log('GPS Info: ' + gpslat + ',' + gpslon);
		
		Ti.Geolocation.reverseGeocoder(gpslat, gpslon, function(e){
			var address = new Array();
			var pref = '地域不明';
			var city = '';
			if(!(e.places && e.places.length)) {
				// 取得できなかったとき
				alert('地名を取得できませんでした．');
			}else{
				// 取得できたとき: 住所表示設定
				Ti.API.log(e.places);
				// address = e.places[0].displayAddress.split(',');
				address = e.places[0].address.split(',');
				pref = address[address.length - 2].replace(/\(.*\)/,'');		// 海外対応: とりあえず国の次の位置をprefとする
				for (var i = address.length - 1; i > 0; i--){
					// (都|道|府|県) が含まれるとき都道府県と判定する TODO: ださい
					if(address[i].match(/(都|道|府|県)/)){
						pref = address[i].replace(/\(.*\)/,'');
					}
				}
				Ti.API.log(e.places[0]);
				city = e.places[0].city.replace(/\(.*\)/,'');
			}
			
			/*
			 * UI 処理
			 */
			prefLabel.text = pref;
			var wardFontSize = (city.length < 5) ? '72dp' : '40dp';	 // 長い名前のときは文字サイズを小さくする
			wardLabel.font = {fontSize: wardFontSize};
			wardLabel.text = city;
			
			/**
			 * 最低気温
			 */
			var apiMapper = new ApiMapper();
			
			apiMapper.forecastApi(
				gpslat,		// 緯度
				gpslon,		// 経度
				function(){
					// 成功したとき
					 var json = eval('(' + this.responseText + ')');
					 temparatureLabel1.text = (json.forecast.temperature.min); // 最低気温をalert表示
				},
				function(e){
				// 失敗したとき
					if(e.error == "Bad Request"){
						alert('翌朝の天気予報が提供されていないか，天気予報が提供されていない地域です');
					}else{
						alert('天気予報の取得に失敗しました．ご迷惑をおかけいたしますが，通信状態のよい環境で再度お試しください．');
					}
				}
			);
			
			// Notification を登録する（iOSのみ）
			if((Ti.Platform.osname=="iphone")||(Ti.Platform.osname=="ipad")){
				
				// deviceToken取得
				Ti.API.info('Trying to register push and get deviceToken');
				Titanium.Network.registerForPushNotifications({
					types: [
						Titanium.Network.NOTIFICATION_TYPE_BADGE,
						Titanium.Network.NOTIFICATION_TYPE_ALERT,
						Titanium.Network.NOTIFICATION_TYPE_SOUND
					],
					success:function(e)
					{
						Ti.API.info('Completed to get deviceToken: ' + e.deviceToken);
						var deviceToken = e.deviceToken;
						
						// API登録
						apiMapper.notificationApi(
							deviceToken,	// device_id
							gpslat,		// 緯度
							gpslon,	// 経度
							function(){
								// 成功したとき
								 var json = eval('(' + this.responseText + ')');
								 Ti.API.info(this.responseText);
							},
							function(){
								// 失敗したとき
								alert('通知の設定に失敗しました');
							}
						);
					},
					error:function(e)
					{
						Ti.API.error('Failed to get deviceToken: ' + e.error);
					},
					callback:function(e)
					{
						// called when a push notification is received.
						var obj = JSON.parse(JSON.stringify(e.data));
						Ti.API.log(e.data);
						// alert("Received a push notification\n\nPayload:\n\n"+JSON.stringify(e.data));
						// var jsontext = eval('(' + JSON.stringify(e.data) + ')');
						// alert("Received a push notification:\n"+ jsontext.forecast.aps.alert);
					}
				});
				
			}
			
			// 再取得ボタン
			var reloadButton = Ti.UI.createButton({
				title: '現在地の最低気温を取得',
				color: '#FFF',
			//	backgroundColor: '#77BBDD',
				height: 'auto',
				width: '90%',
			    bottom: '10dp',
			});
			reloadButton.addEventListener('click', function(e){
				Titanium.Geolocation.addEventListener( 'location', getLocation ); 
			});
			
			progressBar.value = 3;
			// 非表示: TODO: あまりよくない
			freezeWindow.remove(progressBar);
			freezeWindow.remove(loadingLabel);
			freezeWindow.remove(appnameLabel);
			freezeWindow.remove(prefLabel);
			freezeWindow.remove(wardLabel);
			freezeWindow.remove(dateLabel);
			freezeWindow.remove(temparatureLabel1);
			freezeWindow.remove(temparatureLabel2);
			freezeWindow.remove(reloadButton);
			
			// 表示
			freezeWindow.add(prefLabel);
			freezeWindow.add(wardLabel);
			freezeWindow.add(dateLabel);
			freezeWindow.add(temparatureLabel1);
			freezeWindow.add(temparatureLabel2);
			// freezeWindow.add(reloadButton);
			
			
		});
		
		Titanium.Geolocation.removeEventListener( 'location', getLocation ); 
	} catch (e) {
		Ti.API.log('Cannot retrieve GPS infomation');
		Ti.API.log(e);
	}
};

/*
var iconImage = Ti.UI.createImageView({
	image: 'appicon.png',
	width: '80%',
	height: 'auto',
	top: '20dp',
});
freezeWindow.add(iconImage);
*/

var progressBar = Ti.UI.createProgressBar({
        top: '200dp',
        width:'200dp',
        height: 'auto',
        message:'',		// TODO: android だとUIをいろいろいじれないので
//        style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
//        font:{fontSize:'32dp', fontWeight:'bold'},
        min:0,
        max:3,
        value:0,
});

var loadingLabel = Ti.UI.createLabel({
	text: '位置情報取得中',
	width: '100%',
    // shadowColor:'#CBDFF4',
    // shadowOffset:{x:5,y:5},
    color:'#FFF',
    font:{fontSize:'28dp'},
	textAlign:'center',
    top:'160dp',
});


var appnameLabel = Ti.UI.createLabel({
	text: 'FreezeAlarm',
	width: '100%',
    shadowColor:'#95BEEA',
    shadowOffset:{x:5,y:5},
    color:'#FFF',
    font:{fontSize:'48dp'},
	textAlign:'center',
    top:'10dp',
});

freezeWindow.add(appnameLabel);
freezeWindow.add(loadingLabel);
freezeWindow.add(progressBar);
progressBar.show();

/**
 * alarmWindow:「使い方」などの情報を表示
 */
var alarmWindow = Titanium.UI.createWindow({
    // title:'アラームについて',
 	backgroundGradient:{
	    type: 'linear',
		startPoint: { x: '50%', y: '0%' },
		endPoint: { x: '50%', y: '100%' },
		colors: [
		  { color: '#CBDFF4', offset: 0.0},
		  { color: '#95BEEA', offset: 0.3},
		  { color: '#5D9DDD', offset: 1.0 }
		]
	}
});
alarmWindow.hideNavBar();


var alarmTab = Titanium.UI.createTab({ 
    title:'アラームについて', 
    icon:'KS_nav_ui.png',
    window:alarmWindow
});

// タイトル
var titleLabel = Ti.UI.createLabel({
	text: 'FreezeAlarm',
    width:'95%',
    shadowColor:'#95BEEA',
    shadowOffset:{x:5,y:5},
    color:'#FFF',
    font:{fontSize:'32dp', fontFamily:'Helvetica Neue'},
	textAlign:'left',
    top:'10dp',
});

var descLabel = Titanium.UI.createLabel({
	color:'#555',
	text:'水道管凍結被害を防ぎましょう！\nお住まいの地域の翌朝の予想最低気温が氷点下になるとアラーム通知をします。',
	font:{fontSize:'18dp',fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '56dp',
	width: "85%",
});

var desc2Label = Titanium.UI.createLabel({
	color:'#555',
	text:'アラーム時刻: 毎日20時ごろ\nアラーム基準: 0以下のとき',
	font:{fontSize:'18dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '165dp',
	width: "85%",
});

var desc3Label = Titanium.UI.createLabel({
	color:'#FFF',
	text:'Mashup',
	font:{fontSize:'28dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '230dp',
	width: "95%",
});

var desc4Label = Titanium.UI.createLabel({
	color:'#555',
	text:'World Weather Online :\nhttp://www.worldweatheronline.com/',
	font:{fontSize:'15dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '270dp',
	width: "85%",
});

var authorLabel = Titanium.UI.createLabel({
	color:'#FFF',
	text:'Developers',
	font:{fontSize:'28dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '316dp',
	width: "95%",
});

var cheekitLabel = Titanium.UI.createLabel({
	color:'#555',
	text:'地域の小さな幸せをITで実現する地域志向なチーム「 Cheekit 」が開発をしています',
	font:{fontSize:'15dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '360dp',
	width: "85%",
});

var memberLabel1 = Titanium.UI.createLabel({
	color:'#fff',
	text:'@isseium',
	font:{fontSize:'17dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '420dp',
	width: "75%",
});

var memberIntroduction1 = Titanium.UI.createLabel({
	color:'#555',
	text:'    API, Titanium(Android)',
	font:{fontSize:'15dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '440dp',
	width: "75%",
});
var memberLabel2 = Titanium.UI.createLabel({
	color:'#fff',
	text:'@s2k1ta98',
	font:{fontSize:'17dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '470dp',
	width: "75%",
});

var memberIntroduction2 = Titanium.UI.createLabel({
	color:'#555',
	text:'    Titanium(Android)',
	font:{fontSize:'15dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '490dp',
	width: "75%",
});

var memberLabel3 = Titanium.UI.createLabel({
	color:'#fff',
	text:'@iwate_takayu',
	font:{fontSize:'17dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '520dp',
	width: "75%",
});

var memberIntroduction3 = Titanium.UI.createLabel({
	color:'#555',
	text:'    Management, Titanium(iPhone)',
	font:{fontSize:'15dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '540dp',
	width: "75%",
});

var memberLabel4 = Titanium.UI.createLabel({
	color:'#fff',
	text:'@whitech0c0',
	font:{fontSize:'17dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '570dp',
	width: "75%",
});

var memberIntroduction4 = Titanium.UI.createLabel({
	color:'#555',
	text:'    Advisor',
	font:{fontSize:'15dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '590dp',
	width: "75%",
});

memberLabel1.addEventListener('click', function(e) {
        //ログインのダイアログ
	Titanium.Platform.openURL('http://twitter.com/isseium');
 });
memberLabel2.addEventListener('click', function(e) {
        //ログインのダイアログ
	Titanium.Platform.openURL('http://twitter.com/s2k1ta98');
 });
memberLabel3.addEventListener('click', function(e) {
        //ログインのダイアログ
	Titanium.Platform.openURL('http://twitter.com/iwate_takayu');
 });
memberLabel4.addEventListener('click', function(e) {
        //ログインのダイアログ
	Titanium.Platform.openURL('http://twitter.com/whitech0c0');
 });

var scrollView = Ti.UI.createScrollView({
  contentWidth: 'auto',
  contentHeight: 'auto',
  showVerticalScrollIndicator: true,
  showHorizontalScrollIndicator: true,
  height: '100%',
  width: '100%'
});

var view = Ti.UI.createView({
    // backgroundColor:'#99DDFF',
	// borderRadius: 10,
// 　　backgroundColor : '#000',　　opacity : 0.3, visible : false,
	top: 10,
	height: 'auto',
	width: '100%'
});

view.add(titleLabel);
view.add(descLabel);
view.add(desc2Label);
view.add(desc3Label);
view.add(desc4Label);
view.add(authorLabel);
view.add(cheekitLabel);
view.add(memberLabel1);
view.add(memberIntroduction1);
view.add(memberLabel2);
view.add(memberIntroduction2);
view.add(memberLabel3);
view.add(memberIntroduction3);
view.add(memberLabel4);
view.add(memberIntroduction4);

scrollView.add(view);
alarmWindow.add(scrollView);

//
//  タブの追加
//
tabGroup.addTab(freezeTab);  
tabGroup.addTab(alarmTab);  

// open tab group
tabGroup.open();

progressBar.value = 1;

/**
 * 位置情報
 */
Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
Ti.Geolocation.distanceFilter = 10;
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_THREE_KILOMETERS;

Titanium.Geolocation.addEventListener( 'location', getLocation ); 

/**
 * サービス
 */
if(Ti.Platform.osname=="android"){
	// Android
	var serviceIntent = Ti.Android.createServiceIntent( { url:  'lib/NotificationService.js' } );
	if(Ti.Android.isServiceRunning(serviceIntent)){
		Ti.API.info('service is running');
	}else{
		Ti.API.info('service is not running');
		serviceIntent.putExtra('interval', 3600000);
		var service = Titanium.Android.createService(serviceIntent);
		service.initialized = true;
		service.start();
	}
}