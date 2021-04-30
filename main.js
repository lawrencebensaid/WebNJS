#!/usr/bin/env node
require = require("esm")(module);
global.print = console.log;
global.error = (...x) => { console.error(...x.map(y => `\x1b[31m${y}\x1b[0m`)) };
require("./server.js");