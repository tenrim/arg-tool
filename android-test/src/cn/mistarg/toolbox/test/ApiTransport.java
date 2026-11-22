package cn.mistarg.toolbox.test;

import android.webkit.JavascriptInterface;
import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import javax.net.ssl.HttpsURLConnection;
import org.json.JSONObject;

/** Fixed first-party APIs. Files are sent only by explicit analysis requests; no cookies or SMTP secrets. */
public final class ApiTransport implements AutoCloseable {
 static final String ORIGIN="https://www.tool.mistarg.cn";
 private static final Set<String> PATHS=new HashSet<>(Arrays.asList("/api/feedback","/api/code/run","/api/forensics/run","/api/query/oeis","/api/query/simbad","/api/query/vizier","/api/query/cod","/api/query/pubchem","/api/query/zdic","/api/query/cnkgraph","/api/query/pokewiki","/api/query/placenames"));
 private static int requestLimit(String path){return path.equals("/api/forensics/run")?28*1024*1024:path.equals("/api/code/run")?4*1024*1024:path.equals("/api/feedback")?6*1024*1024:8192;}
 private static int responseLimit(String path){return path.equals("/api/forensics/run")?92*1024*1024:path.equals("/api/feedback")?65536:8*1024*1024;}
 private static int readTimeout(String path){return path.equals("/api/forensics/run")?330000:path.equals("/api/code/run")?125000:35000;}
 interface Callback {void complete(String script);}
 private final Callback callback;
 private final ExecutorService executor=Executors.newFixedThreadPool(4);
 private final Map<String,Job> jobs=new HashMap<>();
 private boolean closed;
 private static final class Job {volatile boolean cancelled;volatile HttpsURLConnection connection;}
 ApiTransport(Callback callback){this.callback=callback;}
 @JavascriptInterface public synchronized void request(String id,String path,String body){
  if(id==null||!id.matches("[a-f0-9-]{36}"))return;
  if(closed||jobs.containsKey(id))return;
  if(!PATHS.contains(path)||body==null){complete(id,400,"{}","{\"message\":\"接口未登记。\"}",null);return;}
  byte[] bytes=body.getBytes(StandardCharsets.UTF_8);
  if(bytes.length>requestLimit(path)){complete(id,413,"{}","{\"message\":\"请求过大。\",\"error\":\"请求超过接口限额。\"}",null);return;}
  try{
   JSONObject value=new JSONObject(body);
   if(path.equals("/api/forensics/run")){
    String data=value.getString("data");
    long size=(long)data.length()/4*3-(data.endsWith("==")?2:data.endsWith("=")?1:0);
    if(data.isEmpty()||data.length()%4!=0)throw new IllegalArgumentException();
    if(size>20*1024*1024){complete(id,413,"{}","{\"error\":\"单文件最多 20 MB。\"}",null);return;}
   }
  }catch(Exception e){complete(id,400,"{}","{\"message\":\"请求不是有效 JSON 对象或文件编码无效。\",\"error\":\"请求格式无效。\"}",null);return;}
  if(jobs.size()>=4){complete(id,503,"{}","{\"message\":\"请求繁忙，请稍后重试。\"}",null);return;}
  Job job=new Job();jobs.put(id,job);executor.execute(()->send(id,path,bytes,job));
 }
 private void send(String id,String path,byte[] bytes,Job job){
  HttpsURLConnection connection=null;
  try{
   if(job.cancelled)return;
   connection=(HttpsURLConnection)new URL(ORIGIN+path).openConnection();job.connection=connection;
   if(job.cancelled)return;
   connection.setInstanceFollowRedirects(false);connection.setConnectTimeout(10000);connection.setReadTimeout(readTimeout(path));connection.setUseCaches(false);
   connection.setRequestMethod("POST");connection.setDoOutput(true);connection.setFixedLengthStreamingMode(bytes.length);
   connection.setRequestProperty("Content-Type","application/json; charset=utf-8");connection.setRequestProperty("Accept",path.equals("/api/forensics/run")?"application/json, application/x-ndjson":"application/json");
   // This first-party native client uses the existing public site's API contract.
   connection.setRequestProperty("Origin",ORIGIN);
   connection.setRequestProperty("User-Agent","MistToolbox-Android/2");
   try(OutputStream out=connection.getOutputStream()){if(job.cancelled)return;out.write(bytes);}
   int status=connection.getResponseCode();
   if(status<200||status>=600||status>=300&&status<400)throw new IOException("Unexpected status or redirect");
   String type=connection.getContentType();
   String mime=type==null?"":type.split(";",2)[0].trim().toLowerCase(Locale.ROOT);
   if(!mime.equals("application/json")&&!(path.equals("/api/forensics/run")&&mime.equals("application/x-ndjson")))throw new IOException("Unexpected response type");
   int limit=responseLimit(path);
   if(connection.getContentLengthLong()>limit)throw new IOException("Response too large");
   int size=0;
   try(InputStream in=status>=400?connection.getErrorStream():connection.getInputStream()){
    if(in==null)throw new IOException("Empty response");byte[] buffer=new byte[49152];
    for(int n;(n=in.read(buffer))!=-1;){if(job.cancelled)return;size+=n;if(size>limit)throw new IOException("Response too large");String chunk=android.util.Base64.encodeToString(buffer,0,n,android.util.Base64.NO_WRAP);callback.complete("window.__mistNetworkChunk?.("+JSONObject.quote(id)+","+JSONObject.quote(chunk)+")");}
   }
   JSONObject headers=new JSONObject();headers.put("Content-Type",type);headers.put("Cache-Control","no-store");headers.put("Content-Length",size);
   String retry=connection.getHeaderField("Retry-After");if(retry!=null)headers.put("Retry-After",retry);
   if(!job.cancelled)complete(id,status,headers.toString(),null,null);
  }catch(Exception e){if(!job.cancelled)complete(id,0,"{}","","无法连接迷雾工具箱服务器或响应不可读取；反馈发送结果可能尚未确认，请保留原报告后重试。");}
  finally{if(connection!=null)connection.disconnect();synchronized(this){if(jobs.get(id)==job)jobs.remove(id);}}
 }
 private void complete(String id,int status,String headers,String body,String error){callback.complete("window.__mistNetworkComplete?.("+JSONObject.quote(id)+","+status+","+headers+","+(body==null?"null":JSONObject.quote(body))+","+(error==null?"null":JSONObject.quote(error))+")");}
 @JavascriptInterface public synchronized void cancel(String id){Job job=jobs.get(id);if(job==null)return;job.cancelled=true;if(job.connection!=null)job.connection.disconnect();}
 @Override public synchronized void close(){closed=true;for(Job job:jobs.values()){job.cancelled=true;if(job.connection!=null)job.connection.disconnect();}executor.shutdownNow();jobs.clear();}
}
