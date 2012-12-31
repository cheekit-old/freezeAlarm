package net.ikmz.myreceiver;

import android.content.BroadcastReceiver;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class CheekBroadcastReceiver extends BroadcastReceiver {
	private static final String LCAT = "CheekBroadcastReceiver";

	@Override
	public void onReceive(Context context, Intent intent) {
    	if (intent.getAction() == null){
    		Log.i(LCAT, "intent is null");
    		return;
    	}
    	
    	// すでにサービスが動いているときは止める
    	Intent serviceIntent = new Intent("com.cheek_it.freezealarm.Lib_NotificationServiceService");
    	context.stopService(serviceIntent);
    	
    	// サービススタート
    	Log.i(LCAT, "Starting service...");
    	context.startService(serviceIntent);
    	Log.i(LCAT, "Started service...");
	}
}
