const FEAT_RESET_LIST_ITEMS = false;
const FEAT_ENABLE_LOCAL = false;
import template from './todo-list.tpl.html';

import { getEventBus } from '../../services/eventBus'

import { todoListService } from '../../services/todoApiService';

import { TodoApiStorageStrategy } from '../../strategy/storage/todolist/api.strategy';
import { TodoLocalStorageStrategy } from '../../strategy/storage/todolist/local.strategy';

import { TodoStorageStrategy } from '../../strategy/storage/todolist/storage.strategy';
import { StorageStrategyInterface } from '../../strategy/storage/todolist/storage.strategy.interface';
import { List, ListPropose } from '../../types/List';
import { Task, TaskPropose } from '../../types/Task';
import { getDateFormat } from '../../utils/utils';
import { TaskElement, TaskElementInterface } from '../task/task.wbc';
import { StorageCoRHandler } from '../../coR/storage/storage.cor.handler';
import { StorageLocalHandler } from '../../coR/storage/storage.local.cor.handler';
import { StorageApiHandler } from '../../coR/storage/storage.api.cor.handler';
import { StorageHandlers } from '../../coR/storage/storage.cor.interface';

class TodoListElement extends HTMLElement {
   static element_name: string;
   public selectors = {
      title: '.modal-header slot[name="title"]',
      listContainer: '.item-list-container',
      inputListTitle: '.header-input',
      inputTaskTitle: '.description-input',
      addTaskButton: '.editable-list-add-item'
   };

   public eventBus: any;
   public localstorage: any;
   public apiService: any;

   public storage: StorageCoRHandler;
   public itemListEl: HTMLElement;

   public shadow: any;

   constructor() {
      // @ts-ignore
      super();

      this.eventBus = getEventBus();
      this.apiService = todoListService as any;

      const localStorageStrategy = new TodoStorageStrategy(new TodoLocalStorageStrategy())
      const localStorageHandler = new StorageLocalHandler()
      localStorageHandler.setservice(localStorageStrategy);

      const apiStrategy = new TodoApiStorageStrategy(this.apiService)
      const apiHandler = new StorageApiHandler()
      apiHandler.setservice(apiStrategy)
      apiHandler.setNext(localStorageHandler);

      this.storage = apiHandler;

      this.populateLocalStorage();
      
      // attaches shadow tree and returns shadow root reference
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
      this.shadow = this.attachShadow({ mode: 'open' });

      const parser = new DOMParser();
      const tpl = parser.parseFromString(template, 'text/html')
      const templateEl: any = tpl.querySelector('#template')

      this.shadow.appendChild(templateEl.content.cloneNode(true))
      const listItems = [] as any[];
   }

   populateLocalStorage() {
      localStorage.setItem('todo_lists', [
         {
            id: 1,
            title: 'Market'
         },
         {
            id: 2,
            title: 'Work'
         }
      ] as unknown as string)

      localStorage.setItem('todo_tasks', [
         {
            id: 1,
            listId: 1,
            title: 'make market 1',
            insertDate: '2024/02/12 13:30',
            checked: true
         },
         {
            id: 2,
            lsitId: 1,
            title: 'make market 2',
            insertDate: '2024/02/16 13:30',
            checked: false
         },
         {
            id: 1,
            listId: 2,
            title: 'make work 1',
            insertDate: '2024/02/14 13:30',
            checked: true
         }
      ] as unknown as string);
   }

   renderTask(listItem: List, taskItem: Task) {
      const _this = this;
      const taskEl = document.createElement(TaskElement.element_name) as HTMLElement & TaskElementInterface;

      taskEl.props = {
         title: listItem.title,
         description: taskItem.title,
         insertDate: taskItem.insertDate,
         checked: taskItem.checked,
         onTaskRemove: function () {
            taskEl.remove()
         },
         onToggleFinish: (function (item: Task) {
            const taskItem: Task = { ...item, checked: !item.checked };
            taskEl.replaceWith(_this.renderTask(listItem, taskItem))
         }).bind(this, taskItem)
      }

      return taskEl;
   }

