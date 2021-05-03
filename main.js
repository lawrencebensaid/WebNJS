#!/usr/bin/env node
const { inspect } = require("util");
require = require("esm")(module);
global.print = console.log;
global.error = (...x) => { console.error(...x.map(y => `\x1b[31m${inspect(y, false, null, true)}\x1b[0m`)) };
require("./server.js");