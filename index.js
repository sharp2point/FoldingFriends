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

let oauth_model = OAuthModel.getOAuthModel(); // объект хранящий данные авторизации
let user_model = undefined; // модель авторизованного пользователя
let req_data_field = "bdate, online, photo_max_orig, sex, counters"; // запрашиваемые у VK API поля
let code = null;
let token = null;

const client_id = 51559844;
const redirect_uri = "http://localhost:1234/auth";
const secret = "xqc7PeuY37EpQAAQ2uTP";

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
  return `https://api.vk.com/method/friends.get?user_ids=${oauth_model.user_id}&count=${count}&offset=${offset}&fields=${fields}&access_token=${oauth_model.access_token}&v=5.131`;
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

await fastify.register(cors, {});

fastify.get("/", (request, reply) => {
  /* маршрут перенаправляет на авторизацию пользователя */
  return reply
    .code(303)
    .redirect(authPath(client_id, redirect_uri, "friends, photos"));
});
fastify.get("/app", (request, reply) => {
  reply.view("/public/friend.ejs", { user: user_model.getData() });
});
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

const start = async () => {
  try {
    await fastify.listen({ port: 1234 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
