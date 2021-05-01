import fs from "fs";

var resolve = false;
var verbose = false;
var force = false;

export const enabled = true;
export const scope = "PROJECT";
export const description = "reports on the project integrity (and can certain resolve issues)";
export const parameters = {};
export const options = {
  "-v --verbose": {
    description: "verbose output",
    execute: () => {
      verbose = true
    }
  },
  "-r --resolve": {
    description: "resolve issues if possible",
    execute: () => {
      resolve = true
    }
  },
  "-f --force": {
    description: "forcefully resolve issues",
    execute: () => {
      force = true
    }
  }
};
export default () => {
  var issues = [];
  var resolved = 0;
  

  // Check entrypoint configuration
  const scripts = project.getScripts();
  if (!scripts.hasOwnProperty("start") || scripts.start !== "./main.js") {
    issues.push({ message: "Entrypoint missing: no start script" });
    if (resolve) {
      project.setScript("start", "./main.js");
      resolved++
    }
  }


  // Check folder structure
  const appDir = `${process.cwd()}/app`;
  if (!fs.existsSync(appDir)) {
    issues.push({ message: "Folder missing: app/" });
    if (resolve) {
      fs.mkdirSync(appDir);
      resolved++
    }
  }
  if (!fs.existsSync(`${appDir}/controllers`)) {
    issues.push({ message: "Folder missing: app/controllers/" });
    if (resolve) {
      fs.mkdirSync(`${appDir}/controllers`);
      resolved++
    }
  }
  if (!fs.existsSync(`${appDir}/routes`)) {
    issues.push({ message: "Folder missing: app/routes/" });
    if (resolve) {
      fs.mkdirSync(`${appDir}/routes`);
      resolved++
    }
  }

  // Check if all templates are still present
  for (const template of TEMPLATES) {
    if (!fs.existsSync(`${__dirname}/../templates/${template}`)) {
      issues.push({ message: `templates/${template} missing!` });
    }
  }

  // Check namespaces for mistakes
  const namespaces = fs.readdirSync(`${appDir}/routes`);
  const controllers = fs.readdirSync(`${appDir}/controllers`);
  for (const namespace of namespaces) {
    if (!NOTATIONS.namespaceFile.test(namespace)) continue;

    // Check namespace content for mistakes
    const config = JSON.parse(fs.readFileSync(`${appDir}/routes/${namespace}`));
    for (const key in config.endpoints) {

      // Check endpoint notation
      if (!NOTATIONS.endpoint.test(key)) {
        issues.push({ message: `Invalid endpoint notation: ${key}` });
        if (resolve) {
          var newKey = key;
          newKey = resolveRoutingEndpointPath(key);
          newKey = resolveRoutingEndpointMethod(newKey);
          if (NOTATIONS.endpoint.test(newKey)) {
            const exists = config.endpoints.hasOwnProperty(newKey);
            if (force || !exists) {
              config.endpoints[newKey] = config.endpoints[key];
              delete config.endpoints[key];
              resolved++;
            }
          }
        }
      }

      // Check endpoint controller-handlers
      const handlers = config.endpoints[key];
      if (Array.isArray(handlers)) {
        for (const controllerHandler of handlers) {
          if (NOTATIONS.controllerHandler.test(controllerHandler)) {
            const { 0: controller, 1: handler } = controllerHandler.split(".");
            if (controllers.includes(`${controller}.js`)) {
              const controllerFile = fs.readFileSync(`${appDir}/controllers/${controller}.js`, { encoding: "utf8" });
              const rex = /(?=\s*)\b(?!\bcatch\b)(\w{1,})\b(?=\s*\(.*\)\s*\{)/gm;
              const functions = controllerFile.match(rex);
              if (!functions.includes(handler)) {
                issues.push({ message: `Endpoint '${key}' points to handler '${handler}' which does not exist in '${controller}'.` });
              }
            } else {
              issues.push({ message: `Endpoint '${key}' points to '${controller}' which does not exist.` });
            }
          } else {
            issues.push({ message: `Endpoint '${key}' contains invalid handler ${handler}` });
          }
        }
      } else {
        issues.push({ message: `Endpoint '${key}' should be an array` });
      }

    }
    if (resolve) {
      fs.writeFileSync(`${appDir}/routes/${namespace}`, JSON.stringify(config, null, 2));
    }

  }


  // Report
  for (const { message } of issues) {
    error(message);
  }

  // Summary
  print(`${issues.length} issues found.${resolve ? ` ${resolved} resolved.` : ""}`);
}

/**
 * @param {string} key 
 * @return {string} new key
 */
function resolveRoutingEndpointMethod(key) {
  const components = key.split(" ");
  components[0] = components[0].toUpperCase();
  return components.join(" ");
}

/**
 * @param {string} key 
 * @return {string} new key
 */
function resolveRoutingEndpointPath(key) {
  const components = key.split(" ");
  components[1] = components[1][0] !== "/" ? "/" + components[1] : components[1];
  return components.join(" ");
}