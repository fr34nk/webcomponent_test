const RESET_LIST_ITEMS=false;

import { getEventBus } from '../../services/eventBus'
import { getStorage } from '../../services/storageService'
import { getTodoListService } from '../../services/todoListService';
import { getDateFormat } from '../../utils/utils';

const COMPONENT_NAME = 'todo-list'

function defineTodoList (template) {
  if (!customElements.get(COMPONENT_NAME)) {

    class TodoList extends HTMLElement {
      constructor() {
        super();
        this.eventBus = getEventBus();
        this.storage = getStorage();
        this.apiService = getTodoListService();
        
        if (RESET_LIST_ITEMS) {
          this.getTasksFromStore();
        }

        // attaches shadow tree and returns shadow root reference
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
        const shadow = this.attachShadow({ mode: 'open' });

        const editableListContainer = document.createElement('div');

        const title = this.title;
        const addItemText = this.addItemText;
        const listItems = [];

        editableListContainer.classList.add('editable-list');
        editableListContainer.innerHTML = this.htmlBuildContainer(listItems)

        this.addListItem = this.addTaskItem.bind(this);

        shadow.appendChild(editableListContainer);
      }

      async getLists (listId) { }

      getTasksFromStore () {
        this.storage.removeItem('todo_list');
        this.storage.addItem('todo_list', [{
            id: 0,
            header: 'Someone',
            description: 'No descrption yet',
            checked: true,
            insertDate: getDateFormat(new Date()).Date_Time_Period
          },
          {
            id: 1,
            header: 'That I know',
            description: 'No descrption yet',
            checked: false,
            insertDate: getDateFormat(new Date()).Date_Time_Period
          }
        ])
        this.storage.addItem('todo_list', {
          id: 2,
          header: 'I used to know',
          description: 'No descrption yet',
          checked: true,
          insertDate: getDateFormat(new Date()).Date_Time_Period
        })
        return this.storage.getItem('todo_list');
      }

      htmlBuildContainer (listItems) {
        return `
          <link href="../../vendors/bootstrap/dist/css/bootstrap.css" rel="stylesheet">
          <style>
            li, div > div {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .icon {
              border: none;
              cursor: pointer;
              float: right;
              font-size: 1.8rem;
            }
          </style>

          <div class="vstack modal-cotent rounded-4">

            <div class="modal-content rounded-4 border-1 shadow p-4">

              <div class="modal-header p-2 pb-4 border-bottom-0">
                <h3 class="modal-header border-bottom-0 display-6 lh-1 fw-bold">${this.title}</h3>
              </div>

              <div class="hstack">
                <div class="vstack"> 

                  <div class="header-input-container form-floating mb-3">
                    <input type="email" class="header-input form-control rounded-3" id="floatingInput" placeholder="Header" style="background-size: auto 24px !important; transition: background 0s ease 0s !important;">
                    <label for="floatingInput">Header</label>
                  </div>

                  <div class="form-floating mb-3">
                    <input class="description-input form-control rounded-3" id="floatingPassword" placeholder="Description" >
                    <label for="floatingPassword">Description</label>
                  </div>

                  <!--
                  <div class="form-floating mb-3">
                    <input form-control type="datetime-local" id="notificationTime" class="notification-time-input form-control rounded-3" placeholder="Notification Time" >
                    <label for="notificationTime">Notification Time</label>
                  </div>
                  -->

                  <div class="w-100 px-4">
                    <button class="btn-primary btn-md w-100 flex-fill editable-list-add-item btn icon px-4 gap-3">+</button>
                  </div>

                </div>
              </div>
            </div>

            <div class="modal-content rounded-4 ">
              <div class="row"> 
                <div class="item-list d-flex flex-column flex-md-row p-4 gap-4 py-md-5 align-items-center justify-content-center">
                  ${listItems.map(htmlItem => `
                    ${htmlItem}
                  `).join('')}
                </div>
              </div>
            </div> 
          </div>
        `;
      }

      renderTask (item) {
        const _this = this;
        const task = document.createElement('task-item')

        task.onTaskRemove = function (item) {
          task.remove()
        }

        task.onTaskFinish = (function (item) {
          console.log("finish: ", item)
          task.replaceWith(_this.renderTask({ ...item, checked: !item.checked }))
        }).bind(this, item)

        task.header = item.header;
        task.description = item.description;
        task.insertDate = item.insertDate;
        task.isChecked = item.checked;

        return task;
      }

      onHeaderInputChange (callback) {
        // TODO: autofilter
        // const headerInput = document.querySelector('.header-input');
        // headerInput.addEventListener('change', (e) => {
        //   console.log(e)
        // })
      }

      storeGetItemIds () {
        console.log('this.storage');
        console.log(this.storage);
        const items = this.storage.getItem('todo_list');
        return items.map(item => item.id);
      }

      storeGetNewId () {
        return this.storeGetItemIds().sort().pop() + 1
      }

      storeAddItem (item) {
        const items = this.storage.getItem('todo_list');
        items.push(item);
        this.storage.setItem('todo_list', items);
      }

      storeUpdateItem (itemId, updateItemPayload) {
        const items = this.storage.getItem('todo_list');
        const foundItemIdx = items.findIndex((item) => item.id == itemId);
        const foundItem = items[foundItemIdx];
        const updatedItem = {
          ...foundItem,
          ...updateItemPayload
        }
        const newItems = [...items.slice(0, foundItemIdx), updatedItem, ...items.slice(foundItemIdx+1)];
        this.storage.setItem('todo_list', newItems);
      }

      addTaskItem(e) {
        const headerInput = this.shadowRoot.querySelector('.header-input');
        const descriptionInput = this.shadowRoot.querySelector('.description-input');
        if (headerInput.value) {

          const item = {
            id: this.storeGetNewId(),
            header: headerInput.value,
            description: descriptionInput?.value || 'No description yet',
            checked: false,
            insertDate: getDateFormat(new Date()).Date_Time_Period
          }

          this.itemList.appendChild(this.renderTask(item, {}));
          this.storeAddItem(item);

          window.dispatchEvent(new CustomEvent('add_todo_item', {
            detail: {
              item
            }
          }))
          headerInput.value = '';
          descriptionInput.value = '';
        }
      }

      async connectedCallback() {
        this.onHeaderInputChange({})

        const addElementButton = this.shadowRoot.querySelector('.editable-list-add-item');

        this.itemList = this.shadowRoot.querySelector('.item-list');

        let tasks;
        // let tasks = await this.apiService.getLists(1)
        if (!tasks) {
          tasks = this.getTasksFromStore()
        }

        this.storeGetItems().forEach((item) => {
            this.itemList.appendChild(this.renderTask(item))
        })
        addElementButton.addEventListener('click', this.addTaskItem.bind(this), false);
      }

      get title() {
        return this.getAttribute('title') || '';
      }

      storeGetItems() {
        const storedItems = this.storage
          .getItem('todo_list');
        return storedItems || [];
      }

      storeRemoveItem (item) {
        const itemList = this.storage.getItem('todo_list');
        let newList = [];
        const foundItemIdx = itemList.findIndex((_item) => item.id  == _item.id);
        if (foundItemIdx >= 0) {
          newList = [...itemList.slice(0, foundItemIdx), ...itemList.slice(foundItemIdx + 1)]
        } else {
          newList = itemList
        }
        this.storage.setItem('todo_list', newList);
      }

      get addItemText() {
        return this.getAttribute('add-item-text') || '';
      }

      notifyChange (type, subtype, item) {
        console.log('notification')
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
    }

    customElements.define(COMPONENT_NAME, TodoList);
  }
}

export {
  defineTodoList 
}
