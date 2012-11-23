package com.cheek_it.freezealarm;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class GeneralBroadcastReceiver extends BroadcastReceiver {

	@Override
	public void onReceive(Context context, Intent intent) {
		String actionName = intent.getAction();
		Log.d("freezeAlarm", "Start GeneralBroadcastReceiver; actionName=" + actionName);
		
		if(
			// 起動ブロードキャストで呼び出されたとき
			// => アラートを設定する
			actionName.equals(Intent.ACTION_BOOT_COMPLETED) ||
			actionName.equals("android.intent.action.PACKAGE_REPLACED") ||
			actionName.equals("android.intent.action.PACKAGE_INSTALL")
		){
			// 起動ブロードキャストで呼び出されたとき
			// => アラートを設定する
			Log.d("freezeAlarm", "Starting alarm service");
			Intent serviceIntent = new Intent(context, FreezeAlarmService.class);
			context.startService(serviceIntent);
		}else if(actionName.equals("freezeAlarmTest.VIEW")){
			// 設定していたNotificationから呼び出されたとき
			// => アラートを表示する
			Log.d("freezeAlarm", "Alarm");
			Intent activityIntent = new Intent(context, MainActivity.class);
			activityIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK); 
			activityIntent.putExtra("pushAlarm", 1);
			context.startActivity(activityIntent);
		}
	}

}
