import { List, ListPropose } from "../../types/List";
import { PendingValue } from "../../types/PendingValue";
import { Task, TaskPropose as TaskPending } from "../../types/Task";
import { StorageCoRHandler } from "./storage.cor.handler";
import { HandlerRequestType, StorageHandlers } from "./storage.cor.interface";

// StorageApiHandler will first try to make requests, if requests are successfull, will store
// the result in localstorage by calling nextHandler, if unsuccessfull, will also call
// localStorage as nextHandler but storing ListPropose and TaskPropose payloads
class StorageApiHandler extends StorageCoRHandler 
{
    public name = StorageHandlers.STORAGE_API_HANDLER;

    public async handleGetOperation (request: HandlerRequestType) {
        if (request.payload.type == 'get_list') {
            try {
                const lists = await this.service.getLists();
                return lists;
             } catch (e) {
                throw e;
             }
        }
        if (request.payload.type == 'get_task') {
            try {
                return await this.service.getTasks(request.payload.value);
            } catch (e) {
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER 
                })
            }
        }
    }

    /**
     * Try to get list, if couldnt get it, store temporary list, and try add
     * listItem to pending request queue, and try to request later
     * @param request 
     * @returns 
     */
    public async handleGetByNameOperation (request: HandlerRequestType) {
        if (request.payload.type == 'getby_name_list') {
            try {
                const list = await this.service.getListByName(request.payload.value);
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER,
                    payload: {
                        ...request.payload,
                        type: 'insert_list',
                        value: list
                    }
                })
            } catch (e) {
                const listPropose = new ListPropose(request.payload.value)
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER,
                    payload: {
                        ...request.payload,
                        type: 'insert_list',
                        value: listPropose
                    }
                })
            }
        } 
    }

    public async handleInsertOperation (request: HandlerRequestType) {
        if (request.payload.type == 'insert_list') {
            try {
                const list = await this.service.addList(request.payload.value);
                console.log('list');
                console.log(list);
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER,
                    payload: {
                        ...request.payload,
                        value: list
                    }
                })
            } catch (e) {
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER 
                })
            }
        }
        if (request.payload.type == 'insert_task') {
            try {
                const requestTask = request.payload.value;
                const listId = requestTask.listId;

                // listId = PendingValue means list was not created by api, it was stored
                // so we need to build a pending task too
                if (listId instanceof PendingValue || requestTask.id instanceof PendingValue) {

                    const pendingTask = new TaskPending(
                        requestTask.listId,
                        requestTask.title,
                        requestTask.insertDate,
                        requestTask.checked
                    );

                    return await this.nextHandler.handle({ 
                        ...request, 
                        type: StorageHandlers.STORAGE_LOCAL_HANDLER,
                        payload: {
                            ...request.payload,
                            value: pendingTask
                        }
                    })

                } else {
                    const createdTask = await this.service.addTask(requestTask);
                    return await this.nextHandler.handle({ 
                        ...request, 
                        type: StorageHandlers.STORAGE_LOCAL_HANDLER,
                        payload: {
                            ...request.payload,
                            value: createdTask 
                        }
                    })
                }
            } catch (e) {
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER 
                })
            }
        }
    }
}

export {
    StorageApiHandler 
}