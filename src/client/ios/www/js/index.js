/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

// /* written by nakajima */
// window.addEventListener("load", function(){
//     if (!navigator.geolocation){
//         result.innerHTML = "Geolocation 未対応";
//             return;
//         }
//     var option = {
//         timeout : 10000
//     }
//     navigator.geolocation.watchPosition(resultHandler, faultHandler, option);
//     function resultHandler(position){
//                     //$("#latitude").val(position.coords.latitude);
//                     //$("#longitude").val(position.coords.longitude);
//         document.getElementById('latitude').value=position.coords.latitude;
//         document.getElementById('longitude').value=position.coords.longitude;
//                     //result.innerText = latitude + ',' + longitude;
//     }
//     function faultHandler(error){
//         result.innerHTML = error.code;
//     }
// }, true);
// /* owari */


//    document.addEventListener("deviceready", onDeviceReady, false);

//     // Cordova is ready
//     //
//     function onDeviceReady() {
//         navigator.geolocation.getCurrentPosition(onSuccess, onError);
//     }

//     // onSuccess Geolocation
//     //
//     function onSuccess(position) {
//         var element = document.getElementById('geolocation');
//         element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
//                             'Longitude: '          + position.coords.longitude             + '<br />';
//         lat = position.coords.latitude;
//         lon = position.coords.longitude
//     }

//     // onError Callback receives a PositionError object
//     //
//     function onError(error) {
//         alert('code: '    + error.code    + '\n' +
//                 'message: ' + error.message + '\n');
//     }
//     
//     function kakunin() {
//         href = "http://freeze.test.cheek-it.com/api/forecast";
//           $.get(href, function(data){
//               var json = $.parseJSON(data);
//               alert(json.response.forecast.temperature.min);
//           });
//     }