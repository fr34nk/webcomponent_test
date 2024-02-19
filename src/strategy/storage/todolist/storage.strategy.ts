import { List } from "../../../types/List";
import { PendingValue } from "../../../types/PendingValue";
import { Task } from "../../../types/Task";
import { StorageStrategyInterface } from "./storage.strategy.interface";

class TodoStorageStrategy<T extends StorageStrategyInterface> implements StorageStrategyInterface {
    private strategy: T;

    constructor(strategy: T) {
        this.strategy = strategy;
    }

    public setStrategy(strategy: T) {
        this.strategy = strategy;
    }

    async getLists(): Promise<List[]> {
        return this.strategy.getLists();
    }
    async getListByName(name: string): Promise<List> {
        return this.strategy.getListByName(name);
    }
    async addList(list: List): Promise<List> {
        return await this.strategy.addList(list);
    }
    async getTasks(listId: number | PendingValue<string>): Promise<Task[]> {
        return this.strategy.getTasks(listId);
    }
    async addTask(task: Task): Promise<Task> {
        return this.strategy.addTask(task);
    }
}


export {
    TodoStorageStrategy
}