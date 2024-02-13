import template from "./task.tpl.html";

import { getEventBus } from '../../services/eventBus'
import { getStorage } from '../../services/storageService'

const COMPONENT_NAME = 'task-item'

function defineTask (_template) {
  if (!customElements.get(COMPONENT_NAME)) {

    class Task extends HTMLElement {
      constructor() {
        super();
        this.eventBus = getEventBus();
        this.storage = getStorage();
        
        this.shadow = this.attachShadow({ mode: 'open' });
        const parser = new DOMParser();
        const tpl = parser.parseFromString(template, 'text/html')
        const taskTemplate = tpl.querySelector('#task-template')
        this.shadow.appendChild(taskTemplate.content.cloneNode(true))

        this.selelectors = {
          'container': '.task-container',
          'header': '.task-item-header',
          'description': '.task-item-description',
          'insertDate': '.task-item-insert-date',
          'button': '.button-container',
          'checkbox': '.checkbox-container',
          'infoSection': '.form-check-content',
        }
      }

      getEl (elSel) {
        return this.querySelector(this.selelectors[elSel]);
      }

      getSEl (elSel) {
        return this.shadowRoot.querySelector(this.selelectors[elSel]);
      }

      render () {
        const taskTpl = this.shadowRoot.querySelector('#task-tempalte');
      }

      connectedCallback() {
        const header = this.getSEl('header')
        header.textContent = this._header;

        const description = this.getSEl('description')
        description.textContent = this._description;

        const insertDate = this.getSEl('insertDate')
        insertDate.textContent = this._insertDate;

        if (this.isChecked) {
          const infoSection = this.getSEl('infoSection')
          infoSection.classList.add('is-checked')

          const checkbox = this.shadowRoot.querySelector('.checkbox-container input');
          checkbox.setAttribute('checked',  true);
        } else {

        }

        if (this.onTaskRemove) {
          const button = this.getSEl('button') ;
          button.addEventListener('click', this.onTaskRemove);
        }

        if (this.onTaskFinish) {
          const button = this.getSEl('checkbox') ;
          button.addEventListener('click', this.onTaskFinish);
        }
      }

      get header() {
        return this.getAttribute('header') || '';
      }
      set header(header) {
        this._header = header;
      }

      get description () {
        return this.getAttribute('description') || '';
      }
      set description (description) {
        this._description = description;
      }

      get insertDate () {
        return this.getAttribute('insertDate') || '';
      }
      set insertDate(insertDate) {
        this._insertDate = insertDate;
      }
    }
    customElements.define(COMPONENT_NAME, Task);
  }
}

export {
  defineTask  
}
