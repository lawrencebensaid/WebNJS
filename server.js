import fs from "fs"
import orm from "orm"
import express from "express"
import session from "express-session"
import bodyParser from "body-parser"
import RoutingEndpoint from "./core/RoutingEndpoint"
import Validator from "./core/Validator"
import { config } from "dotenv"
config();

const {
  HOST,
  PORT,
  SECRET,
  DB_TYPE,
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  APP_PATH,
  HTTP_MAX_BODY_SIZE,
  DB_WEB_SESSION_TABLE
} = process.env;

const appPath = `${process.cwd()}/${APP_PATH || "app"}`;
const routesPath = `${appPath}/routes`;
const modelsPath = `${appPath}/models`;
const controllersPath = `${appPath}/controllers`;

const app = express();
const limit = HTTP_MAX_BODY_SIZE || "50mb"

const sessionConfiguration = {
  name: "Auth",
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    expires: 1000 * 60 * 60 * 24 * 3
  }
};

if (DB_TYPE) {
  switch (DB_TYPE) {
    case "mysql":
      const connectMySQL = require("connect-mysql");
      const MySQLStore = connectMySQL(session);
      sessionConfiguration.store = new MySQLStore({ config: getConnectionURI(), table: DB_WEB_SESSION_TABLE || "_WebNJS_Sessions" });
      break;
  }
}

app.use(session(sessionConfiguration));
app.use(bodyParser.urlencoded({ limit, extended: false }));
app.use(bodyParser.json({ limit }));
app.disable("x-powered-by");

var endpoints = [];


(async () => {

  await configureDatabase();

  if (db) {
    await loadModels();
  }

  indexRoutes();

  configureRoutes();

  configureWebServer();

})();


async function loadModels() {
  const definitions = fs.readdirSync(modelsPath);
  for (let i = 0; i < definitions.length; i++) {
    if (typeof definitions[i] === "string") {
      const components = definitions[i].split(".");
      if (components.length > 1 && typeof components[components.length - 1] === "string") {
        if (components[components.length - 1].toUpperCase() === "JS") {
          require(`${modelsPath}/${definitions[i]}`);
        }
      }
    }
  }
  await db.syncPromise();
}


function indexRoutes() {
  const definitions = fs.readdirSync(routesPath);
  for (let i = 0; i < definitions.length; i++) {
    if (typeof definitions[i] === "string") {
      const components = definitions[i].split(".");
      if (components.length > 1 && typeof components[components.length - 1] === "string") {
        if (components[components.length - 1].toUpperCase() === "JSON") {
          const json = JSON.parse(fs.readFileSync(`${routesPath}/${definitions[i]}`));
          endpoints = endpoints.concat(RoutingEndpoint.fromJSON(json));
        }
      }
    }
  }
}


function configureRoutes() {
  for (let i = 0; i < endpoints.length; i++) {
    const method = endpoints[i].getMethod().toLowerCase();
    const controllers = endpoints[i].getControllers();
    if (!Array.isArray(controllers) && controllers.length > 0) continue;
    const handlers = [];
    for (let i = 0; i < controllers.length; i++) {
      const { 0: controllerName, 1: handlerName } = controllers[i].split(".");
      const location = `${controllersPath}/${controllerName}.js`;
      if (!fs.existsSync(`${controllersPath}/${controllerName}.js`)) {
        error(`Skipping: controller '${controllerName}' does not exist!`);
        continue;
      }
      const controllerClass = require(location);
      var controller;
      if (controllerClass.hasOwnProperty("default") && typeof controllerClass.default === "function") {
        controller = controllerClass.default;
      } else {
        error(`Skipping: controller '${controllerName}' exists but is invalid!`);
        continue;
      }
      const handler = new controller()[handlerName];
      handlers.push(handler);
    }
    if (handlers.length > 0) {
      for (let i = 0; i < handlers.length; i++) {
        const isLast = i === handlers.length - 1;
        handlers[i] = proxy(handlers[i], isLast)
      }
      const endHandler = handlers.pop();
      const path = endpoints[i].getPath();
      app[method](path, handlers, endHandler);
    } else {
      error(`Skipping: route '${endpoints[i]}' because it has no handlers!`);
    }
  }
}


function configureWebServer() {

  const port = PORT || 80;
  const host = HOST || "0.0.0.0";

  app.listen(port, host, () => {
    print(`\x1b[34mWebserver served on http://${host}:${port}\x1b[0m`);
  });

}


function getConnectionURI() {
  const dbType = DB_TYPE;
  const dbHost = DB_HOST;
  const dbName = DB_NAME;
  const dbUser = DB_USER;
  const dbPassword = DB_PASSWORD;
  if (!dbType || !dbHost || !dbName) return null;
  switch (dbType) {
    case "mysql": return `mysql://${dbUser}:${dbPassword}@${dbHost}/${dbName}`;
    default: return null;
  }
}


async function configureDatabase() {
  global.db = null;
  const uri = getConnectionURI();
  if (uri) {
    global.db = await orm.connectAsync(uri);
  }
}


function proxy(handler, isLast) {
  return (request, response, next) => {
    const reject = (data, status = 400) => {
      response.status(status)
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
      paramsField: request.paramsField,
      queryField: request.queryField,
      bodyField: request.bodyField,
      invalid: request.invalid,
      request, response
    }, resolve, reject);
  }
}