import Template from "./template.js";

export class User extends HTMLElement {
  connectedCallback() {
    this.innerHTML = Template.render();
    this.dom = Template.map(this);
    this.dom.photo.src = this.getAttribute("user-photo");
    this.dom.name.innerHTML = this.getAttribute("user-name");
  }
}

if (!customElements.get("vk-user")) {
  customElements.define("vk-user", User);
}
