import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import * as ejs from "ejs";

import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*-----------------------------------------------------------------*/
class OAuthModel {
  constructor() {
    this.access_token;
    this.expires_in;
    this.user_id;
    this.model;
  }
  static fromJson(json) {
    this.model = Object.assign(new OAuthModel(), json);
    return this.model;
  }
  static getOAuthModel() {
    return this.model;
  }
}
class UserModel {
  constructor() {
    this.id;
    this.first_name;
    this.last_name;
    this.bdate;
    this.sex;
    this.online;
    this.photo_max_orig;
    this.counters = 0;
  }
  static fromJson(json) {
    return Object.assign(new UserModel(), json);
  }
  getData() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      bdate: this.bdate,
      sex: this.sex,
      online: this.online,
      photo: this.photo_max_orig,
      counters: this.counters,
    };
  }
}

let PORT = process.env.PORT;
let HOST = process.env.HOST;
const client_id = process.env.APPID;
const redirect_uri = process.env.REDIRECT;
const secret = process.env.SECRET;

let friends = undefined;
let progressLoadFriends = false;
let oauth_model = OAuthModel.getOAuthModel(); // объект хранящий данные авторизации
let user_model = undefined; // модель авторизованного пользователя
let req_data_field = "bdate, online, photo_max_orig, sex, counters"; // запрашиваемые у VK API поля
let code = null;
let token = null;

function authPath(client_id, redirect_uri, scope) {
  return `https://oauth.vk.com/authorize?client_id=${client_id}&display=page&redirect_uri=${redirect_uri}&scope=${scope}&response_type=code&v=5.131`;
}

function getAccessToken(client_id, redirect_uri, secret, code) {
  return `https://oauth.vk.com/access_token?client_id=${client_id}&client_secret=${secret}&redirect_uri=${redirect_uri}&code=${code}`;
}

function user_get(user_id, token, fields) {
  return `https://api.vk.com/method/users.get?user_ids=${user_id}&fields=${fields}&access_token=${token}&v=5.131`;
}

function friends_get(oauth_model, count, offset, fields) {
  //&count=${count}&offset=${offset}
  return `https://api.vk.com/method/friends.get?user_id=${oauth_model.user_id}&fields=${fields}&access_token=${oauth_model.access_token}&v=5.131`;
}
/*-----------------------------------------------------------------*/

const fastify = Fastify({
  logger: false,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public/"),
  prefix: "/public/",
});

fastify.register(fastifyView, {
  engine: {
    ejs: ejs,
  },
});

// fastify.register(cors, {
//   origin: "*",
//   allowedHeaders: [
//     "Origin",
//     "X-Requested-With",
//     "Access-Control-Allow-Origin",
//     "Accept",
//     "Content-Type",
//     "Authorization",
//   ],
//   methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "UPDATE"],
// });

/* маршрут перенаправляет на авторизацию пользователя */
fastify.get("/", (request, reply) => {
  return reply
    .code(303)
    .redirect(authPath(client_id, redirect_uri, "friends, photos"));
});

/* маршрут API друзей */
fastify.get("/api/friends/get", (request, reply) => {
  fetch(friends_get(oauth_model, 35, 0, req_data_field))
    .then((res) => res.json())
    .then((json) => {
      reply.send(JSON.stringify(json));
    })
    .catch((err) => console.log("ERROR GET FRIENDS"));
});

/* маршрут основная страница */
fastify.get("/app", (request, reply) => {
  reply.view("/public/app.ejs", {
    user: user_model.getData(),
    friends: friends,
  });
});

/* маршрут авторизация */
fastify.get("/auth", async (request, reply) => {
  /* маршрут редиректа авторизации - получение кода */
  code = request.query.code;
  if (code) {
    await fetch(getAccessToken(client_id, redirect_uri, secret, code))
      .then((res) => res.json())
      .then((json) => (oauth_model = OAuthModel.fromJson(json)))
      .catch((err) => console.log("Err: " + err));
    if (oauth_model !== undefined) {
      await fetch(
        user_get(oauth_model.user_id, oauth_model.access_token, req_data_field)
      )
        .then((res) => res.json())
        .then((data) => (user_model = UserModel.fromJson(data.response[0])))
        .catch((err) => console.log("Error: " + err));
      if (user_model !== undefined) {
        console.log("USER_MODEL", user_model.first_name);
        return reply.code(303).redirect("/app");
      }
    }
  }
  return reply.sendFile("404.html");
});

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});
