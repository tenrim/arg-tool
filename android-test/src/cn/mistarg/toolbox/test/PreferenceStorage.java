package cn.mistarg.toolbox.test;

import android.content.Context;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

/** Mirrors only this app's localStorage, never notebook IndexedDB or files. */
public final class PreferenceStorage {
 private final SharedPreferences preferences;
 PreferenceStorage(Context context){preferences=context.getSharedPreferences("mist-web-preferences",Context.MODE_PRIVATE);}
 @JavascriptInterface public synchronized String snapshot(){return preferences.getString("values","");}
 private JSONObject values(){try{String value=snapshot();return new JSONObject(value.isEmpty()?"{}":value);}catch(Exception e){throw new IllegalStateException("无法读取应用偏好，请保留数据并联系维护者。",e);}}
 private void commit(JSONObject value){String json=value.toString();if(json.getBytes(StandardCharsets.UTF_8).length>10*1024*1024)throw new IllegalArgumentException("应用偏好超过 10 MiB。");if(!preferences.edit().putString("values",json).commit())throw new IllegalStateException("应用偏好未能写入磁盘。");}
 @JavascriptInterface public synchronized void initialize(String json){
  if(!snapshot().isEmpty())return;
  try{JSONObject value=new JSONObject(json);for(Iterator<String> keys=value.keys();keys.hasNext();)if(!(value.get(keys.next()) instanceof String))throw new IllegalArgumentException("偏好值必须是字符串。");commit(value);}catch(Exception e){throw new IllegalArgumentException("无法初始化应用偏好。",e);}
 }
 @JavascriptInterface public synchronized void put(String key,String value){if(key==null||value==null)throw new IllegalArgumentException();try{JSONObject all=values();all.put(key,value);commit(all);}catch(org.json.JSONException e){throw new IllegalArgumentException(e);}}
 @JavascriptInterface public synchronized void remove(String key){JSONObject all=values();all.remove(key);commit(all);}
 @JavascriptInterface public synchronized void clear(){commit(new JSONObject());}
}
