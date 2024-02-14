const express = require('express');
const db = require('./db.json');

const app = express();

const PORT = 8082;
const HOST = "127.0.0.1"
const DELAY = 0.5

const cors = require('cors');

class DataSource {
    constructor (initialState={
        lists: [],
        tasks: []
    }) {
        this.datasource = initialState;
    }

    get state () {
        return this.datasource;
    }
    get lists () {
        return this.datasource.lists;
    }
    get tasks () {
        return this.datasource.tasks;
    }

    getListById (id) {
        return this.datasource.lists.find(list => list.id == id);
    }

    getListByName (name) {
        return this.datasource
            .lists.find(list => list.title == name);
    }

    addList (list) {
        if (this.datasource.lists.includes({ title: list.title }))  {
            throw new Error(`Could not addList because list with this title already exists (title=${list.title}`)
        }
        const newId = this.datasource.lists.sort((a,b) => a < b ? 1 : -1)[0].id + 1;
        const List = { 
            id: newId, 
            title: list.title 
        }
        this.datasource.lists.push(List)
        return List;
    }

    getTask (listId) {
        return this.datasource.tasks.filter(task => task.listId == listId);
    }

    addTask (listId, task) {
        if (this.datasource.lists.findIndex(list => list.id == listId) == -1) {
            throw new Error('Could not add task because theres no list with this id: ', listId)
        }
        this.datasource.tasks.push({ ...task, listId: listId })
    }
}

const storage = new DataSource(db);

const delay = function (seconds) { 
    return new Promise((res, rej) => {
        setTimeout(function () {
            res(true);
        }, seconds * 1000)
    })
}

app.use(express.json())
app.use(
    cors({
        origin: true,
        credentials: true,
        preflightContinue: false,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    })
);

app.options('*', cors());

app.use((req, res, next) => {
    const request = {
        url: req.url,
        method: req.method,
        query: JSON.stringify(req.query),
        params: JSON.stringify(req.params),
    }
    console.log("REQ")
    console.dir(request);

    next();
})

app.use(async (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    await delay(DELAY)
    next();
});


app.get('/lists', (req,res) => {
    const params = req.query;
    res.setHeader('Content-Type', 'application/json')

    if (Object.entries(req.query).length == 0) {
        res.status(200)
        res.send({
            lists: storage.lists
        })
        res.end()
        return;
    }

    const listId = req.query.id;
    const listName = req.query.name;
    if (!listId && !listName) {
        res.status(200)
        res.send({
            error: 'required arguments: name | id | undefined'
        });
        res.end()
        return;
    }

    if (listId) {
        res.status(200)
        res.send({
            list: storage.getListById(listId)
        })
        res.end()
        return;
    }

    if (listName) {
        res.status(200)
        res.send({
            list: storage.getListByName(listName)
        })
        res.end()
        return;
    }

    return;
})

app.post('/lists', (req,res) => {
    const listTitle = req.body.title;
    if (!listTitle) {
        res.status(404)
        res.send(`Please insert list title. List title informed: ${listTitle}`);
        res.end()
    }

    const insertedList = storage.addList(req.body);
    res.setHeader('Content-Type', 'application/json')
    res.send({
        list: insertedList
    });
    res.end()
    return;
})

app.get('/tasks', (req,res) => {
    const query = req.query;
    res.setHeader('Content-Type', 'application/json')

    let result = db;
    if (query.listId) {
        result = storage.tasks.filter(task => task.listId == query.listId);
    }

    res.send(result)
    res.end()
})


app.post('/tasks', (req,res) => {
    res.setHeader('Content-Type', 'application/json')

    const listId = req.body.listId;
    if (!listId) {
        res.status(404)
        res.send({
            error: `Please insert list id. List id informed: ${listId}`
        })
        res.end()
        return
    }

    if (storage.lists.findIndex(list => list.id == listId) == -1) {
        res.status(404)
        res.send({
            error: `Theres no list with this id: ${listId}. Please inform a valid list id`
        })
        res.end()
        return
    }

    storage.addTask(listId, req.body);
    res.send({
        tasks: storage.tasks
    })
    res.end()
    return;
})


app.listen(PORT, HOST, () => {
    console.log(`Mock server listening inn ${HOST}:${PORT}`);
});