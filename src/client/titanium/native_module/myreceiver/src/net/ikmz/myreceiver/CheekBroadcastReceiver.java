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
    	
    	// 起動完了時にサービス起動
	    if (intent.getAction().equals("android.intent.action.BOOT_COMPLETED"))
	    {
	    	Log.i(LCAT, "Starting service...");
	    	Intent serviceIntent = new Intent("com.cheek_it.freezeAlarm.Lib_NotificationServiceService");
	    	context.startService(serviceIntent);
	    	Log.i(LCAT, "Started service...");
	    }

	}
}
