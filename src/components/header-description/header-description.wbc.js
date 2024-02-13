import template from "./header-description.tpl.html";

import { getEventBus } from '../../services/eventBus'
import { getStorage } from '../../services/storageService'

const COMPONENT_NAME="header-description"

function defineHeaderDescription (tpl=template) {
  if (!customElements.get(COMPONENT_NAME)) {
    customElements.define(COMPONENT_NAME,
      class extends HTMLElement {
        constructor() {
          const parser = new DOMParser()
          const template = parser.parseFromString(tpl, 'text/html')

          super();
          const el = template.querySelector('#list-item-template')
          this.shadow = this.attachShadow({ mode: 'open' });
          this.shadow.appendChild(el.content.cloneNode(true))

          const name = this.shadow.querySelectorAll('.list-item-name');

          this.eventBus = getEventBus()
          this.storage = getStorage()

          this._header = '';

        const h = this.getAttribute('header');
        this.eventBus.propObserve('todo_list', (e) => {
          this.onTodoListUpdate(e.detail)
        });
      }

      onTodoListUpdate ({ oldValue, newValue }) {
        const todoList = newValue;
        if (Array.isArray(todoList)) {
          const lastItem = todoList.pop()

          this.header = `Last item added: ${lastItem.header}`
          this.description = `Added at: ${lastItem.insertDate}`
        }
      }

      get header() {
        return this.getAttribute('header') || '';
      }
      set header (v) {
        const htmlHeader = this.shadowRoot.querySelector('.header');
        htmlHeader.textContent = v;
      }

      get description() {
        return this.getAttribute('description') || '';
      }

      set description (value) {
        const htmlDesc = this.shadowRoot.querySelector('.description');
        htmlDesc .textContent = value;
      }

      connectedCallback () {
        const htmlHeader = this.shadowRoot.querySelector('.header');
        htmlHeader.textContent = this.header;
        
        const description = this.shadowRoot.querySelector('.description');
        description .textContent = this.description + ' ' + (this.todoLength || 0) + ' todos';

        document.addEventListener('todo_list', (e) => {
          const { detail: { type, subtype } } = e;

          if (type == EnumItemEvent.ITEM_UPDATE) {
            if (subtype == EnumItemEventUpdate.NODE_UPDATE) {
              const { item } = detail?.payload;

              this.header = `Item ${item.id} was updated:`
              this.description = `Item (${item.header}) was changed`
            }
          }
          this.description = e.detail.description;
        })
      }
    });
  }
}

export {
  defineHeaderDescription 
}


