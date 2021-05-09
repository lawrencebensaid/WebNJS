import { execSync } from "child_process";
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
    const matches = getHandlerComponents(controllerFile);
    for (const { 1: comments, 2: handler, 3: input } of matches) {
      const { 0: controllerName } = controller.split(".");
      if (typeof descriptions[controllerName] !== "object") {
        descriptions[controllerName] = { handlers: {} };
      }
      const descriptor = {};
      const tokenRememberance = getTokenRememberance(comments);
      if (typeof tokenRememberance === "string") {
        descriptor.tokenRememberance = tokenRememberance;
      }
      const middleware = getMiddleware(comments);
      if (middleware === "bearer") {
        descriptor.auth = {};
      }
      if (input) {
        descriptor.fields = getFields(input);
      }
      if (comments) {
        descriptor.description = getDescription(comments);
        const examples = getFieldExamples(comments);
        // print(Object.keys(examples).includes())
        if (descriptor.fields && descriptor.fields.body) {
          for (const key in examples) {
            const example = examples[key];
            if (descriptor.fields.body.hasOwnProperty(key)) {
              descriptor.fields.body[key].example = example
            }
          }
        }
      }
      descriptions[controllerName].handlers[handler] = descriptor;
    }
  }

  // index endpoints
  for (const namespace of namespaces) {
    if (!NOTATIONS.namespaceFile.test(namespace)) continue;
    const config = JSON.parse(fs.readFileSync(`${project.getRoutesDir(true)}/${namespace}`));
    const folderItems = [];
    for (const endpoint in config.endpoints) {
      if (!NOTATIONS.endpoint.test(endpoint)) continue;
      const handlers = config.endpoints[endpoint];
      if (Array.isArray(handlers) && handlers.length > 0) {
        const last = handlers[handlers.length - 1];
        if (NOTATIONS.controllerHandler.test(last)) {
          const { 0: controller, 1: handler } = last.split(".");
          if (controllers.includes(`${controller}.js`)) {
            const { 0: method, 1: path } = endpoint.split(" ");
            const pmItem = { request: { method, header: [] }, event: [] };
            var fields = { body: {}, query: {}, params: {} };
            pmItem.name = `${controller.slice(0, -10)} ${handler}`;
            const newPath = replaceParams(path);
            pmItem.request.url = `{{base}}${newPath}`;

            // Build endpoint
            if (descriptions.hasOwnProperty(controller) && descriptions[controller].handlers) {
              const descriptor = descriptions[controller].handlers[handler] || {};
              pmItem.description = descriptor.description;
              fields = descriptor.fields;
              if (descriptor.auth) {
                pmItem.auth = {
                  type: "bearer",
                  bearer: [
                    {
                      key: "token",
                      value: "{{token}}",
                      type: "string"
                    }
                  ]
                };
              }
              if (typeof descriptor.tokenRememberance === "string") {
                pmItem.event.push({
                  listen: "test",
                  script: {
                    type: "text/javascript",
                    exec: [
                      `const token = pm.response.json().${descriptor.tokenRememberance};`,
                      "pm.collectionVariables.set(\"token\", token);"
                    ]
                  }
                });
              }
            }
            var bodyJson = {};
            if (fields && typeof fields.body === "object") {
              for (const key in fields.body) {
                const field = fields.body[key];
                bodyJson[key] = field.example || null;
              }
            }
            if (Object.keys(bodyJson).length > 0) {
              pmItem.request.body = {
                mode: "raw",
                raw: JSON.stringify(bodyJson, null, 2),
                options: { raw: { language: "json" } }
              }
            }
            folderItems.push(pmItem);
          }
        }
      }
    }
    const folderName = namespace.split(".");
    folderName.pop();
    postman.item.push({
      name: folderName.map(x => { return x.capitalize() }).join(" "),
      item: folderItems
    });
  }

  const path = `${project.getDir(true)}/${filename}`;
  fs.writeFile(path, JSON.stringify(postman, null, 2), (err) => {
    if (err !== null) {
      error(err);
      return
    }
    print(`\x1b[32mSaved export at '${path}'.\x1b[0m`);
    execSync(`code -r ${path}`);
  });
}


function replaceParams(path) {
  var newPath = path;
  const matches = path.matchAll(/(:\w+)/g);
  for (const { 1: param } of matches) {
    const replacement = `{{${param.substring(1)}}}`;
    newPath = newPath.split(param).join(replacement);
  }
  return newPath;
}


function getHandlerComponents(file) {
  return file.matchAll(/(\/\*\*[\w\s*@!.,-_<>{}()]*\*\/)[\w\s]*\b(?!\bcatch\b)(\w{1,})\b\s*\(.*\)\s*\{[\s]*(?:((?:body|query|param)Field[\w"'().,;\s-]*)(?:invalid))?/gm);
}


function getDescription(comments) {
  return comments.match(/@description ([\w *.,-_<>{}()]*)/m)[1];
}


function getMiddleware(comments) {
  const match = comments.match(/@middleware(?: ([\w *.,-_<>{}()]*)?)?/m);
  if (match) {
    return match[1] || "";
  }
  return null;
}


function getTokenRememberance(comments) {
  const match = comments.match(/@signin(?: ([\w *.,-_<>{}()]*)?)?/m);
  if (match) {
    return match[1] || "";
  }
  return null;
}


function getFieldExamples(comments) {
  const matches = comments.matchAll(/@field_example ([\w*.-_]*) +(.*)/gm);
  const fields = {};
  for (var { 1: key, 2: value } of matches) {
    const isNumber = value.replace(/[\d.]+/, "").length === value.length && value.replace(/[^.]/g, "").length <= 1;
    if (isNumber && !isNaN(parseFloat(value))) {
      fields[key] = parseFloat(value);
    } else if (["true", "false"].includes(value)) {
      fields[key] = value === "true";
    } else {
      fields[key] = value;
    }
  }
  return fields;
}


function getFields(input) {
  const matches = input.matchAll(/(body|query|param)Field\(["']([\w-]+)["'](?:, ["']([\w-]*)["'])?\)/gm);
  const fields = { body: {}, query: {}, params: {} };
  for (const { 1: scope, 2: key, 3: alias } of matches) {
    fields[scope][key] = { alias, required: false };
  }
  return fields;
}