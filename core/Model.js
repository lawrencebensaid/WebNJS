const Model = (() => {

  /**
   * 
   */
  function constructor(name, structure, options) {
    db.define(name, structure, options);
  }

  return constructor;

})();

export default Model;