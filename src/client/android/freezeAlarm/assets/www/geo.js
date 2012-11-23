// Wait for Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);

var AppComm = function(){};
var freezeAlarmMin = 0;
// Cordova is ready
function onDeviceReady() {
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
    AppComm.prototype.updateValues = function(json) {
        console.log("Called; alarmConnector")
        var data = window.JSON.parse(json);
        pop_up();
        var alarmText = "明日の最低気温は、" + freezeAlarmMin + "度です";
        console.log(alarmText);
        alert(alarmText);
    };

    window.alarmConnector = new AppComm();
}

// onSuccess Geolocation
function onSuccess(position) {
    var element = document.getElementById('geolocation');
    
    lat = position.coords.latitude;
    lon = position.coords.longitude
    
    var currentLocation = new google.maps.LatLng(lat, lon);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': currentLocation}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			element.innerHTML = '現在地 : ' + results[0].formatted_address + '<br />';
		} else {
			alert("google.maps.GeocoderStatus is not OK. due to " + status);
		}
	});
}

// onError Callback receives a PositionError object
function onError(error) {
    alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}    

function pop_up() {
	href = "http://freeze.cheek-it.com/api/forecast.json?lat=" + lat + "&lon=" + lon;
  	$.get(href, function(data) {
		var element = document.getElementById('temperature');
  		var min = data.forecast.temperature.min;
		element.innerHTML = "明日の最低気温は " + min + "℃ です<br>";
      	freezeAlarmMin = min;
  	});
}