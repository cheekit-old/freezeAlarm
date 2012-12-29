// This is a test harness for your module
// You should do something interesting in this harness 
// to test out the module and to provide instructions 
// to users on how to use it by example.


// open a single window
var win = Ti.UI.createWindow({
	backgroundColor:'white'
});
var label = Ti.UI.createLabel();
win.add(label);
win.open();

// TODO: write your module tests here
var cheekreceiver = require('com.cheek_it.module.cheekreceiver');
Ti.API.info("module is => " + cheekreceiver);

label.text = cheekreceiver.example();

Ti.API.info("module exampleProp is => " + cheekreceiver.exampleProp);
cheekreceiver.exampleProp = "This is a test value";