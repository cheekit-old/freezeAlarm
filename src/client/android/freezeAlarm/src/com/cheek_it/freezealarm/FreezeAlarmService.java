package com.cheek_it.freezealarm;

import java.util.Calendar;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class FreezeAlarmService extends Service {
	private AlarmManager alarmManager;
	
	/**
	 * 次回起動時刻を設定する
	 */
	public void refreshAlarm(){
	    Intent intent = new Intent(this, GeneralBroadcastReceiver.class);
	    intent.setAction("freezeAlarmTest.VIEW");	// TODO 定数に変更        
 // すでにあるアラームをキャンセルして、再度登録
	    // XXX:isseium もしかしたらこんなことしなくてもよいので誰かなおして
		PendingIntent sender = PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
		this.alarmManager = (AlarmManager)(this.getSystemService(ALARM_SERVICE));
		this.alarmManager.cancel(sender);
		sender = PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);


	    // 起動時刻は固定で夜9時。
	    // 将来的にはユーザが自由に設定できるようにする
	    Calendar cal = Calendar.getInstance();
	    //cal.setTimeInMillis(System.currentTimeMillis());
	    cal.set(Calendar.HOUR_OF_DAY, 22);
	    cal.set(Calendar.MINUTE, 49);
	    cal.set(Calendar.SECOND, 0);
	    Log.d("freezeAlarm", "" + cal.getTimeInMillis());

	    // 1日ごとに起動
	    long interval = AlarmManager.INTERVAL_DAY;
	    //interval = 12000;
	    this.alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), interval, sender);

	    Log.d("freezeAlram", "Set alarmmanager");
	}
	

	@Override
	public IBinder onBind(Intent arg0) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public void onCreate(){
		this.refreshAlarm();
	}

}
