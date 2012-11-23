// Wait for Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

var AppComm = function(){};
var freezeAlarmMin = 0;

// Cordova is ready
function onDeviceReady() {
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
	
//    AppComm.prototype.updateValues = function(json) {
        //console.log("Called; alarmConnector")
        //var data = window.JSON.parse(json);
        //pop_up();
        //var alarmText = "明日の最低気温は、" + freezeAlarmMin + "度です";
        //console.log(alarmText);
        //alert(alarmText);
    //};

    window.alarmConnector = new AppComm();
    
    $("#schedule_on").click(function(){
		localStorage.setItem("alert","ON");
	});

	$("#schedule_off").click(function(){
		localStorage.setItem("alert","OFF");
	});
}

// onSuccess Geolocation
function onSuccess(position) {
	var alert_flg = localStorage.getItem("alert");
	console.log("console : " + alert_flg);
	if (alert_flg == "ON") {
	    var element = document.getElementById('geolocation');
	    
	    lat = position.coords.latitude;
	    lon = position.coords.longitude
	    
	    var currentLocation = new google.maps.LatLng(lat, lon);
	    var geocoder = new google.maps.Geocoder();
	    geocoder.geocode({'latLng': currentLocation}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				location_name = results[0].address_components[3].short_name;
				//element.innerHTML = '現在地 : ' + results[0].address_components[3].short_name + '<br />';
			} else {
				alert("google.maps.GeocoderStatus is not OK. due to " + status);
			}
		});
		pop_up();
	}
}

function pop_up() {
	href = "http://freeze.cheek-it.com/api/forecast.json?lat=" + lat + "&lon=" + lon;
  	$.get(href, function(data) {
		var element = document.getElementById('temperature');
  		var min = data.forecast.temperature.min;
  		if (min <= 6) {
	  		message = location_name + "の明日の最低気温は " + min + "℃ です。水道管の破裂に注意してください";
  		} else if (min < 10){
  			message = location_name + "の明日の最低気温は " + min + "℃ です。きをつけてね";
  		}
  		navigator.notification.alert(message, callbackDissmiss, "Warning", "OK");
		navigator.notification.vibrate(1000);
		navigator.notification.beep(3);
  	});
}

// onError Callback receives a PositionError object
function onError(error) {
    alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}    

function callbackDissmiss(){}
