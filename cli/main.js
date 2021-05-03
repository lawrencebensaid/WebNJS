#!/usr/bin/env node
require = require("esm")(module);
global.print = console.log;
global.error = (...x) => { console.error(...x.map(y => `\x1b[31m${y}\x1b[0m`)) };
global.project = null;
global.TEMPLATES = ["controller", "routes-config"];
global.NOTATIONS = {
  model: /[A-Z_]\w*/,
  controller: /[A-Z]\w*Controller/,
  controllerHandler: /[A-Z]\w*Controller\.\w{1,}/,
  handler: /\w{1,}/,
  namespace: /[a-z]{1,}/,
  namespaceFile: /[a-z]{1,}\.json/,
  endpoint: /[A-Z]{2,}\ \/[\w/:]*/,
  endpointPath: /\/[\w/:]*/,
  endpointMethod: /[A-Z]{2,}/,
};

const program = require("commander");
const fs = require("fs");
const Project = require("./Project").default;

const ppath = `${process.cwd()}/package.json`;
if (fs.existsSync(ppath)) {
  const packageJson = require(ppath);
  const wnjsInstalled = Object.keys(packageJson.dependencies).includes("webnjs");
  if (wnjsInstalled) {
    global.project = Project.fromPackageJson(packageJson);
  }
}

const { version, description } = require("../package.json");

program
  .version(version)
  .description(description);

const commands = fs.readdirSync(`${__dirname}/procedures`);
for (const file of commands) {
  const { 0: procedure } = file.split(".");
  configureCommand(procedure);
}

function configureCommand(procedure) {
  const { default: execute, command, description, parameters, options, scope } = require(`${__dirname}/procedures/${procedure}.js`);
  const disabled = scope === "PROJECT" && project === null;
  var chain = program
    .command(`${procedure} ${Object.keys(parameters).map(value => `<${value}>`).join(" ")}`)
    .description(disabled ? `\x1b[31m[DISABLED]\x1b[0m\x1b[2m ${description}\x1b[0m\x1b[1m -> You need to be in a project directory to use this\x1b[0m` : description, parameters);
  for (const option in options) {
    const { execute, description } = options[option];
    chain = chain.option(option, description, execute);
  }
  chain.action((...x) => {
    if (disabled) return error("You need to be in a project directory to use this");
    execute(...x);
  });
}


program
  .parse(process.argv);

