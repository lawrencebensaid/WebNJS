import fs from "fs"
import Template from "../Template"

var force = false;
var namespace = null;

/**
 * @description Makes template.
 */
async function routeAdd(method, path, handler) {
  if (!path.startsWith("/")) {
    error(`A route path should start with a '/'. For example: "/posts".`);
    return;
  }
  if (!handler.includes(".")) {
    error(`A route handler should look like this: 'PostController.index'.`);
    return;
  }
  const dir = `${process.cwd()}/app/routes`;
  const file = `${namespace || "default"}.json`;
  if (!fs.existsSync(`${process.cwd()}/app`)) {
    fs.mkdirSync(`${process.cwd()}/app`);
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const endpoint = `${method.toUpperCase()} ${path}`;
  if (fs.existsSync(`${dir}/${file}`)) {
    const content = JSON.parse(fs.readFileSync(`${dir}/${file}`));
    if (!Array.isArray(content.endpoints) && typeof content.endpoints === "object") {
      if (content.endpoints.hasOwnProperty(endpoint)) {
        error(`route ${endpoint} already exists!`);
        return;
      }
      content.endpoints[endpoint] = [handler];
    }
    fs.writeFileSync(`${dir}/${file}`, JSON.stringify(content, null, 2));
    return;
  }
  const context = {
    endpoint: endpoint,
    handler: handler
  };
  const template = new Template("routes-config");
  try {
    await template.render(context, `app/routes/${file}`, force);
    console.log(`\x1b[32mDone.\x1b[0m`);
  } catch (error) {
    error(`(error) ${error}`);
  }
}


module.exports.execute = routeAdd;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "PROJECT";
module.exports.command = "route-add <method> <path> <handler>";
module.exports.options = {
  "-f, --force": {
    description: "forcefully perform action",
    execute: () => {
      force = true;
    }
  },
  "-n, --namespace": {
    description: "routing file name. (namespace)",
    execute: (n) => {
      namespace = n;
    }
  }
};
module.exports.description = "Creates a new route.";
module.exports.parameters = {
  method: "http method. For example: 'GET' or 'POST'",
  path: "endpoint path starting with a slash. For example: '/posts'",
  handler: "Controller handler. For example: 'PostController.index'"
};