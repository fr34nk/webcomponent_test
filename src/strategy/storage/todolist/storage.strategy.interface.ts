import { List } from "../../../types/List";
import { PendingValue } from "../../../types/PendingValue";
import { Task } from "../../../types/Task";

interface StorageStrategyInterface {
    getLists (): Promise<List[]>;
    getListByName (name: string): Promise<List>;
    addList (list: List): Promise<List>;

    getTasks (listId: Task['id']): Promise<Task[]>;
    addTask (task: Task): Promise<Task>;
}

export {
    StorageStrategyInterface 
}
