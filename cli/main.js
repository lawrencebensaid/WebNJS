#!/usr/bin/env node
require = require("esm")(module);
global.print = console.log;
global.error = (...x) => { console.error(...x.map(y => `\x1b[31m${y}\x1b[0m`)) };
global.TEMPLATES = ["controller", "routes-config"];

const program = require("commander");
const fs = require("fs");

const {
  version,
  description
} = require("../package.json");

program
  .version(version)
  .description(description);

const commands = fs.readdirSync(`${__dirname}/procedures`);
for (const file of commands) {
  const { command, description, parameters, execute, options } = require(`${__dirname}/procedures/${file}`);
  var chain = program.command(command).description(description, parameters);
  for (const option in options) {
    const { execute, description } = options[option];
    chain = chain.option(option, description, execute);
  }
  chain.action(execute);
}


program
  .parse(process.argv);

