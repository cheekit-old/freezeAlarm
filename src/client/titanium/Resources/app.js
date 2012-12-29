// this sets the background color of the master UIView (when there are no windows/tab groups on it)
var ApiMapper = require("lib/apiMapper").ApiMapper;
Titanium.UI.setBackgroundColor('#99DDFF');

// タブグループの生成
var tabGroup = Titanium.UI.createTabGroup();

/**
 * freeze : 現在位置の凍結情報表示 Tab の設定
 */
var freezeWindow = Titanium.UI.createWindow({  
    title:'凍結情報',
    backgroundColor:'#99DDFF'
});

var freezeTab = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'凍結情報',
    window:freezeWindow
});

var prefLabel = Ti.UI.createLabel({
    width:'100%',
    shadowColor:'#aaa',
    shadowOffset:{x:5,y:5},
    color:'#000',
    font:{fontSize:'68dp'},
	textAlign:'left',
    top:'10dp',
//    left: '10dp',
});

var wardLabel = Ti.UI.createLabel({
    width:'100%',
    shadowColor:'#aaa',
    shadowOffset:{x:5,y:5},
    font:{fontSize:'68dp'},
    color:'#000',
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
    shadowColor:'#aaa',
    shadowOffset:{x:5,y:5},
    color:'#000',
    font:{fontSize:'24dp'},
	textAlign:'left',
    top: '200dp',
    left: '10dp',
});

// 最低気温表示ラベル
var temparatureLabel = Ti.UI.createLabel({
	text: 'ー ℃',
	color: '#000',
	width: '100%',
    font:{fontSize:'128dp'},
	textAlign:'right',
    top: '230dp',
});
				
var getLocation = function(e) {
	progressBar.value = 2;
	
	// 位置情報取得
	if(!Ti.Geolocation.locationServicesEnabled){
		alert('GPSを有効にしてください');
		return;
	}
	
	try {
		Ti.Geolocation.getCurrentPosition(function(e){
			// エラー時はコールバック関数の引数のerrorプロパティがセットされる
			if ( ! e.success || e.error){
				alert(e.error);
				return;
			}
			
			// 位置情報処理
			gpslon = e.coords.longitude;
			gpslat = e.coords.latitude;
			
			
			Ti.Geolocation.reverseGeocoder(gpslat, gpslon, function(e){
				if(!(e.places && e.places.length)) {
					// 取得できなかったとき
					alert('地名を取得できませんでした');
				}
				
				var address = e.places[0].displayAddress.split(',');
				var pref = address[address.length - 2].replace(/\(.*\)/,'');		// 海外対応: とりあえず国の次の位置をprefとする
				for (var i = address.length - 1; i > 0; i--){
					// (都|道|府|県) が含まれるとき都道府県と判定する TODO: ださい
					if(address[i].match(/(都|道|府|県)/)){
						pref = address[i].replace(/\(.*\)/,'');
					}
				}
				Ti.API.log(e.places[0]);
				var city = e.places[0].city.replace(/\(.*\)/,'');
				
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
						 temparatureLabel.text = (json.forecast.temperature.min) + "℃"; // 最低気温をalert表示
					},
					function(){
						// 失敗したとき
						alert('天気予報の取得に失敗しました');
					}
				);
				
				
				// 再取得ボタン
				var reloadButton = Ti.UI.createButton({
					title: '現在地の最低気温を取得',
					color: '#000',
				//	backgroundColor: '#77BBDD',
					height: 'auto',
					width: '90%',
				    bottom: '10dp',
				});
				reloadButton.addEventListener('click', getLocation);
				
				progressBar.value = 3;
				// 非表示: TODO: あまりよくない
				freezeWindow.remove(progressBar);
				freezeWindow.remove(loadingLabel);
				freezeWindow.remove(appnameLabel);
				freezeWindow.remove(prefLabel);
				freezeWindow.remove(wardLabel);
				freezeWindow.remove(dateLabel);
				freezeWindow.remove(temparatureLabel);
				freezeWindow.remove(reloadButton);
				
				// 表示
				freezeWindow.add(prefLabel);
				freezeWindow.add(wardLabel);
				freezeWindow.add(dateLabel);
				freezeWindow.add(temparatureLabel);
				freezeWindow.add(reloadButton);
				
			});
			
		});
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
    width:'auto',
    shadowColor:'#aaa',
    shadowOffset:{x:5,y:5},
    color:'#000',
    font:{fontSize:'28dp'},
	textAlign:'center',
	width: '100%',
    top:'175dp',
});


var appnameLabel = Ti.UI.createLabel({
	text: 'Freeze Alarm',
    width:'auto',
    shadowColor:'#aaa',
    shadowOffset:{x:5,y:5},
    color:'#000',
    font:{fontSize:'48dp'},
	textAlign:'center',
	width: '100%',
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
    title:'アラームについて',
    backgroundColor:'#99DDFF'
});
var alarmTab = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'アプリについて',
    window:alarmWindow
});

// タイトル
var titleLabel = Ti.UI.createLabel({
	text: 'FreezeAlarm',
    width:'95%',
    shadowColor:'#aaa',
    shadowOffset:{x:5,y:5},
    color:'#000',
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
	text:'アラーム時刻: 毎日20時ごろ\nアラーム基準: 0℃以下のとき',
	font:{fontSize:'18dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '165dp',
	width: "85%",
});

var desc3Label = Titanium.UI.createLabel({
	color:'#000',
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
	color:'#000',
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

var memberLabel = Titanium.UI.createLabel({
	color:'#555',
	text:'@isseium\n    API, Titanium(Android)\n@s2k1ta98\n    Titanium(Android)\n@iwate_takayu\n    Management, Titanium(iPhone)\n@whitech0c0\n    Advisor',
	font:{fontSize:'15dp' ,fontFamily:'Helvetica Neue'},
	textAlign:'left',
	top: '415dp',
	width: "75%",
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
    backgroundColor:'#99DDFF',
	borderRadius: 10,
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
view.add(memberLabel);
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