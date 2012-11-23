package com.cheek_it.freezealarm;

import org.apache.cordova.DroidGap;

import android.os.Bundle;
import android.util.Log;

public class MainActivity extends DroidGap{

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
    
    @Override
    public void onResume(){
    	super.onResume();
        int pushFlg = this.getIntent().getExtras().getInt("pushAlarm", 0);
        Log.v("freezeAlarm", "pushAlarm" + Integer.toString(pushFlg));
        if(pushFlg == 1 ){
	        Log.v("freezeAlarm", "activityStarted");
        	pushAlarm();
        }
    }
    
    /**
     * Cordova 側の JS関数を呼び出す
     */
    public void pushAlarm() {
        Log.d("freezeAlarm", "send phonegap");
        /*
        JSONObject data = new JSONObject();
        try {
          data.put("value1", value1);
          data.put("value2", value2);
        } catch (JSONException e) {
          Log.e("CommTest", e.getMessage());
        }
        
        Log.d("FreezeAlarm", "send json from native: " + data.toString());
        String js = String.format("window.alarmConnector.('%s');", data.toString());
        */
        
        
        String js = "window.alarmConnector.updateValues();";
        this.sendJavascript(js);
    }
}