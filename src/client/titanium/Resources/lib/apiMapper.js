/**
 * @author KOMATSU Issei
 */

/**
 * インスタンス化の仕方
 * var ApiMapper = require("lib/ApiMapper").ApiMapper;
 * var apiMapper = new ApiMapper();
 */

/*
 * 天気予報を取得するサンプル
 * 
apiMapper.forecastApi(
    "41",        // 緯度
    "139.7",    // 経度
    function(){
        // 成功したとき
         var json = eval('(' + this.responseText + ')');
         alert(json.forecast.temperature.min); // 最低気温をalert表示
         label1.text = json.forecast.date;    // label1 のテキストを日付に変更する場合
    },
    function(){
        // 失敗したとき
        alert('天気予報の取得に失敗しました');
    }
);
*/

/*
 * 通知設定をするサンプル
 * 
apiMapper.notificationApi(
    "deviceId",    // device_id
    "41",        // 緯度
    "139.7",    // 経度
    function(){
        // 成功したとき
         var json = eval('(' + this.responseText + ')');
         alert(json);
    },
    function(){
        // 失敗したとき
        alert('通知の設定に失敗しました');
    }
);
*/

/*
 * 電話番号コール回数APIサンプル
 * 
apiMapper.callApi(
    "09012341234",    // 電話番号
    function(){
        // 成功したとき
    },
    function(){
        // 失敗したとき
        alert('通知の設定に失敗しました');
    }
);
*/

/*
 * プリミティブなAPIアクセサ
 * 原則、プライベートメソッドとする
 * 
apiMapper.accessApi(
    'GET',
    'http://freeze.test.cheek-it.com/api/forecast.json?lat=41.123&lon=141', 
    {},
    function (){
        // 成功したとき
        alert(this.responseText);
    },
    function (){
        alert("ERROR");
    }
);
*/

ApiMapper = function(){};
ApiMapper.prototype.apiEndpoint = "http://freeze.cheek-it.com/api";
// ApiMapper.prototype.apiEndpoint = "http://api.frapi/api";
ApiMapper.prototype.accessApi = function(method, uri, param, callback_success, callback_failure) {

        // オフラインなら失敗
        if(Titanium.Network.online == false){
            return false;
        }

        var xhr = Titanium.Network.createHTTPClient();
        xhr.open(method, uri);
        xhr.onload = callback_success;    
        xhr.onerror = callback_failure;
        xhr.send(param);
        
        return true;
};
ApiMapper.prototype.forecastApi = function (lat, lon, callback_success, callback_failure){
    return this.accessApi('GET', this.apiEndpoint + "/forecast.json?lat=" + lat + "&lon=" + lon, {}, callback_success, callback_failure);
}
ApiMapper.prototype.notificationApi = function (device_id, lat, lon, callback_success, callback_failure){
    return this.accessApi(
        'POST',
        this.apiEndpoint + "/notification.json",
        {device_id : device_id, lat : lat, lon : lon, secret : Ti.Utils.md5HexDigest("cheekit" + device_id)},
        callback_success,
        callback_failure);
}
ApiMapper.prototype.callApi = function (tel, callback_success, callback_failure){
    return this.accessApi('PUT', this.apiEndpoint + "/call.json", {tel : tel}, callback_success, callback_failure);
}

exports.ApiMapper = ApiMapper;
