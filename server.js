import fs from "fs"
import orm from "orm"
import cors from "cors"
import express from "express"
import session from "express-session"
import bodyParser from "body-parser"
import RoutingEndpoint from "./core/RoutingEndpoint"
import Validator from "./core/Validator"
import Model from "./core/Model"
import { config } from "dotenv"
import { ObjectID } from "webnjs"
config();

const {
  HOST,
  CORS,
  PORT,
  SECRET,
  DB_TYPE,
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  APP_PATH,
  HTTP_MAX_BODY_SIZE,
  DB_WEB_SESSION_TABLE,
  MIGRATE_ON_START
} = process.env;

const appPath = `${process.cwd()}/${APP_PATH || "app"}`;
const routesPath = `${appPath}/routes`;
const modelsPath = `${appPath}/models`;
const migrationsPath = `${appPath}/migrations`;
const controllersPath = `${appPath}/controllers`;

const app = express();
const limit = HTTP_MAX_BODY_SIZE || "50mb"

app.use(cors({
  origin: CORS || "*",
  optionsSuccessStatus: 200
}));

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

  // Call preloader
  const preloader = `${project.getDir(true)}/preloader.js`;
  if (fs.existsSync(preloader)) require(preloader);

  await configureDatabase();

  if (db) {
    await loadModels();
  }

  indexRoutes();

  configureRoutes();

  configureWebServer();

  // Call postloader
  const postloader = `${project.getDir(true)}/postloader.js`;
  if (fs.existsSync(postloader)) require(postloader);

})();


async function loadModels() {
  const definitions = fs.readdirSync(modelsPath);
  const callables = [];
  for (let i = 0; i < definitions.length; i++) {
    if (typeof definitions[i] === "string") {
      const components = definitions[i].split(".");
      if (components.length > 1 && typeof components[components.length - 1] === "string") {
        if (components[components.length - 1].toUpperCase() === "JS") {
          const { default: model } = require(`${modelsPath}/${definitions[i]}`);
          const instance = new model();
          if (instance instanceof Model) {
            if (typeof instance.relations === "function") {
              callables.push(instance.relations);
            }
          } else {
            const { relations } = model;
            if (typeof relations === "function") {
              callables.push(relations);
            }
          }
        }
      }
    }
  }
  callables.forEach(callable => { callable(db.models) });
  await db.syncPromise();
  notifier.emit("webnjs.models.loaded");
  notifier.emit("loaded_models"); //Deprecated
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
  const controllers = {};
  for (let i = 0; i < endpoints.length; i++) {
    const endpointControllers = endpoints[i].getControllers();
    if (!Array.isArray(endpointControllers) && endpointControllers.length > 0) continue;
    for (let i = 0; i < endpointControllers.length; i++) {
      const { 0: controllerName } = endpointControllers[i].split(".");
      const location = `${controllersPath}/${controllerName}.js`;
      if (!fs.existsSync(`${controllersPath}/${controllerName}.js`)) {
        error(`Skipping: controller '${controllerName}' does not exist!`);
        continue;
      }
      if (controllers.hasOwnProperty(controllerName)) continue; // Skip if controller has already been loaded.
      const controllerClass = require(location);
      if (
        !controllerClass.hasOwnProperty("default") || // Skip if module doesn't provide a default export.
        typeof controllerClass.default !== "function" // Skip if default export isn't a contructor (function/callable).
      ) {
        error(`Skipping: controller '${controllerName}' exists but is invalid!`);
        continue;
      }
      controllers[controllerName] = new controllerClass.default();
    }
  }
  for (let i = 0; i < endpoints.length; i++) {
    const method = endpoints[i].getMethod().toLowerCase();
    const endpointControllers = endpoints[i].getControllers();
    if (!Array.isArray(endpointControllers) && endpointControllers.length > 0) continue;
    const handlers = [];
    for (let i = 0; i < endpointControllers.length; i++) {
      const { 0: controllerName, 1: handlerName } = endpointControllers[i].split(".");
      if (!controllers.hasOwnProperty(controllerName)) {
        error(`Trying to call controller '${controllerName}' which hasn't been loaded!`);
        continue;
      }
      const handler = controllers[controllerName][handlerName];
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
  notifier.emit("webnjs.router.loaded");
}


function configureWebServer() {

  const port = PORT || 80;
  const host = HOST || "0.0.0.0";

  app.listen(port, host, () => {
    print(`\x1b[34mWebserver served on http://${host}:${port}\x1b[0m`);
    notifier.emit("webnjs.webserver.started");
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

const files = fs.readdirSync(migrationsPath);
const migrations = {};
for (const file of files) {
  if (!file.endsWith(".json")) continue;
  const content = fs.readFileSync(`${migrationsPath}/${file}`, "utf8");
  const json = JSON.parse(content);
  for (const table in json) {
    if (!migrations.hasOwnProperty(table)) { migrations[table] = [] }
    if (!Array.isArray(json[table])) {
      error(`Migration file contains errors:\n${migrationsPath}/${file}`);
      continue;
    }
    for (const population of json[table]) {
      migrations[table].push(population);
    }
  }
}

notifier.on("loaded_models", async () => {
  if (!MIGRATE_ON_START) return;
  const models = require("./models.js");
  for (const model in migrations) {
    const migration = migrations[model];
    for (const record of migration) {
      try {
        const modelClass = models[model];
        if (!modelClass) continue;
        await modelClass.createAsync(record);
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") continue;
        error(err);
      }
    }
  }
});