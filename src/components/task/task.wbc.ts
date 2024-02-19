import template from "./task.tpl.html";

import { getEventBus } from '../../services/eventBus'

export interface TaskElementInterface { 
   props: {
      title: string,
      description: string,
      insertDate: string,
      checked: boolean,
      onToggleFinish?: (task: any) => void;
      onTaskRemove?: () => void;
   }
} 

class TaskElement extends HTMLElement implements TaskElementInterface {
   public titla: string;
   public _title: string;
   public title: string;
   public _description: string;
   public description: string;
   public _insertDate: string;
   public insertDate: string;
   public _checked: boolean;
   public checked: boolean;

   public onTaskRemove: () => any;
   public onToggleFinish: () => any;

   static element_name: string;
   public eventBus: any;
   public storage: any;
   public shadow: any;
   public selectors: { [key: string]: string };

   public props: TaskElementInterface['props'];

   constructor() {
      super();
      this.eventBus = getEventBus();
      
      this.shadow = this.attachShadow({ mode: 'open' });
      const parser = new DOMParser();
      const tpl = parser.parseFromString(template, 'text/html')
      const taskTemplate: any = tpl.querySelector('#task-template')
      this.shadow.appendChild(taskTemplate.content.cloneNode(true))
      
      this.selectors = {
         'container': '.task-container',
         'title': '.task-item-header',
         'description': '.task-item-description',
         'insertDate': '.task-item-insert-date',
         'button': '.button-container',
         'checkbox': '.checkbox-container',
         'infoSection': '.form-check-content',
      }
   }
   
   public getEl (dom: HTMLElement, selector: keyof TaskElement['selectors']) {
      return dom.querySelector(this.selectors[selector]);
   }
   
   render () {
      const titleEl = this.getEl(this.shadow, 'title')
      titleEl.textContent = this.props.title;
      
      const description = this.getEl(this.shadow, 'description')
      description.textContent = this.props.description;
      
      const insertDate = this.getEl(this.shadow, 'insertDate')
      insertDate.textContent = this.props.insertDate;

      console.log('this.props.checked');
      console.log(this.props.checked);
     
      if (this.props.checked == true) {
         const infoSection = this.getEl(this.shadow, 'infoSection')
         infoSection.classList.add('is-checked')
         
         const checkbox = this.shadowRoot.querySelector('.checkbox-container input') as HTMLInputElement;
         checkbox.checked = true;
      } else {
         const checkbox = this.shadowRoot.querySelector('.checkbox-container input') as HTMLInputElement;
         checkbox.checked = false;
      }
   }
   
   connectedCallback() {
      this.render()
      if (this.props.onTaskRemove) {
         const button = this.getEl(this.shadow, 'button') ;
         button.addEventListener('click', this.props.onTaskRemove);
      }
      
      if (this.props.onToggleFinish) {
         const button: HTMLInputElement = this.getEl(this.shadow, 'checkbox') as HTMLInputElement;
         button.addEventListener('click', this.props.onToggleFinish);
      }
   }
}
TaskElement.element_name = 'task-el'


function defineTask (_template: string = '') {
   customElements.define(TaskElement.element_name, TaskElement)
}

export {
   defineTask,
   TaskElement
}

