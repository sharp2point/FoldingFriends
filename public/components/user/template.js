export default {
  map(scope) {
    return {
      photo: scope.querySelector(".user-photo"),
      name: scope.querySelector(".user-name"),
    };
  },
  render(props) {
    return `${this.html(props)}${this.css(props)}`;
  },
  html(props) {
    return `
    <div class="user">
    <img class="user-photo" src="#" alt="user photo"/>
    <h2 class="user-name">user name</h2>
    </div>
    `;
  },
  css(props) {
    return `<style>
    .user{
        width: 200px;
        min-height: 50px;
        display:flex;
        flex-direction:row;
        justify-content:flex-start;
        align-items:center;
        gap:0.5rem;
        padding:1rem;
        margin:0.5rem;
        background:rgb(120,13,107);
        border: none;
        border-radius:0.5rem;
    }
    .user-photo{
        border:none;
        border-radius: 50%;
        width:35px;
        height:35px;
        object-fit: cover;
    }
    .user-name{
        font-size: 1rem;
        color: white;
        line-height:1.5rem;
        font-weight:300;
    }

    </style>`;
  },
};
