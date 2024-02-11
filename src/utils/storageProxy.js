// Will add functionality so custom event "localstorage"
// can be "oberved" in same window removing the following 
// restriction: https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
Storage.prototype.setItem = new Proxy(Storage.prototype.setItem, {
    apply(target, thisArg, argumentList) {
        const event = new CustomEvent('localstorage', {
            detail: {
                key: argumentList[0],
                oldValue: thisArg.getItem(argumentList[0]),
                newValue: argumentList[1],
            },
        });
        window.dispatchEvent(event);
        return Reflect.apply(target, thisArg, argumentList);
    },
});

Storage.prototype.removeItem = new Proxy(Storage.prototype.removeItem || {}, {
    apply(target, thisArg, argumentList) {
        const event = new CustomEvent('localstorage', {
            detail: {
                key: argumentList[0],
            },
        });
        window.dispatchEvent(event);
        return Reflect.apply(target, thisArg, argumentList);
    },
});

Storage.prototype.clear = new Proxy(Storage.prototype.clear || {}, {
    apply(target, thisArg, argumentList) {
        const event = new CustomEvent('localstorage', {
            detail: {
                key: '__all__',
            },
        });
        window.dispatchEvent(event);
        return Reflect.apply(target, thisArg, argumentList);
    },
});

