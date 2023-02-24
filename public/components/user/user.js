import Template from "./template.js";

export class User extends HTMLElement {
  constructor(id,name,photo){
    super();
    this.attachShadow({mode: 'open'});
    this.id = id;
    this.name = name;
    this.photo = photo;
    this.shadowRoot.innerHTML = Template.render({name:this.name,photo:this.photo});
  }
  getId = ()=> this.id;
  getName = ()=> this.name;
}

if (!customElements.get("vk-user")) {
  customElements.define("vk-user", User);
}
