const fs = require("fs");
const path = project.getHelpersDir(true);
const files = fs.readdirSync(path);
const helpers = {};
for (const file of files) {
  if (!file.endsWith(".js")) continue;
  const helper = file.split(".");
  helper.pop();
  helpers[helper.join(".")] = require(`${path}/${file}`).default;
}
module.exports = helpers;