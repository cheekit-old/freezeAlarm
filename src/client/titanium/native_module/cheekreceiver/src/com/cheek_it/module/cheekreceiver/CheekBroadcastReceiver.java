package com.cheek_it.module.cheekreceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
public class CheekBroadcastReceiver extends BroadcastReceiver {

	@Override
	public void onReceive(Context arg, Intent intent) {
    	Log.d("***LOG***", "This is receiver.");
	    if ((intent.getAction() != null) && (intent.getAction().equals("android.intent.action.BOOT_COMPLETED")))
	    {
	    	Log.d("***LOG***", "Starting service...");
	    }

	}
}
