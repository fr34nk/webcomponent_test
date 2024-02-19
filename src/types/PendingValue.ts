class PendingValue<T> {
    public pendingProperty: string;
    public provisoryValue: T;
    constructor (pendingProperty: string, provisoryValue: T | undefined = undefined) {
        this.pendingProperty = pendingProperty;
        this.provisoryValue = provisoryValue;
    }
}

export { 
    PendingValue
}