   onHeaderInputChange(callback: any) {
      // TODO: autofilter
      // const headerInput = document.querySelector('.header-input');
      // headerInput.addEventListener('change', (e) => {
      //   console.log(e)
      // })
   }
   connectedCallback() {
      this.insertEl(this.shadow, 'title', this.title)
      this.onHeaderInputChange({})
      const addElementButton = this.getEl(this.shadow, 'addTaskButton');
      addElementButton.addEventListener('click', this.addNewTask.bind(this), false);
      this.populateTasks()
   }

   getInputFormValues () {
      const inputNameEl = this.getEl(this.shadowRoot, 'inputListTitle') as HTMLInputElement;
      const descriptionInputEl = this.getEl(this.shadowRoot, 'inputTaskTitle') as HTMLInputElement;
      return {
         listTitle: inputNameEl?.value,
         taskTitle: descriptionInputEl?.value
      }
   }

   resetInputFormValues () {
      const inputNameEl = this.getEl(this.shadowRoot, 'inputListTitle') as HTMLInputElement;
      const descriptionInputEl = this.getEl(this.shadowRoot, 'inputTaskTitle') as HTMLInputElement;
      inputNameEl.value = '';
      descriptionInputEl.value = '';
   }

   async addNewTask(e: EventTarget) {
      const { listTitle, taskTitle } = this.getInputFormValues()

      if (listTitle) {
         let list = await this.storage.handle({
            type: StorageHandlers.STORAGE_API_HANDLER,
            payload: {
               type: 'getby_name_list',
               value: listTitle
            }
         });

         const addedTask = await this.storage.handle({
            type: StorageHandlers.STORAGE_API_HANDLER,
            payload: {
               type: 'insert_task',
               value: list.id
            }
         });

         this.insertEl(
            this.shadow, 
            'listContainer',
            this.renderTask(list as any, addedTask as any)
         );

         window.dispatchEvent(new CustomEvent('add_todo_item', {
            detail: {
               // item: newTaskPropose
               item: addedTask
            }
         }))
      }

      this.resetInputFormValues()
   }

   async populateTasks () {
      this.itemListEl = this.shadowRoot.querySelector('.item-list-container');

      const lists = await this.storage.handle({
         type: StorageHandlers.STORAGE_API_HANDLER,
         payload: {
            type: 'get_list'
         }
      });
      for (let list of lists) {
         const tasks = await this.storage.handle({
            type: StorageHandlers.STORAGE_API_HANDLER,
            payload: {
               type: 'get_task',
               value: list.id
            }
         });

         if (tasks) {
            tasks.forEach((taskItem: Task) => {
               const task = new Task(
                  taskItem.id as number,
                  list.id,
                  taskItem.title,
                  !taskItem.insertDate
                     ? getDateFormat(new Date()).Date_Time_Period
                     : taskItem.insertDate,
                  taskItem.checked
               )
               const renderedTask = this.renderTask(list, task);
               this.itemListEl.appendChild(renderedTask);
            })
         }
      }
   }

   notifyChange(type: string, subtype: string, item: List) {
      this.dispatchEvent(new CustomEvent('todo_list', {
         detail: {
            type: type,
            subtype: subtype,
            payload: {
               item
            }
         },
         bubbles: true
      }))
   }

   public getEl (dom: undefined|HTMLElement|ShadowRoot, selector: keyof TodoListElement['selectors']) {
      return dom.querySelector(this.selectors[selector]);
   }

   public insertEl (dom: undefined|HTMLElement, selector: keyof TodoListElement['selectors'], value: string|HTMLElement|HTMLCollection) {
      if (value instanceof HTMLElement) {
         const node = dom.querySelector(this.selectors[selector]);
         if (node) {
            if (value?.children instanceof HTMLCollection) {
               node.appendChild(value);
            } else {
               node.append(value)
            }
         }
      }

      if (typeof value == 'string') {
         const node = dom.querySelector(this.selectors[selector]);
         if (node) {
            node.textContent = value
         }
      }
   }
}

TodoListElement.element_name = 'todolist-el'

function defineTodoList(_template: string = '') {
   customElements.define(TodoListElement.element_name, TodoListElement)
}

export {
   TodoListElement,
   defineTodoList
}
