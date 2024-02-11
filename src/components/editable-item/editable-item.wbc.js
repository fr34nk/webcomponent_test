fetch("./components/editable-item/editable-item.tpl.html")
    .then(stream => stream.text())
    .then(text => define(text));

function define (templateHtmlText) {
  customElements.define('editable-item',
    class extends HTMLElement {
      constructor() {
        const parser = new DOMParser()
        const template = parser.parseFromString(templateHtmlText, 'text/html')

        self = super();
        const el = template.querySelector('#list-item-template')
        self.shadow = this.attachShadow({ mode: 'open' });
        self.shadow.appendChild(el.content.cloneNode(true))

        const name = self.shadow.querySelectorAll('.list-item-name');

        self.eventBus = getEventBus()
        self.storage = getStorage()

        this._header = '';

        const htmlHeader = this.shadowRoot.querySelector('.header');
        htmlHeader.textContent = this.header;
        
        const description = this.shadowRoot.querySelector('.description');
        description .textContent = this.description + ' ' + (this.todoLength || 0) + ' todos';

      self.eventBus.propObserve('todo_list', (e) => {
        this.update(e.detail)
      });
    }

    update ({ oldValue, newValue }) {
      const todoList = newValue;
      this.header = `Last item added: ${todoList.pop().header}`
      this.description = `Added at: ${todoList.pop().insertDate}`
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
      document.addEventListener('todo_list', (e) => {
        console.log('e');
        console.log(e);
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


