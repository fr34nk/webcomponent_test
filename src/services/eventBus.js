class StorageEventBus {
  constructor(name='default') {
    this._busname = name;
    this._events = []
  }

  updateStorageObserver () {
    window.addEventListener('localstorage', (e=StorageEvent) => {
      const storageItemKey = e.detail.key;
      this._events.forEach(([key, eventCallback]) => {
        if (key == storageItemKey) {
          eventCallback(e)          
        }
      })
    })
  }

  propObserve(property, callback) {
    this._events.push([property, callback])
    this.updateStorageObserver();
  } 
    
  propObserveRemove(property,) {
    const foundEventIdx = this._events.findIndex(x => x[0] == property);
    this._events.slice(foundEventIdx, foundEventIdx + 1);
  }  
}

function getEventBus () {
    if (!document.eventBus) {
        document.eventBus = new StorageEventBus();
    } 
    return document.eventBus;
}

export {
  getEventBus
}