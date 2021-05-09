// const fs = require("fs");

// const modelsDir = project.getModelsDir(true);
// const modelFiles = fs.readdirSync(modelsDir);
// for (const modelFile of modelFiles) {
//   const components = modelFile.split(".");
//   components.pop();
//   const modelName = components.join("_")
//   const model = require(`${modelsDir}/${modelFile}`);
//   module.exports[modelName] = model.default ? model.default : model;
// }

module.exports = db.models;