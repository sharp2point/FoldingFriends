import Template from "./template.js";

export class User extends HTMLElement {
  constructor(){
    super();
  }
  connectedCallback() {
    this.innerHTML = Template.render();
    this.dom = Template.map(this);
    this.id = this.getAttribute("user-id");
    this.name = this.getAttribute("user-name")
    this.dom.photo.src = this.getAttribute("user-photo");
    this.dom.name.innerHTML = this.name;
  }
  getId = ()=> this.id;
  getName = ()=> this.name;
}

if (!customElements.get("vk-user")) {
  customElements.define("vk-user", User);
}
