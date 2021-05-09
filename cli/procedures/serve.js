import { exec } from "child_process";

export const enabled = true;
export const scope = "PROJECT";
export const description = "starts the webserver";
export const parameters = {};
export const options = {};
export default () => {

  const childProcess = exec("npm start");
  childProcess.stderr.on("data", (data) => {
    process.stderr.write(data);
  });
  childProcess.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  process.on("exit", (code) => {
    childProcess.kill(code);
  });

}