const fs = require("fs");
const path = require("path");

const { COPYFILE_EXCL } = fs.constants;

const {
  version,
  author,
  title: pTitle,
  name: pName
} = require("../../package.json");
const title = pTitle || pName;

var force = false;

/**
 * @description Makes template.
 */
function create(type, name) {
  switch (type) {
    case "controller":
      make_controller(name);
      return;
    default:
      make_controller(name);
      return;
  }
}


/**
 * 
 */
function make_controller(name) {
  if (!name.endsWith("Controller")) {
    console.log(`\x1b[31mA controller name should end with "Controller". For example: "UserController".\x1b[0m`);
    return;
  }
  if (!force && fs.existsSync(`${process.cwd()}/app/controllers/${name}.js`)) {
    console.log("\x1b[31mA file with this name already exists. Use '-f' option to overwrite.\x1b[0m");
    return;
  }
  name = name[0].toUpperCase() + name.slice(1);
  const modelName = name == null ? "Entity" : name.split("-").join("_");
  const authorName = typeof author.name === "string" ? author.name : author;
  const authorEmail = typeof author.email === "string" ? author.email : null;
  const date = new Date().toLocaleDateString();
  const year = new Date().getFullYear();
  const file = `${name}.js`;
  const variables = {
    file, project: title ? `\n//  ${title}` : "",
    import: name == null ? `// import Entity from "../models/Entity";` : `import ${modelName} from "../models/${name}";`,
    meta_created: `\n//  Created ${authorName ? `by ${authorName} ` : ""}on ${date}.`,
    meta_copyright: authorName ? `\n//  Copyright © ${year} ${authorName}. All rights reserved.` : "",
    class_author: authorName ? `\n * @author ${authorName}${authorEmail ? ` <${authorEmail}>\n *` : ""}` : "",
    class_description: `\n * @description ${name == null ? "Manages requests" : `Manages requests regarding the ${name} model`}.`,
    class_since: version ? `\n * @since ${version}.` : "",
    class_name: name,
    model: modelName,
    model_lowercase: modelName.toLowerCase()
  };
  makeTemplate(variables, "controller", `app/controllers/${file}`, true);
}


/**
 * @description Renders the template file.
 * @param {Object} variables 
 * @param {String} template 
 * @param {String} path 
 */
function makeTemplate(variables, template, projectPath) {
  const overwrite = arguments[3] === true ? true : false;
  const src = path.normalize(`${__dirname}/../../cli/templates/${template}`);
  const dest = path.normalize(`${process.cwd()}/${projectPath}`);
  if (fs.existsSync(src)) {
    if (fs.existsSync(dest) && overwrite) {
      fs.unlinkSync(dest);
    }
    if (!fs.existsSync(dest)) {
      fs.copyFile(src, dest, COPYFILE_EXCL, (error) => {
        if (error) {
          console.log(`\x1b[31m (error) ${error.message}\x1b[0m`);
          return;
        }
        var content = fs.readFileSync(dest).toString();
        for (const key in variables) {
          const variable = variables[key];
          content = content.split(`<#${key}#>`).join(variable);
        }
        fs.writeFileSync(dest, content, { encoding: "utf8" });
        console.log(`\x1b[32m Done.\x1b[0m`);
      });
    } else {
      if (overwrite) {
        console.log(`\x1b[31m (error) Unable to replace file!\x1b[0m`);
      } else {
        console.log(`\x1b[31m (error) This file already exists!\x1b[0m`);
      }
    }
  } else {
    console.log(`\x1b[31m (fatal error) No prefabs found. You might need to reinstall Avalanche.\x1b[0m`);
    // process.exit(AFError.INCOMPLETECORE);
  }
}


module.exports.execute = create;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "PROJECT";
module.exports.command = "create <type> <name>";
module.exports.options = {
  "-f, --force": {
    description: "force",
    execute: () => {
      force = true;
    }
  }
};
module.exports.description = "Creates a component.";
module.exports.parameters = {
  type: "'controller' or 'model'",
  name: "name of the controller or model"
};