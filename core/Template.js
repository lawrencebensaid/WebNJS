import fs from "fs"
import path from "path";

const Template = (() => {

  var _file = null;

  /**
   * 
   * @param {string} file
   */
  function constructor(file) {
    _file = file;

    /**
     * @description Renders the template file.
     * 
     * @param {object} context 
     * @param {string?} destination 
     * @param {boolean?} overwrite 'false' by default.
     */
    function render(context, destination = null, overwrite = false) {
      return new Promise((resolve, reject) => {
        const src = path.normalize(`${__dirname}/../cli/templates/${_file}`);
        const dest = path.normalize(`${process.cwd()}/${destination}`);
        if (fs.existsSync(src)) {
          if (destination && fs.existsSync(dest) && overwrite) {
            fs.unlinkSync(dest);
          }
          const template = fs.readFileSync(src);
          var content = template.toString();
          for (const key in context) {
            const variable = context[key];
            content = content.split(`<#${key}#>`).join(variable);
          }
          if (destination === null) {
            resolve(content);
          } else if (!fs.existsSync(dest)) {
            fs.writeFileSync(dest, content, { encoding: "utf8" });
            resolve(content);
          } else {
            if (overwrite) {
              reject("Unable to replace file!")
            } else {
              reject("This file already exists!")
            }
          }
        } else {
          reject("No prefabs found. You might need to reinstall webnjs.")
        }
      });
    }
    this.render = render;
  }

  return constructor;

})();

export default Template;