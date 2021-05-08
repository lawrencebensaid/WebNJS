import Template from "../Template"
import { execSync } from "child_process";
import fs from "fs"

var force = false;
var namespace = "default";

export const enabled = true;
export const scope = "PROJECT";
export const description = "adds a route configuration to the default namespace";
export const parameters = {
  method: "http method. For example: 'GET' or 'POST'",
  path: "endpoint path starting with a slash. For example: '/posts'",
  handler: "Controller handler. For example: 'PostController.index'"
};
export const options = {
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
export default async (method, path, handler) => {
  if (!NOTATIONS.endpointPath.test(path)) {
    error(`Invalid path: '${path}'. A route path should look like this: "/posts/update".`);
    return;
  }
  if (!NOTATIONS.controllerHandler.test(handler)) {
    error(`A route handler should look like this: 'PostController.index'.`);
    return;
  }
  const dir = project.getRoutesDir(true);
  const file = `${namespace}.json`;
  if (!fs.existsSync(project.getAppDir(true))) {
    fs.mkdirSync(project.getAppDir(true));
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const endpoint = `${method.toUpperCase()} ${path}`;
  const filepath = `${dir}/${file}`;
  if (fs.existsSync(filepath)) {
    const content = JSON.parse(fs.readFileSync(filepath));
    if (!Array.isArray(content.endpoints) && typeof content.endpoints === "object") {
      if (content.endpoints.hasOwnProperty(endpoint)) {
        error(`route ${endpoint} already exists!`);
        return;
      }
      content.endpoints[endpoint] = [handler];
    }
    fs.writeFile(filepath, JSON.stringify(content, null, 2), (err) => {
      if (err !== null) return error(err);
      print(`\x1b[32mSaved new route to '${namespace}' namespace: '${filepath}'.\x1b[0m`);
      execSync(`code -r ${filepath}`);
    });
    return;
  }
  const context = {
    endpoint: endpoint,
    handler: handler
  };
  const template = new Template("routes-config");
  try {
    await template.render(context, `app/routes/${file}`, force);
    print(`\x1b[32mSaved new route to '${namespace}' namespace: '${filepath}'.\x1b[0m`);
    execSync(`code -r ${filepath}`);
  } catch (error) {
    error(`(error) ${error}`);
  }
}
