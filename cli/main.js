#!/usr/bin/env node

const program = require("commander");
const fs = require("fs");

const {
  version,
  description,
  author,
  title: pTitle,
  name: pName
} = require("../package.json");
const title = pTitle || pName;

var force = false;

program
  .version(version)
  .description(description);

program
  .command("run")
  .description("run")
  .action(async (type, name) => {

  });

const commands = fs.readdirSync(`${__dirname}/procedures`);
for (const file of commands) {
  const { command, description, parameters, execute, options } = require(`${__dirname}/procedures/${file}`);
  console.log(command)
  const chain = program.command(command).description(description, parameters);
  for (const option in options) {
    const { command, description } = options[option];
    chain.option(option, description, command);
  }
  chain.action(execute);
}

// program
//   .command("create <type> <name>")
//   .description("create file", {
//     type: "'controller' or 'model'",
//     name: "name of the controller or model"
//   })
//   .option("-f, --force", "force", () => {
//     force = true;
//   })
//   .action(async (type, name) => {
//     if (!name.endsWith("Controller")) {
//       console.log(`\x1b[31mA controller name should end with "Controller". For example: "UserController".\x1b[0m`);
//       return;
//     }
//     if (!force && fs.existsSync(`${process.cwd()}/app/controllers/${name}.js`)) {
//       console.log("\x1b[31mA file with this name already exists. Use '-f' option to overwrite.\x1b[0m");
//       return;
//     }
//     name = name[0].toUpperCase() + name.slice(1);
//     const modelName = name == null ? "Entity" : name.split("-").join("_");
//     const authorName = typeof author.name === "string" ? author.name : author;
//     const authorEmail = typeof author.email === "string" ? author.email : null;
//     const date = new Date().toLocaleDateString();
//     const year = new Date().getFullYear();
//     const file = `${name}.js`;
//     const variables = {
//       file, project: title ? `\n//  ${title}` : "",
//       import: name == null ? `// import Entity from "../models/Entity";` : `import ${modelName} from "../models/${name}";`,
//       meta_created: `\n//  Created ${authorName ? `by ${authorName} ` : ""}on ${date}.`,
//       meta_copyright: authorName ? `\n//  Copyright © ${year} ${authorName}. All rights reserved.` : "",
//       class_author: authorName ? `\n * @author ${authorName}${authorEmail ? ` <${authorEmail}>\n *` : ""}` : "",
//       class_description: `\n * @description ${name == null ? "Manages requests" : `Manages requests regarding the ${name} model`}.`,
//       class_since: version ? `\n * @since ${version}.` : "",
//       class_name: name,
//       model: modelName,
//       model_lowercase: modelName.toLowerCase()
//     };
//     makeTemplate(variables, "controller", `app/controllers/${file}`, true);
//   });

program
  .parse(process.argv);

