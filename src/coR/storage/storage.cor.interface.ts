import { StorageStrategyInterface } from "../../strategy/storage/todolist/storage.strategy.interface";
import { List, ListPropose } from "../../types/List";
import { Task, TaskPropose } from "../../types/Task";

export type ListPayload = {
    type: 'insert'|'get'|'remove';
    value: Partial<List>|List|undefined;
}

export type GetListRequest = {
    type: 'get_list'
}
export type GetTaskRequest = {
    type: 'get_task',
    value: List['id']
}

export type GetByNameListRequest = {
    type: 'getby_name_list',
    value: List['title']
}
export type GetByNameTaskRequest = {
    type: 'getby_name_task',
    value: Task['title']
}

export type InsertListRequest = {
    type: 'insert_list',
    value: ListPropose
}
export type InsertTaskRequest = {
    type: 'insert_task',
    value: Task|TaskPropose
}

export type RemoveListRequest = {
    type: 'remove_list';
    value: Partial<List>;
}
export type RemoveTaskRequest = {
    type: 'remove_task';
    value: Partial<List>;
}

export interface HandlerRequestType {
    type: StorageHandlers;
    payload: GetListRequest 
    | GetTaskRequest
    | GetByNameListRequest
    | GetByNameTaskRequest
    | InsertListRequest
    | InsertTaskRequest
    | RemoveListRequest
    | RemoveTaskRequest;
}

export enum StorageHandlers {
    STORAGE_API_HANDLER='STORAGE_API_HANDLER',
    STORAGE_LOCAL_HANDLER='STORAGE_STORAGE_HANDLER',
}

export interface StorageCoRHandlerInterface {
    name: StorageHandlers;
    service: StorageStrategyInterface;
    setNext(handler: StorageCoRHandlerInterface): StorageCoRHandlerInterface|void;
    handle(request: HandlerRequestType): Promise<HandlerRequestType|undefined>;
}

