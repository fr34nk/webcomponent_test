class TodoListService {
    constructor (config={
        resource_url
    }) {
        this.url = config.resource_url;
    }

    getLists (id) {
        const url = new URL(this.url)
        url.pathname = 'lists';

        if (id) {
            url.search = `id=${id}`;
        }
        fetch(url, {})
            .then(response => { 
                return response;
            })
    }

    getTasks (listId) {
        const url = new URL(this.url)
        url.pathname = 'tasks';
        url.search = `listId=${listId}`;

        return fetch({
            url: url
        })
            .then(r => r)
            .catch(err => {
                console.log('err');
                console.log(err);
            })
    }
}

const ENDPOINT_URL = 'http://127.0.0.2:8082/'

function getTodoListService () {
    return new TodoListService({
        resource_url: ENDPOINT_URL 
    })
}

export {
    getTodoListService
} 




