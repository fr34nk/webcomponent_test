import { List } from "../types/List";
import { Task } from "../types/Task";
import { fetchWithTimeout } from "../utils/utils";

class TodoListService {
    private url: string;

    constructor (config: { resource_url: string }) {
        this.url = config.resource_url;
    }

    async createList (list: List) {
        const url = new URL(this.url)
        url.pathname = 'lists';

        if (!list.title) {
            throw new Error(`Invalid list object: ${list}`)
        }

        return await fetchWithTimeout(url.toString(), {
            timeout: 500,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(list)
        })
        .then(x => x.json())
        .then(json => json.list)
        .catch(err => { throw err; })
    }

    async getLists (): Promise<List[]> {
        const url = new URL(this.url)
        url.pathname = 'lists';

        return fetchWithTimeout(url.toString(), {
            timeout: 500
        })
            .then(response => { 
                return response.json();
            })
            .then(json => {
                return json.lists.map((item: List) => {
                    return new List(item.id, item.title);
                });
            })
            .catch(e => {
                throw e;
            })
    }

    async getListBy (id: number|string): Promise<List> {
        const url = new URL(this.url)
        url.pathname = 'lists';

        if (id) {
            switch (typeof id) {
                case 'number': {
                    url.search = `id=${id}`;
                }; break;
                case 'string': {
                    url.search = `name=${id}`;
                }; break;
                default: {
                    throw new Error(`Unknown lsit identification type (id=${id}`)
                }
            }
        }
        return await fetchWithTimeout(url.toString(), {
            timeout: 500
        })
            .then(response => { 
                return response.json();
            })
            .then(json => {
                if (!json || json.error) return undefined;
                const { id, title } = json.list;
                return new List(id, title);
            })
            .catch(err => { 
                throw `Error fetching list: ${err}. Returning undefined`;
            })
    }

    async getTasks (listId: number): Promise<Task[]> {
        const url = new URL(this.url)
        url.pathname = 'tasks';
        url.searchParams.set('listId', String(listId));

        return fetchWithTimeout(url.toString(), {
            timeout: 500,
            cache: 'no-cache',
        })
            .then(response => {
                return response.json()
            })
            .then((json) => {
                if (json.tasks) {
                    let taskList = [];
                    for (let task of json.tasks as Task[]) {
                        const newTask = new Task(
                            task.id as number,
                            task.listId,
                            task.title,
                            task?.insertDate,
                            task.checked
                        )
                        taskList.push(newTask)
                    }
                    return taskList;
                }
                return [];
            })
            .catch(err => {
                throw err;
            })
    }

    async createTask (task: Task): Promise<Task> {
        const url = new URL(this.url)
        url.pathname = 'tasks';
        const normTask = {
            ...task,
        }
        // @ts-ignore
        delete normTask.header;

        return fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(normTask)
        })
        .then(x => x.json())
        .then(json => {
            const { id, listId, title, insertDate, checked } = json.task as Task;
            return new Task(
                id as number,
                listId,
                title,
                insertDate,
                checked
            )
        })
        .catch(e => { throw e; })
    }

}

const ENDPOINT_URL = 'http://127.0.0.1:8082/'

const todoListService = new TodoListService({
    resource_url: ENDPOINT_URL 
})

export {
    todoListService,
    TodoListService 
} 




