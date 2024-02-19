import { genUUID } from "../utils/utils";
import { PendingValue } from "./PendingValue";

export class List { 
    constructor (
        public id: number|undefined|PendingValue<string>, 
        public title: string
    ) {
        this.id = id || new PendingValue('id', genUUID())
        this.title = title;
    }
}


export class ListPropose extends List { 
    constructor (
        public title: string
    ) {
        super(
            new PendingValue('id', genUUID()),
            title
        )
    }
}



