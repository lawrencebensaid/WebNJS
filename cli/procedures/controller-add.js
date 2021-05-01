import Template from "../Template"
import fs from "fs"

const {
  version,
  author,
  title: pTitle,
  name: pName
} = require(`${process.cwd()}/package.json`);
const title = pTitle || pName;

var force = false;

/**
 * @description Makes template.
 */
async function controllerAdd(name) {
  if (!NOTATIONS.controller.test(name)) {
    print(`\x1b[31mA controller name should end with "Controller". For example: "UserController".\x1b[0m`);
    return;
  }
  const appDir = `${process.cwd()}/app`;
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir);
  }
  if (!fs.existsSync(`${appDir}/controllers`)) {
    fs.mkdirSync(`${appDir}/controllers`);
  }
  const file = `${name}.js`;
  if (!force && fs.existsSync(`${appDir}/controllers/${file}`)) {
    error("A file with this name already exists. Use '-f' option to overwrite.");
    return;
  }
  name = name[0].toUpperCase() + name.slice(1);
  const authorName = typeof author.name === "string" ? author.name : author;
  const authorEmail = typeof author.email === "string" ? author.email : null;
  const date = new Date().toLocaleDateString();
  const year = new Date().getFullYear();
  const context = {
    file, project: title ? `\n//  ${title}` : "",
    meta_created: `\n//  Created ${authorName ? `by ${authorName} ` : ""}on ${date}.`,
    meta_copyright: authorName ? `\n//  Copyright © ${year} ${authorName}. All rights reserved.` : "",
    class_author: authorName ? `\n * @author ${authorName}${authorEmail ? ` <${authorEmail}>\n *` : ""}` : "",
    class_description: `\n * @description ${name == null ? "Manages requests" : `Manages requests regarding the ${name} model`}.`,
    class_since: version ? `\n * @since ${version}` : "",
    class_name: name
  };
  const template = new Template("controller");
  try {
    await template.render(context, `app/controllers/${file}`, force);
    print(`\x1b[32mDone.\x1b[0m`);
  } catch (error) {
    error(error);
  }
}


module.exports.execute = controllerAdd;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "PROJECT";
module.exports.command = "controller-add <name>";
module.exports.options = {
  "-f, --force": {
    description: "force",
    execute: () => {
      force = true;
    }
  }
};
module.exports.description = "Creates a new controller.";
module.exports.parameters = {
  name: "name of the controller or model"
};