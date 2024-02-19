import { TodoListService } from "../../../services/todoApiService";
import { List } from "../../../types/List";
import { Task } from "../../../types/Task";
import { StorageStrategyInterface } from "./storage.strategy.interface";


class TodoApiStorageStrategy implements StorageStrategyInterface {
    public apiService: TodoListService;

    constructor (service: TodoListService) {
        this.apiService = service;
    }

    async getLists(): Promise<List[]> {
        try {
            return await this.apiService.getLists();
        } catch (e) {
            throw e;
        }
    }

    async getListByName(name: string|string): Promise<List> {
        return await this.apiService.getListBy(name);
    }

    async addList(list: List): Promise<List> {
        return this.apiService.createList(list);
    }

    async getTasks(listId: number): Promise<Task[]> {
        return await this.apiService.getTasks(listId);
    }

    async addTask(task: Task): Promise<Task> {
        return await this.apiService.createTask(task);
    }
}

export {
    TodoApiStorageStrategy 
}



