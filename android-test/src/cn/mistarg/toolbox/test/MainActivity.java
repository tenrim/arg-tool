package cn.mistarg.toolbox.test;

import android.app.Activity;
import android.content.*;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.widget.Toast;
import android.widget.FrameLayout;
import java.io.*;
import java.util.*;

/** Local test container with fixed optional HTTPS APIs. */
public final class MainActivity extends Activity {
 private static final String HOST="appassets.androidplatform.net";
 private WebView web;
 private ApiTransport network;
 private String networkScript;
 private String runtimeScript;
 private PermissionRequest microphonePermission;
 private ValueCallback<Uri[]> picker;
 private File pending;
 private OutputStream output;
 private long written;
 private String exportName="result.bin",exportMime="application/octet-stream";
 private boolean saving;
 private static boolean local(Uri u){return "https".equals(u.getScheme())&&HOST.equals(u.getHost());}
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  web=new WebView(this);
  web.addJavascriptInterface(new PreferenceStorage(this),"MistStorage");
  WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags&android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE)!=0);
  try(InputStream in=getAssets().open("android-network.js");ByteArrayOutputStream out=new ByteArrayOutputStream()){
   byte[] buffer=new byte[8192];for(int n;(n=in.read(buffer))!=-1;)out.write(buffer,0,n);networkScript=new String(out.toByteArray(),java.nio.charset.StandardCharsets.UTF_8);
  }catch(IOException e){throw new IllegalStateException("Missing Android API adapter",e);}
  try(InputStream in=getAssets().open("android-runtime.js");ByteArrayOutputStream out=new ByteArrayOutputStream()){
   byte[] buffer=new byte[8192];for(int n;(n=in.read(buffer))!=-1;)out.write(buffer,0,n);runtimeScript=new String(out.toByteArray(),java.nio.charset.StandardCharsets.UTF_8);
  }catch(IOException e){throw new IllegalStateException("Missing Android lifecycle adapter",e);}
  if(state!=null&&state.getBoolean("saving")){
   try{File restored=new File(state.getString("exportPath","")).getCanonicalFile();if(restored.getParentFile().equals(getCacheDir().getCanonicalFile())&&restored.isFile()){pending=restored;saving=true;exportName=state.getString("exportName","result.bin");exportMime=state.getString("exportMime","application/octet-stream");}}catch(IOException ignored){}
  }
  network=new ApiTransport(script->runOnUiThread(()->{if(web!=null&&local(Uri.parse(web.getUrl()==null?"":web.getUrl())))web.evaluateJavascript(script,null);}));
  web.addJavascriptInterface(network,"MistNetwork");
  FrameLayout frame=new FrameLayout(this);
  frame.addView(web,new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT,FrameLayout.LayoutParams.MATCH_PARENT));
  frame.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
  setContentView(frame);frame.requestApplyInsets();
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(true);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.addJavascriptInterface(new ExportBridge(),"MistExport");
  ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient(){@Override public WebResourceResponse shouldInterceptRequest(WebResourceRequest r){return resource(r);}});
  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onPermissionRequest(PermissionRequest request){
    if(!local(request.getOrigin())||request.getResources().length!=1||!PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(request.getResources()[0])){request.deny();return;}
    denyMicrophonePermission();microphonePermission=request;
    if(checkSelfPermission(android.Manifest.permission.RECORD_AUDIO)==android.content.pm.PackageManager.PERMISSION_GRANTED)finishMicrophonePermission(true);
    else requestPermissions(new String[]{android.Manifest.permission.RECORD_AUDIO},12);
   }
   @Override public void onPermissionRequestCanceled(PermissionRequest request){if(microphonePermission==request)microphonePermission=null;}
   @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(picker!=null)picker.onReceiveValue(null);picker=callback;
    try{startActivityForResult(params.createIntent(),10);}catch(Exception e){picker.onReceiveValue(null);picker=null;toast("无法打开文件选择器");}return true;
   }
  });
  web.setDownloadListener((url,agent,disposition,mime,size)->{
   if(url.startsWith("blob:https://"+HOST+"/"))exportBlob(url,"result.bin",mime);
   else if(url.startsWith("https://"))try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));}catch(Exception e){toast("无法打开下载链接");}
  });
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){return resource(r);}
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){
    if(local(r.getUrl()))return false;
    if(r.isForMainFrame()&&Arrays.asList("https","http","mailto").contains(r.getUrl().getScheme()))try{startActivity(new Intent(Intent.ACTION_VIEW,r.getUrl()));}catch(Exception e){toast("无法打开链接");}return true;
   }
   @Override public void onPageFinished(WebView v,String url){if(local(Uri.parse(url)))web.evaluateJavascript(runtimeScript,null);if(local(Uri.parse(url)))web.evaluateJavascript(networkScript,null);if(local(Uri.parse(url)))web.evaluateJavascript("(()=>{if(window.__mistExport)return;window.__mistExport=true;const click=HTMLAnchorElement.prototype.click;const save=a=>{if(!a.download||!a.href.startsWith('blob:'))return false;window.__mistSave(a.href,a.download,'application/octet-stream');return true};window.__mistSave=async(u,n,t)=>{try{const b=await(await fetch(u)).blob();if(b.size>134217728)throw Error('测试版导出上限为128 MiB');MistExport.begin(n,b.type||t);for(let p=0;p<b.size;p+=49152){let a=new Uint8Array(await b.slice(p,p+49152).arrayBuffer()),s='';for(const x of a)s+=String.fromCharCode(x);MistExport.chunk(btoa(s));}MistExport.finish();}catch(e){MistExport.abort();alert('导出失败：'+e.message)}};HTMLAnchorElement.prototype.click=function(){if(!save(this))return click.call(this)};document.addEventListener('click',e=>{const a=e.target.closest?.('a[download]');if(a&&save(a))e.preventDefault()},true)})()",null);}
  });
  web.loadUrl("https://"+HOST+"/index.html"+(state==null?"":state.getString("route","")));
  if(state!=null&&state.getBoolean("choosing"))toast("文件选择已中断，请重新选择文件。");
 }
 private void denyMicrophonePermission(){if(microphonePermission!=null){microphonePermission.deny();microphonePermission=null;}}
 private void finishMicrophonePermission(boolean granted){
  PermissionRequest request=microphonePermission;microphonePermission=null;if(request==null)return;
  if(granted&&!isFinishing()&&!isDestroyed()&&web!=null&&local(Uri.parse(web.getUrl()==null?"":web.getUrl())))request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});else request.deny();
 }
 @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] results){super.onRequestPermissionsResult(request,permissions,results);if(request==12)finishMicrophonePermission(results.length==1&&results[0]==android.content.pm.PackageManager.PERMISSION_GRANTED);}
 @Override protected void onStop(){if(web!=null)web.evaluateJavascript("window.__mistReleaseMicrophone?.()",null);denyMicrophonePermission();super.onStop();}
 @Override protected void onSaveInstanceState(Bundle state){
  super.onSaveInstanceState(state);if(web!=null){String url=web.getUrl();if(url!=null&&local(Uri.parse(url))){String hash=Uri.parse(url).getEncodedFragment();if(hash!=null&&hash.length()<512)state.putString("route","#"+hash);}}
  state.putBoolean("choosing",picker!=null);if(saving&&pending!=null){state.putBoolean("saving",true);state.putString("exportPath",pending.getAbsolutePath());state.putString("exportName",exportName);state.putString("exportMime",exportMime);}
 }
 private WebResourceResponse response(int status,String mime,InputStream stream){return new WebResourceResponse(mime,"UTF-8",status,status==200?"OK":"Unavailable",Collections.singletonMap("Cache-Control","no-cache"),stream);}
 private WebResourceResponse resource(WebResourceRequest r){
  if(!local(r.getUrl()))return response(403,"text/plain",new ByteArrayInputStream("Offline test container".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
  String path=r.getUrl().getPath();
  if(path.startsWith("/api/"))return response(503,"application/json",new ByteArrayInputStream("{\"message\":\"网络适配器未接管此请求，请重新打开应用后重试。\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
  if(!"GET".equals(r.getMethod())||path.contains("..")||path.contains("\\"))return response(404,"text/plain",new ByteArrayInputStream(new byte[0]));
  if(path.equals("/"))path="/index.html";
  if(Arrays.asList("/android-network.js","/android-runtime.js","/android-storage.js").contains(path)){
   try{return response(200,"text/javascript",getAssets().open(path.substring(1)));}catch(IOException e){return response(404,"text/plain",new ByteArrayInputStream(new byte[0]));}
  }
  if(path.equals("/index.html")){
   try(InputStream in=getAssets().open("site/index.html");ByteArrayOutputStream out=new ByteArrayOutputStream()){
    byte[] buffer=new byte[8192];for(int n;(n=in.read(buffer))!=-1;)out.write(buffer,0,n);
    String html=new String(out.toByteArray(),java.nio.charset.StandardCharsets.UTF_8);
    String bootstrap="<head><script src=\"/android-storage.js\"></script><script src=\"/android-runtime.js\"></script><script src=\"/android-network.js\"></script>";
    if(!html.contains("<head>"))throw new IOException("Missing document head");
    return response(200,"text/html",new ByteArrayInputStream(html.replace("<head>",bootstrap).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
   }catch(IOException e){return response(500,"text/plain",new ByteArrayInputStream("Application bootstrap failed".getBytes(java.nio.charset.StandardCharsets.UTF_8)));}
  }
  String mime=URLConnectionMime(path);
  try{return response(200,mime,getAssets().open("site"+path));}catch(IOException e){return response(404,"text/plain",new ByteArrayInputStream(new byte[0]));}
 }
 private static String URLConnectionMime(String path){
  if(path.endsWith(".js")||path.endsWith(".mjs"))return "text/javascript";
  if(path.endsWith(".wasm"))return "application/wasm";
  if(path.endsWith(".json"))return "application/json";
  if(path.endsWith(".gz"))return "application/gzip";
  String mime=java.net.URLConnection.guessContentTypeFromName(path);return mime==null?"application/octet-stream":mime;
 }
 private void exportBlob(String url,String name,String mime){web.evaluateJavascript("window.__mistSave?.("+org.json.JSONObject.quote(url)+","+org.json.JSONObject.quote(name)+","+org.json.JSONObject.quote(mime==null?"application/octet-stream":mime)+")",null);}
 private void toast(String message){runOnUiThread(()->Toast.makeText(this,message,Toast.LENGTH_LONG).show());}
 public final class ExportBridge {
  @JavascriptInterface public synchronized void begin(String name,String mime)throws IOException{
   if(saving||pending!=null)throw new IOException("请先完成上一次保存");
   pending=File.createTempFile("export-",".tmp",getCacheDir());output=new FileOutputStream(pending);written=0;
   exportName=name.replaceAll("[\\\\/:*?\"<>|]","_");exportMime=mime;
  }
  @JavascriptInterface public synchronized void chunk(String text)throws IOException{
   if(output==null)throw new IOException("没有导出任务");byte[] bytes=android.util.Base64.decode(text,0);written+=bytes.length;if(written>134217728)throw new IOException("导出超过128 MiB");output.write(bytes);
  }
  @JavascriptInterface public synchronized void finish()throws IOException{
   if(output==null)throw new IOException("没有导出任务");output.close();output=null;saving=true;
   runOnUiThread(()->{try{Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).setType(exportMime).addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE,exportName);startActivityForResult(intent,11);}catch(Exception e){cleanup();toast("无法打开保存位置");}});
  }
  @JavascriptInterface public synchronized void abort(){if(!saving)cleanup();}
 }
 private synchronized void cleanup(){try{if(output!=null)output.close();}catch(IOException ignored){}output=null;if(pending!=null)pending.delete();pending=null;saving=false;}
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);
  if(request==10&&picker!=null){picker.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data));picker=null;}
  if(request==11){if(result==RESULT_OK&&data!=null&&data.getData()!=null&&pending!=null){final Uri dest=data.getData();new Thread(()->{try(InputStream in=new FileInputStream(pending);OutputStream out=getContentResolver().openOutputStream(dest)){if(out==null)throw new IOException();byte[] buffer=new byte[65536];for(int n;(n=in.read(buffer))!=-1;)out.write(buffer,0,n);toast("已保存文件");}catch(Exception e){toast("保存失败，请重新导出");}finally{cleanup();}}).start();}else cleanup();}
 }
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(picker!=null)picker.onReceiveValue(null);denyMicrophonePermission();network.close();web.removeJavascriptInterface("MistStorage");web.removeJavascriptInterface("MistNetwork");web.removeJavascriptInterface("MistExport");web.destroy();web=null;if(!saving)cleanup();super.onDestroy();}
}
