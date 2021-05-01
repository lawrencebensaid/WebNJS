import Template from "../Template"
import fs from "fs"

var force = false;

export const enabled = true;
export const scope = "PROJECT";
export const description = "creates a new controller";
export const parameters = {
  name: "name of the controller or model"
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
    await template.render(context, `app/controllers/${file}`, force);
    print(`\x1b[32mDone.\x1b[0m`);
  } catch (error) {
    error(error);
  }
}