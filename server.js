import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import RoutingEndpoint from "./core/RoutingEndpoint";
import Validator from "./core/Validator";
import { config } from "dotenv";
config();

const {
  HOST,
  PORT,
  APP_PATH,
  HTTP_MAX_BODY_SIZE
} = process.env;

const appPath = APP_PATH || "./app";
const routesPath = `${appPath}/routes`;

const app = express();
const limit = HTTP_MAX_BODY_SIZE || "50mb"

app.use(bodyParser.urlencoded({ limit, extended: false }));
app.use(bodyParser.json({ limit }));

const definitions = fs.readdirSync(routesPath);
var endpoints = [];

for (let i = 0; i < definitions.length; i++) {
  if (typeof definitions[i] === "string") {
    const components = definitions[i].split(".");
    if (components.length > 1 && typeof components[components.length - 1] === "string") {
      if (components[components.length - 1].toUpperCase() === "JSON") {
        const json = JSON.parse(fs.readFileSync(`${routesPath}/${definitions[i]}`));
        endpoints = RoutingEndpoint.fromJSON(json);
      }
    }
  }
}

for (let i = 0; i < endpoints.length; i++) {
  const method = endpoints[i].getMethod().toLowerCase();
  const controllers = endpoints[i].getControllers();
  if (!Array.isArray(controllers) && controllers.length > 0) continue;
  const handlers = [];
  for (let i = 0; i < controllers.length; i++) {
    const { 0: controllerName, 1: handlerName } = controllers[i].split(".");
    const location = `${process.cwd()}/${appPath}/controllers/${controllerName}.js`;
    const controllerClass = require(location);
    var controller;
    if (controllerClass.hasOwnProperty("default") && typeof controllerClass.default === "function") {
      controller = controllerClass.default;
    } else {
      console.error("INVALID CONTROLLER");
      continue;
    }
    const handler = new controller()[handlerName];
    handlers.push(handler);
  }
  for (let i = 0; i < handlers.length; i++) {
    const isLast = i === handlers.length - 1;
    handlers[i] = proxy(handlers[i], isLast)
  }
  const endHandler = handlers.pop();
  const path = endpoints[i].getPath();
  app[method](path, handlers, endHandler);
}

function proxy(handler, isLast) {
  return (request, response, next) => {
    const reject = (data) => {
      response.status(status || 400)
      response.send(data);
    };
    const resolve = (data) => {
      if (!isLast) return next();
      response.send(data);
    };
    new Validator(request);
    handler({
      session: request.session,
      params: request.params,
      query: request.query,
      body: request.body,
      request, response
    }, resolve, reject);
  }
}

const port = PORT || 80;
const host = HOST || "0.0.0.0";
app.listen(port, host, () => {
  console.log(`\x1b[34mWebserver served on ${port === 443 ? "https://" : "http://"}${host}:${port}\x1b[0m`);
});