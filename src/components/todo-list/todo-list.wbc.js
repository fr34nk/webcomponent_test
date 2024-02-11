const RESET_LIST_ITEMS=false;

fetch("./components/todo-list/todo-list.tpl.html")
    .then(stream => stream.text())
    .then(text => defineEditableList(text));

function defineEditableList (template) {
  class EditableList extends HTMLElement {

    constructor() {
      // establish prototype chain
      super();
      self = this;
      self.eventBus = getEventBus();
      self.storage = getStorage();

      if (RESET_LIST_ITEMS) {
        this.storeInitializeItems();
      }

      // attaches shadow tree and returns shadow root reference
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
      const shadow = this.attachShadow({ mode: 'open' });

      const editableListContainer = document.createElement('div');

      // get attribute values from getters from component attributes
      const title = this.title;
      const addItemText = this.addItemText;
      const listItems = [];

      // adding a class to our container for the sake of clarity
      editableListContainer.classList.add('editable-list');
      editableListContainer.innerHTML = this.htmlBuildContainer(listItems)

      this.addListItem = this.addListItem.bind(this);

      // appending the container to the shadow DOM
      // get list container in shadow
      shadow.appendChild(editableListContainer);
    }

    storeInitializeItems () {
      self.storage.removeItem('todo_list');
      self.storage.addItem('todo_list', [{
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
      self.storage.addItem('todo_list', {
        id: 2,
        header: 'I used to know',
        description: 'No descrption yet',
        checked: true,
        insertDate: getDateFormat(new Date()).Date_Time_Period
      })

    }

    htmlBuildContainer (listItems) {
      return `
        <link href="../../vendors/bootstrap/dist/css/bootstrap.css" rel="stylesheet">
        <style>
          :root {
            --bs-primary: #ff0000;
            --bs-primary-rgb: 250, 110, 253;
          }
          li, div > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .icon {
            background-color: #fff;
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

                <div class="btn w-100 px-4">
                  <button class="w-100 flex-fill editable-list-add-item btn icon btn-primary btn-md px-4 gap-3">+</button>
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

    htmlBuildRemoveButton (item, { onClick }) {
      const buttonContainer = document.createElement('div')
      buttonContainer.classList.add('button-container')
      const button = document.createElement('button');
      buttonContainer.appendChild(button)

      button.classList.add('editable-list-remove-item', 'btn', 'btn-primary', 'btn-md',  'gap-3', 'py-0', 'icon');
      button.style = 'background-color: var(--bs-gray-200); transition: background 0s ease 0s !important; onblur { background-color: var(--bs-primary); }'
      button.innerHTML = '-';

      const classSelf = this; 
      button.addEventListener('click', function (e) {
        onClick.bind(this)('item_root')
      });
      return buttonContainer;
    }

    htmlBuildCheckBox (itemState, { onClick }) {
      const { checked } = itemState;

      const checkboxContainer = document.createElement('div');
      checkboxContainer.classList.add('checkbox-container')

      const checkbox = document.createElement('input')
      checkbox.classList.add('form-check-input', 'flex-shrink-0')
      checkbox.setAttribute('type', 'checkbox')
      if (checked) {
        checkbox.setAttribute('checked',  checked);
      } else {
        checkbox.removeAttribute('checked');
      }

      checkbox.style = `font-size: 1.375em`;

      checkbox.addEventListener('click', function (e) {
        onClick.bind(this)(itemState)
      })

      checkboxContainer.appendChild(checkbox);
      return checkboxContainer;
    }

    htmlBuildInfoSection ({ id, header, description, checked, insertDate }, { style }) {
      const infoContainer = document.createElement('div');
      infoContainer.classList.add('px-4');

      const itemHtmlContent = `
            <span class="pt-1 form-checked-content ${checked == true ? 'text-decoration-line-through' : ''}" 
              style="opacity: ${ checked ? '70%' : '100%' };"
            >
              <strong>${header}</strong>
              <small class="d-block text-body-secondary">
                <p>${description}</p>
              </small>
              <small class="d-block text-body-secondary">
                <svg class="bi me-1" width="1em" height="1em"><use xlink:href="#calendar-event"></use></svg>
                ${insertDate}
              </small>
            </span>
      `

      infoContainer.innerHTML = itemHtmlContent;
      return infoContainer;
    }

    renderItem (item) {
      const label = document.createElement('label');
      label.classList.add('list-group-item', 'list-group', 'hstack')
      label.style = 'border-top-width: 1px;'

      const checkbox = this.htmlBuildCheckBox(item, {
        onClick: this.onItemCheck
      })
      label.appendChild(checkbox)

      const infoSection = this.htmlBuildInfoSection(item, { });
      label.appendChild(infoSection);

      const button = this.htmlBuildRemoveButton(item, {
        onClick: this.onItemRemove
      });
      label.appendChild(button);
      return label;
    }

    // == Item List Events ==
    onItemCheck (itemState) {
      this.dispatchEvent(new CustomEvent(EnumItemEvent.ITEM_UPDATE, {
        detail: {
          type: EnumItemEventUpdate.NODE_UPDATE,
          subtype: EnumNodeUpdateType.TOGGLE_FINISH,
          item: itemState
        },
        bubbles: true
      }), )
    }

    onItemRemove (node_to_remove) {
      this.dispatchEvent(new CustomEvent(EnumItemEvent.ITEM_UPDATE, {
        detail: {
          type: EnumItemEventUpdate.NODE_REMOVAL,
          node: node_to_remove,
        },
        bubbles: true
      })) 
    }

    buildItem (itemState) {
      let renderedItem = this.renderItem(itemState, {})
      renderedItem.addEventListener(EnumItemEvent.ITEM_UPDATE, (e) => {
        switch (e.detail.type) {
          case EnumItemEventUpdate.NODE_REMOVAL: {
            renderedItem.remove()
            this.notifyChange(EnumItemEventUpdate.NODE_REMOVAL, undefined, itemState);
            this.storeRemoveItem(itemState)
          } break;
          case EnumItemEventUpdate.NODE_UPDATE: {
            const { type, subtype, item } = e.detail;
            if (subtype == EnumNodeUpdateType.TOGGLE_FINISH) {
              const updatedItem = { ...itemState, checked: !item.checked };
              renderedItem.replaceWith(this.buildItem(updatedItem))
              this.notifyChange(type, subtype, itemState);
              this.storeUpdateItem(itemState.id, updatedItem)
            }
          } break;
          default: {
          }
        }
      })
      return renderedItem;
    }

    onHeaderInputChange (callback) {
      // TODO: autofilter
      // const headerInput = document.querySelector('.header-input');
      // headerInput.addEventListener('change', (e) => {
      //   console.log(e)
      // })
    }

    storeGetItemIds () {
      const items = self.storage.getItem('todo_list');
      return items.map(item => item.id);
    }

    storeGetNewId () {
      return this.storeGetItemIds().sort().pop() + 1
    }

    storeAddItem (item) {
      const items = self.storage.getItem('todo_list');
      items.push(item);
      self.storage.setItem('todo_list', items);
    }

    storeUpdateItem (itemId, updateItemPayload) {
      const items = self.storage.getItem('todo_list');
      const foundItemIdx = items.findIndex((item) => item.id == itemId);
      const foundItem = items[foundItemIdx];
      const updatedItem = {
        ...foundItem,
        ...updateItemPayload
      }
      const newItems = [...items.slice(0, foundItemIdx), updatedItem, ...items.slice(foundItemIdx+1)];
      self.storage.setItem('todo_list', newItems);
    }

    addListItem(e) {
      const headerInput = this.shadowRoot.querySelector('.header-input');
      const descriptionInput = this.shadowRoot.querySelector('.description-input');
      if (headerInput.value) {

        // todo new Item
        const item = {
          id: this.storeGetNewId(),
          header: headerInput.value,
          description: descriptionInput?.value || 'No description yet',
          checked: false,
          insertDate: getDateFormat(new Date()).Date_Time_Period
        }

        this.itemList.appendChild(this.buildItem(item, {}));
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

    // fires after the element has been attached to the DOM
    connectedCallback() {
      this.onHeaderInputChange({})

      // const removeElementButtons = [...this.shadowRoot.querySelectorAll('.editable-list-remove-item')];
      const addElementButton = this.shadowRoot.querySelector('.editable-list-add-item');

      // get items declared in the html
      this.itemList = this.shadowRoot.querySelector('.item-list');
      // this.addRemoveActionToItems(removeElementButtons);

      this.storeGetItems().forEach((item) => {
          this.itemList.appendChild(this.buildItem(item))
      })
      addElementButton.addEventListener('click', this.addListItem, false);
    }

    // gathering data from element attributes
    get title() {
      return this.getAttribute('title') || '';
    }

    storeGetItems() {
      const storedItems = self.storage
        .getItem('todo_list');
      return storedItems || [];
    }

    storeRemoveItem (item) {
      console.log('item');
      console.log(item);
      const itemList = self.storage.getItem('todo_list');
      let newList = [];
      const foundItemIdx = itemList.findIndex((_item) => item.id  == _item.id);
      if (foundItemIdx >= 0) {
        newList = [...itemList.slice(0, foundItemIdx), ...itemList.slice(foundItemIdx + 1)]
      } else {
        newList = itemList
      }
      self.storage.setItem('todo_list', newList);
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

  // let the browser know about the custom element
  customElements.define('todo-list', EditableList);
}
