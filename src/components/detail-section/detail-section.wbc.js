fetch("./components/list/detailed-list.tpl.html")
    .then(stream => stream.text())
    .then(text => define(text));

function define (templateHtmlText) {
  customElements.define('element-details',
    class extends HTMLElement {
      constructor() {
        const parser = new DOMParser()
        const template = parser.parseFromString(templateHtmlText, 'text/html')
        super();

        const el = template.querySelector('#element-details-template')
        this.attachShadow({ mode: 'open'}).appendChild(el.content.cloneNode(true))
    }
  });
}


