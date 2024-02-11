Storage.prototype.setItem = new Proxy(Storage.prototype.setItem, {
    apply(target, thisArg, argumentList) {
        const value = argumentList[1];
        // modify just value to support complex objects
        argumentList[1] = JSON.stringify(value)
        return Reflect.apply(target, thisArg, argumentList);
    },
});

const originGetItem = Storage.prototype.getItem
Storage.prototype.getItem = new Proxy(Storage.prototype.getItem, {
    apply(target, thisArg, argumentList) {
        const itemValue = Reflect.apply(target, thisArg, argumentList);
        const result = tryParse(itemValue);
        return result;
    },
});
