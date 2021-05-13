#!/usr/bin/env node
const { inspect } = require("util");
const EventEmitter = require("events");
require = require("esm")(module);
global.print = console.log;
global.error = (...x) => { console.error(...x.map(y => `\x1b[31m${inspect(y, false, null, true)}\x1b[0m`)) };
global.notifier = new EventEmitter();

const fs = require("fs");
const { default: Project } = require("./core/Project");

const ppath = `${process.cwd()}/package.json`;
if (fs.existsSync(ppath)) {
  const packageJson = require(ppath);
  const wnjsInstalled = Object.keys(packageJson.dependencies).includes("webnjs");
  if (wnjsInstalled) {
    global.project = Project.fromPackageJson(packageJson);
  }
}

require("./server.js");