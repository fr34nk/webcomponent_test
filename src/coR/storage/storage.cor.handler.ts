import { StorageStrategyInterface } from "../../strategy/storage/todolist/storage.strategy.interface";
import { HandlerRequestType, StorageHandlers, StorageCoRHandlerInterface } from "./storage.cor.interface";

const DEBUG = true

/**
 * The default chaining behavior can be implemented inside a base handler class.
 */
abstract class StorageCoRHandler implements StorageCoRHandlerInterface
{
    public name: StorageHandlers;
    public service: StorageStrategyInterface;
    public nextHandler: StorageCoRHandlerInterface;

    public setservice (service: StorageStrategyInterface) {
        this.service = service;
    }

    public setNext(handler: StorageCoRHandler): StorageCoRHandler {
        this.nextHandler = handler;
        // Returning a handler from here will let us link handlers in a
        // convenient way like this:
        // concreteHanlderA.setNext(concreteHanlderB).setNext(concreteHandlerC);
        return handler;
    }

    public async handle (request: HandlerRequestType): Promise<any> {
        if (DEBUG) {
            console.log("Hanlder Name: ", this.name)
            console.log("request: ", request)
        }
        try {
            if (request.type != this.name) {
                if (this.nextHandler && this.nextHandler.name == request.type) {
                    return await this.nextHandler.handle(request);
                }
            }

            if (
                request.payload.type === 'get_list' 
                || request.payload.type === 'get_task'
            ) {
                return await this.handleGetOperation(request);
            }

            if (
                request.payload.type === 'getby_name_list'
                || request.payload.type === 'getby_name_task'
            ) {
                return await this.handleGetByNameOperation(request);
            }

            if (
                request.payload.type === 'insert_list'
                || request.payload.type === 'insert_task' 
            ) {
                return await this.handleInsertOperation(request);
            }

            if (
                request.payload.type === 'remove_list'
                || request.payload.type === 'remove_task'
            ) {
                return await this.handleRemoveOperation(request);
            }

            return await this.nextHandler.handle(request);
        } catch (e) {
            console.log(`[${this.name}] Error: `);

            if (e.name == 'AbortError') {
                console.log('Aborted request: ', request);
            } else {
                console.dir(e)
            }

            console.log(`Trying to call next handler`);

            return await this.nextHandler.handle({ 
                ...request, 
                type: StorageHandlers.STORAGE_LOCAL_HANDLER 
            })
        }
    }

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

    public async handleInsertOperation (request: HandlerRequestType) {
        if (request.payload.type == 'insert_list') {
            try {
                return await this.service.addList(request.payload.value);
            } catch (e) {
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER 
                })
            }
        }
        if (request.payload.type == 'insert_task') {
            try {
                return await this.service.addTask(request.payload.value);
            } catch (e) {
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER 
                })
            }
        }
    }

   public async handleGetByNameOperation (request: HandlerRequestType) {
        if (request.payload.type == 'getby_name_list') {
            try {
                    return await this.service.getListByName(request.payload.value);
            } catch (e) {
                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER 
                })
            }
        } 
    }

    private async handleRemoveOperation (request: HandlerRequestType) {
        throw 'not implemented'
    }
}


export {
    StorageCoRHandler
}