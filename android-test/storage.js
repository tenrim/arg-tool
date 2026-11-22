// Restore preferences before application modules read them. Notebook data stays in IndexedDB.
(() => {
  if (window.__mistStorageReady) return;
  const prototype=Storage.prototype, set=prototype.setItem, remove=prototype.removeItem, clear=prototype.clear;
  const saved=MistStorage.snapshot();
  if (saved) {
    const values=JSON.parse(saved);
    clear.call(localStorage);
    for(const [key,value] of Object.entries(values))set.call(localStorage,key,value);
  } else {
    const values=Object.create(null);
    for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);values[key]=localStorage.getItem(key);}
    MistStorage.initialize(JSON.stringify(values));
  }
  prototype.setItem=function(key,value){set.call(this,key,value);if(this===localStorage)MistStorage.put(String(key),String(value));};
  prototype.removeItem=function(key){remove.call(this,key);if(this===localStorage)MistStorage.remove(String(key));};
  prototype.clear=function(){clear.call(this);if(this===localStorage)MistStorage.clear();};
  Object.defineProperty(window,'__mistStorageReady',{value:true});
})();
