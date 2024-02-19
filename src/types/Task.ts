import { genUUID, getDateFormat } from "../utils/utils";
import { PendingValue } from "./PendingValue";

export class Task {
    public id?: number | PendingValue<string>;
    public listId: PendingValue<string> | number;
    public title: string;
    public insertDate: string;
    public checked: boolean;

    constructor (
        id: number | PendingValue<string>,
        listId: number | PendingValue<string>, 
        title: string,
        insertDate: string,
        checked: boolean
    ) {
        this.id = id as number;
        this.listId = listId;
        this.title = title;
        this.insertDate = insertDate || getDateFormat().Date_Time_Period;
        this.checked = checked;
    }
}

export class TaskPropose extends Task {
    constructor (
        listId: PendingValue<string> | number,
        title: string,
        insertDate: string,
        checked: boolean
    ) {
        super(
            new PendingValue('id', genUUID()),
            listId,
            title,
            insertDate,
            checked,
        )
    }
}