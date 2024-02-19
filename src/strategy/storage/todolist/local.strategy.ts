import { List, ListPropose } from "../../../types/List";
import { PendingValue } from "../../../types/PendingValue";
import { Task } from "../../../types/Task";
import { genUUID } from "../../../utils/utils";
import { StorageStrategyInterface } from "./storage.strategy.interface";

const LOCAL_STORAGE_LISTS_KEY = 'todo_lists'
const LOCAL_STORAGE_LISTS_PENDING_ADD_KEY = 'todo_lists_pending_add'
const LOCAL_STORAGE_TASKS_KEY = 'todo_tasks'
const LOCAL_STORAGE_TASKS_PENDING_ADD_KEY = 'todo_tasks_pending_add'

class TodoLocalStorageStrategy implements StorageStrategyInterface {
    async getLists (): Promise<List[]> {
        return new Promise(async (res, rej) => {
            const lists = await localStorage.getItem(LOCAL_STORAGE_LISTS_KEY) as unknown as Array<List>;
            res(lists.map(item => new List(
                item.id,
                item.title
            )))
        })
    }

    async getListByName (name: string): Promise<List> {
        const lists = localStorage.getItem(LOCAL_STORAGE_LISTS_KEY) as unknown as Array<List>;
        return new Promise((res, rej) => {
            const list = lists.find(item => item.title == name);
            res(list);
        })
    }

    async addList (list: List|ListPropose): Promise<List> {
        return new Promise(async (res, rej) => {
            const addedList = await this._addItem<List>(LOCAL_STORAGE_LISTS_KEY, list);
            res(addedList)
        })
    }

    async getTasks (listId: number): Promise<Task[]> {
        return new Promise((res, rej) => {
            const tasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY) as unknown as Task[] || [];
            res(tasks.filter(task => task.listId == listId))
        })
    }

    async addTask (task: Task): Promise<Task> {
        if (!task.id) {
            task.id = new PendingValue('id', genUUID());
        }

        return new Promise((res, rej) => {
            res(this._addItem<Task>(LOCAL_STORAGE_TASKS_KEY, task))
        })
    }

    async _addItem<T>(storageKey: string, value: T): Promise<T> {
        const valueList = (Array.isArray(value) ? value : [value]);

        const storedItems = localStorage.getItem(storageKey) as unknown as T[] || []; // always expect to be array
        storedItems.push(...valueList);

        const valuesToInsert = storedItems;
        await localStorage.setItem(storageKey, valuesToInsert as any);
        return value;
    }
}

export {
    TodoLocalStorageStrategy
}
