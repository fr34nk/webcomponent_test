class SiteStorage {
    constructor () {}

    getItem (key) {
        return localStorage.getItem(key)
    }

    setItem (key, value) {
        return localStorage.setItem(key, value);
    }

    addItem (key, value) {
        const valueList = (Array.isArray(value) ? value : [value]);

        const storedItems = this.getItem(key) || []; // always expect to be array
        storedItems.push(...valueList);

        const valuesToInsert = storedItems;
        return this.setItem(key, valuesToInsert);
    }

    removeItem (key) {
        localStorage.removeItem(key)
    }

    clear () {
        localStorage.clear()
    }
}

function getStorage () {
    if (!window._pagestore) {
        window._pagestore = new SiteStorage();
        return window._pagestore;
    }
    return window._pagestore;
}