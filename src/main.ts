import './utils/storageProxy.js'
import './utils/storageProxyObject.js'

import { TodoListElement } from "./components/todo-list/todo-list.wbc"
import { TaskElement } from "./components/task/task.wbc"


if (!customElements.get(TaskElement.element_name)) {
    customElements.define(TaskElement.element_name, TaskElement);
}

if (!customElements.get(TodoListElement.element_name)) {
    customElements.define(TodoListElement.element_name, TodoListElement);
}


window.onunhandledrejection = function (e) {
    throw e
}
