export default {
  map(scope) {
    return {
      photo: scope.shadowRoot.querySelector(".user-photo"),
      name: scope.shadowRoot.querySelector(".user-name"),
      button: scope.shadowRoot.querySelector(".move-button")
    };
  },
  render(props) {
    return `${this.html(props)}${this.css(props)}`;
  },
  html(props) {
    return `
    <div class="user">
      <img class="user-photo" src="${props.photo}" alt="user photo"/>
      <h1 class="user-name">${props.name}</h1>
      <button class="move-button" />
    </div>
    `;
  },
  css(props) {
    return `<style>
    .user{
        width: 250px;
        padding:0.25rem;
        display:flex;
        flex-direction:row;
        justify-content:space-between;
        align-items:center;
        padding:1rem;
        background:white;
        
    }
    .user:hover{
      background: #F0F0F0;
    }
    .move-button{
      width:16px;
      height:16px;
      border:none;
      background: transparent url("./public/img/move.png") no-repeat;      
    }
    .user-photo{
        border:none;
        border-radius: 50%;
        width:45px;
        height:45px;
        object-fit: cover;
    }
    .user-name{
        font-size: 1rem;
        color: black;
        line-height:1.5rem;
        font-weight:300;
        max-width:150px;
        overflow: hidden;
        word-break: keep-all;
        text-align:start;
    }

    </style>`;
  },
};
