import fs from "fs";

var filename = "PostmanExport.json";

export const enabled = true;
export const scope = "PROJECT";
export const description = "generates a postman export with documentation";
export const parameters = {};
export const options = {
  "-n, --name <name>": {
    description: "provide name",
    execute: (name) => {
      filename = name
    }
  }
};
export default () => {
  const namespaces = fs.readdirSync(project.getRoutesDir(true));
  const controllers = fs.readdirSync(project.getControllersDir(true));
  var postman = {
    info: {
      name: project.getTitle(),
      description: project.getDescription(),
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [],
    variable: [{ key: "base", value: "http://localhost" }]
  };
  var descriptions = {};

  // index controllers
  for (const controller of controllers) {
    const controllerFile = fs.readFileSync(`${project.getControllersDir(true)}/${controller}`, { encoding: "utf8" });
    const rex = /(\/\*\*[\w\s*@.<>{}()]*\*\/)[\w\s]*\b(?!\bcatch\b)(\w{1,})\b\s*\(.*\)\s*\{/gm;
    const matches = controllerFile.matchAll(rex);
    for (const { 1: description, 2: handler } of matches) {
      const rex2 = /@description ([\w *<>{}()]*)/m;
      const { 0: controllerName } = controller.split(".");
      if (typeof descriptions[controllerName] !== "object") {
        descriptions[controllerName] = { handlers: {} };
      }
      descriptions[controllerName].handlers[handler] = {
        description: description.match(rex2)[1]
      };
    }
  }


  // index endpoints
  for (const namespace of namespaces) {
    if (!NOTATIONS.namespaceFile.test(namespace)) continue;
    const config = JSON.parse(fs.readFileSync(`${project.getRoutesDir(true)}/${namespace}`));
    for (const endpoint in config.endpoints) {
      if (!NOTATIONS.endpoint.test(endpoint)) continue;
      const handlers = config.endpoints[endpoint];
      if (Array.isArray(handlers) && handlers.length > 0) {
        const last = handlers[handlers.length - 1];
        if (NOTATIONS.controllerHandler.test(last)) {
          const { 0: controller, 1: handler } = last.split(".");
          if (controllers.includes(`${controller}.js`)) {
            const { 0: method, 1: path } = endpoint.split(" ");
            const { description } = descriptions[controller].handlers[handler];
            postman.item.push({
              name: `${controller.slice(0, -10)} ${handler}`,
              request: {
                description,
                method,
                header: [],
                url: `{{base}}${path}`
              }
            });
          }
        }
      }
    }
  }
  const path = `${project.getDir(true)}/${filename}`;
  fs.writeFile(path, JSON.stringify(postman, null, 2), (err) => {
    if (err !== null) {
      error(err);
      return
    }
    print(`\x1b[32mSaved export at '${path}'.\x1b[0m`);
  });
}
