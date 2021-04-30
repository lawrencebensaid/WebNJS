const fs = require("fs");

/**
 * @description Makes template.
 */
function doctor() {
  var issues = 0;
  var resolved = 0;
  if (!fs.existsSync(`${process.cwd()}/app`)) {
    fs.mkdirSync(`${process.cwd()}/app`);
    issues++;
    resolved++
  }
  if (!fs.existsSync(`${process.cwd()}/app/controllers`)) {
    fs.mkdirSync(`${process.cwd()}/app/controllers`);
    issues++;
    resolved++
  }
  if (!fs.existsSync(`${process.cwd()}/app/routes`)) {
    fs.mkdirSync(`${process.cwd()}/app/routes`);
    issues++;
    resolved++
  }
  for (const template of TEMPLATES) {
    if (!fs.existsSync(`${__dirname}/../templates/${template}`)) {
      error(`templates/${template} missing!`);
      issues++;
    }
  }
  print(`${issues} issues found. ${resolved} resolved.`);
}


module.exports.execute = doctor;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "PROJECT";
module.exports.command = "doctor";
module.exports.options = {};
module.exports.description = "Ensures the project integrity.";
module.exports.parameters = {};