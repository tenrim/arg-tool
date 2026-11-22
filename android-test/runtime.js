// App lifecycle owns permission cleanup; recording and saved bytes stay in the tools.
(() => {
  if (window.__mistReleaseMicrophone || !navigator.mediaDevices?.getUserMedia) return;
  const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  const tracks = new Set();
  let revision = 0;
  Object.defineProperty(window,'__mistReleaseMicrophone',{value() {
    revision++;
    for (const track of tracks) track.stop();
    tracks.clear();
  }});
  navigator.mediaDevices.getUserMedia = async constraints => {
    const current = revision;
    const stream = await original(constraints);
    if (current !== revision || document.hidden) {
      for (const track of stream.getTracks()) track.stop();
      throw new DOMException('应用已离开前台，请重新开始录音。','AbortError');
    }
    for (const track of stream.getTracks()) {tracks.add(track);track.addEventListener('ended',()=>tracks.delete(track),{once:true});}
    return stream;
  };
  addEventListener('pagehide',window.__mistReleaseMicrophone);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)window.__mistReleaseMicrophone();});
})();
