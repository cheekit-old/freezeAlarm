// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


function getForecast() {
	// オフラインなら処理しないようにしたほうがいいですよね！
	if(Titanium.Network.online == false){
	    // エラー表示
	    return;
	}
	
	// オブジェクトを生成します。
	var xhr = Titanium.Network.createHTTPClient();
	
	// 第一引数はHTTP Method(GETかPOSTがほとんどだと思いますが)
	// 第二引数はURIです。
	xhr.open('GET','http://freeze.test.cheek-it.com/api/forecast.json?lat=41.123&lon=141');
	
	// レスポンスを受け取るイベント
	xhr.onload = function(){
	    alert( json = eval('(' + this.responseText + ')') );
	    /*
	    // これと同義
	    xhr.onreadystatechange = function(){
	        if(this.readyState == xhr.DONE){
	            alert(this.responseText);
	        }
	    };
	    */
	};
	
	// エラー発生時のイベント
	xhr.onerror = function(error){
	    // errorにはエラー事由の文字列オブジェクトが入ってくる。
	};
	
	// リクエスト送信します。(引数としてJSON値を入れるとパラメータ化される)
	xhr.send();
	/*
	 xhr.send({
	     q : 'querystring',
	     param_name : 'param_value'
	 });
	 */
}







//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});

var label1 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 1',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win1.add(label1);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Tab 2',
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Tab 2',
    window:win2
});

var label2 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 2',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win2.add(label2);

//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();
