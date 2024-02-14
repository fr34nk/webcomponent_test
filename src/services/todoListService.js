class TodoListService {
    constructor (config={
        resource_url
    }) {
        this.url = config.resource_url;
    }

    async createList (list) {
        const url = new URL(this.url)
        url.pathname = 'lists';

        if (!list.title) {
            throw new Error(`Invalid list object: ${list}`)
        }

        return await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(list)
        }).then(x => x.json())
        .catch(err => { throw err; })
    }

    async getLists () {
        const url = new URL(this.url)
        url.pathname = 'lists';
        return fetch(url.toString())
            .then(response => { 
                return response.json();
            })
    }

    async getListBy (id) {
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
        return await fetch(url.toString())
            .then(response => { 
                return response.json();
            })
            .then(json => {
                if (!json || json.error) return undefined;

                if (Array.isArray(json)) {
                    let lists = [];
                    for (let list of json) {
                        const List = {
                            id: list.id,
                            title: list.title
                        }
                        lists.push(List)
                    }
                    return lists;
                }
                return json;
            })
            .catch(err => { 
                console.error(`Error fetching list: ${err}. Returning undefined`)
                return undefined
            })
    }

    async getTasks (listId) {
        const url = new URL(this.url)
        url.pathname = 'tasks';
        url.search = `listId=${listId}`;

        return fetch(url.toString(), {
            cache: 'no-cache',
        })
            .then(response => {
                return response.json()
            })
            .then((json) => {
                if (!json) return [];
                let taskResponse = Array.isArray(json) ? json : [json];

                let taskList = [];
                for (let task of taskResponse) {
                    const Task = {
                        id: task.id,
                        listId: task.listId,
                        description: task.title,
                        insertDate: task?.insertDate
                    }
                    taskList.push(Task)
                }
                return taskList;
            })
            .catch(err => {
                throw err;
            })
    }

    async addTask (task) {
        const url = new URL(this.url)
        url.pathname = 'tasks';

        const normTask = {
            ...task,
        }
        delete normTask.header;

        fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(normTask)
        })
        .then(x => x.json())
        .then(json => json?.tasks?.map(task => ({ ...task, title: task.header })))
        .catch(e => { throw e; })
    }

}

const ENDPOINT_URL = 'http://127.0.0.1:8082/'

function getTodoListService () {
    return new TodoListService({
        resource_url: ENDPOINT_URL 
    })
}

export {
    getTodoListService
} 




