const ControllerDescriptor = (() => {

  var _className;
  var _handlerName;

  /**
   * 
   * @param {string} className
   * @param {string} handlerName
   */
  function constructor(className, handlerName) {
    if (typeof className === "string" && className.length > 0 && isNaN(parseInt(className))) {
      _className = className.toUpperCase();
    } else {
      console.error(`INVALID CLASS NAME '${method}'`);
    }
    if (typeof handlerName === "string" && handlerName.length > 0 && isNaN(parseInt(handlerName))) {
      _handlerName = handlerName.toUpperCase();
    } else {
      console.error(`INVALID HANDLER NAME '${method}'`);
    }

    /**
     * @returns {string}
     */
    this.getClass = () => { return _className; };

    /**
     * @returns {string}
     */
    this.getHandler = () => { return _handlerName; };

    this.toString = () => {
      return `${_className}.${_handlerName}`;
    };

  }

  return constructor;

})();

/**
 * @param {string[]} strings Array of strings. Format: `<className>.<handlerName>`.
 * @returns {ControllerDescriptor[]}
 */
ControllerDescriptor.fromStrings = (strings) => {
  if (!Array.isArray(strings)) return [];
  const results = [];
  for (let i = 0; i < strings.length; i++) {
    const components = strings[i].split(".");
    if (components.length !== 2) continue;
    results.push(new ControllerDescriptor(components[0], components[1]));
  }
  return results;
};

export default ControllerDescriptor;