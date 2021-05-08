import Template from "../Template"
import { execSync } from "child_process";
import fs from "fs"

var force = false;

export const enabled = true;
export const scope = "PROJECT";
export const description = "creates a new model";
export const parameters = {
  name: "name of the model"
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
  if (!NOTATIONS.model.test(name)) {
    print(`\x1b[31mA model name should start with a capital letter. For example: "Post".\x1b[0m`);
    return;
  }
  if (!fs.existsSync(project.getAppDir(true))) {
    fs.mkdirSync(project.getAppDir(true));
  }
  if (!fs.existsSync(project.getModelsDir(true))) {
    fs.mkdirSync(project.getModelsDir(true));
  }
  const file = `${name}.js`;
  if (!force && fs.existsSync(`${project.getModelsDir(true)}/${file}`)) {
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
    class_description: `\n * @description Blueprint the ORM can use.`,
    class_since: version ? `\n * @since ${version}` : "",
    class_name: name
  };
  const template = new Template("model");
  try {
    await template.render(context, `${project.getModelsDir()}/${file}`, force);
    print(`\x1b[32mSaved new model to '${project.getControllersDir()}/${file}'.\x1b[0m`);
    execSync(`code -r ${project.getControllersDir()}/${file}`);
  } catch (error) {
    error(error);
  }
}