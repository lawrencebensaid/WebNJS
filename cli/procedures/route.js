import fs from "fs"
import { execSync } from "child_process"


export const enabled = true;
export const scope = "PROJECT";
export const description = "finds the namespace a given endpoint is in";
export const parameters = {
  method: "http method. For example: 'GET' or 'POST'",
  path: "endpoint path starting with a slash. For example: '/posts'"
};
export const options = {};
export default async (method, path) => {
  if (!NOTATIONS.endpointPath.test(path)) {
    error(`Invalid path: '${path}'. A route path should look like this: "/posts/update".`);
    return;
  }
  const dir = project.getRoutesDir(true);
  const contents = fs.readdirSync(dir);
  const endpoint = `${method} ${path}`;
  for (const namespace of contents) {
    var path = `${dir}/${namespace}`;
    if (!path.endsWith(".json")) continue;
    const file = fs.readFileSync(path, "utf8");
    const json = JSON.parse(file);
    if (json.hasOwnProperty("endpoints")) {
      if (json.endpoints.hasOwnProperty(endpoint)) {
        var index = file.indexOf(endpoint);
        var section = file.substring(0, index);
        var line = section.split("\n").length;
        path += `:${line}`;
        print(path);
        execSync(`code -gr ${path}`);
        break;
      }
    }
  }
}
