import Template from "../Template"
import fs from "fs"

var force = false;

export const enabled = true;
export const scope = "PROJECT";
export const description = "creates a new controller";
export const parameters = {
  name: "name of the controller"
};
export const options = {
  "-f, --force": {
    description: "force",
    execute: () => {
      force = true;
    }
  }
};
export default async (name) => {
  if (!NOTATIONS.controller.test(name)) {
    print(`\x1b[31mA controller name should end with "Controller". For example: "UserController".\x1b[0m`);
    return;
  }
  if (!fs.existsSync(project.getAppDir(true))) {
    fs.mkdirSync(project.getAppDir(true));
  }
  if (!fs.existsSync(`${project.getControllersDir(true)}`)) {
    fs.mkdirSync(`${project.getControllersDir(true)}`);
  }
  const file = `${name}.js`;
  if (!force && fs.existsSync(`${project.getControllersDir(true)}/${file}`)) {
    error("A file with this name already exists. Use '-f' option to overwrite.");
    return;
  }
  name = name[0].toUpperCase() + name.slice(1);
  const title = project.getTitle();
  const version = project.getVersion();
  const authorName = project.getAuthorName();
  const authorEmail = project.getAuthorEmail();
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
    await template.render(context, `${project.getControllersDir()}/${file}`, force);
    print(`\x1b[32mDone.\x1b[0m`);
  } catch (err) {
    error(err);
  }
}