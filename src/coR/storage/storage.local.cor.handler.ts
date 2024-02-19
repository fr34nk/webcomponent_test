import { ListPropose } from "../../types/List";
import { TaskPropose } from "../../types/Task";
import { StorageCoRHandler } from "./storage.cor.handler";
import { HandlerRequestType, StorageHandlers } from "./storage.cor.interface";

class StorageLocalHandler extends StorageCoRHandler 
{
    public name = StorageHandlers.STORAGE_LOCAL_HANDLER;

    public async handleInsertOperation (request: HandlerRequestType) {
        if (request.payload.type == 'insert_list') {
            try {
                const listPropose = new ListPropose(
                    request.payload.value.title
                )
                const result =  await this.service.addList(listPropose);
                return result;
            } catch (e) {
                console.log('resultE');
                console.log(e);

                return await this.nextHandler.handle({ 
                    ...request, 
                    type: StorageHandlers.STORAGE_LOCAL_HANDLER 
                })
            }
        }

        if (request.payload.type == 'insert_task') {
            try {
                const { checked, insertDate, listId, title } = request.payload.value;
                const taskPropose = new TaskPropose(listId, title, insertDate, checked);
                return await this.service.addTask(taskPropose);
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
    StorageLocalHandler
}