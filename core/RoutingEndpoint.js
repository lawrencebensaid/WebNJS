import ControllerDescriptor from "./ControllerDescriptor"

const RoutingEndpoint = (() => {

  var _path;
  var _method;
  var _controllers;

  /**
   * 
   * @param {string} path
   * @param {string} method
   * @param {ControllerDescriptor[]} controllers
   */
  function constructor(path, method = "GET", controllers) {
    if (typeof path === "string" && path.length > 1 && path[0] === "/") {
      _path = path;
    } else {
      console.error(`INVALID PATH '${path}'`);
    }
    if (typeof method === "string" && method.length > 0 && isNaN(parseInt(method))) {
      _method = method.toUpperCase();
    } else {
      console.error(`INVALID REQUEST METHOD '${method}'`);
    }
    if (Array.isArray(controllers) && controllers.length > 0) {
      _controllers = controllers;
    } else {
      console.error(`INVALID CONTROLLERS '${controllers}'`);
    }

    /**
     * @returns {string}
     */
    this.getMethod = () => { return _method; };

    /**
     * @returns {string}
     */
    this.getPath = () => { return _path; };

    /**
     * @returns {ControllerDescriptor[]}
     */
    this.getControllers = () => { return _controllers; };

    this.toString = () => {
      return `${_method} ${_path}`;
    };

  }

  return constructor;

})();

/**
 * @param {object} json JSON object
 * @returns {RoutingEndpoint[]}
 */
RoutingEndpoint.fromJSON = (json) => {
  if (!json.hasOwnProperty("endpoints")) return [];
  const { endpoints } = json;
  const middleware = json.middleware || [];
  const keys = Object.keys(endpoints);
  const results = [];
  for (let i = 0; i < keys.length; i++) {
    const components = keys[i].split(" ");
    const method = components[0];
    const path = components[1];
    const controllers = endpoints[keys[i]];
    for (let i = 0; i < middleware.length; i++) {
      controllers.unshift(middleware[i]);
    }
    results.push(new RoutingEndpoint(path, method, controllers));
  }
  return results;
};

export default RoutingEndpoint;