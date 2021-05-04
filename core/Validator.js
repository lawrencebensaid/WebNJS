

/**
 * Responsible for validating controller input.
 * 
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
 class Validator {

  constructor(request) {
    this.fields = { body: {}, query: {}, param: {} };
    this.invalid = { body: {}, query: {}, param: {} };
    request.bodyField = (key, alias = null) => {
      this.key = key
      this.scope = "body";
      this.fields["body"][key] = {
        label: alias || key,
        value: request.body[key]
      }
      return this;
    }
    request.queryField = (key, alias = null) => {
      this.key = key
      this.scope = "query";
      this.fields["query"][key] = {
        label: alias || key,
        value: request.query[key]
      }
      return this;
    }
    request.paramsField = (key, alias = null) => {
      this.key = key
      this.scope = "param";
      this.fields["param"][key] = {
        label: alias || key,
        value: request.params[key]
      }
      return this;
    }
    request.invalid = ({ reject }) => {
      const failures = [];
      for (const scope of Object.keys(this.invalid)) {
        for (const key in this.invalid[scope]) {
          for (const condition in this.invalid[scope][key]) {
            const label = this.fields[scope][key].label;
            const msg = this.fields[scope][key].msg;
            const conditionValue = this.invalid[scope][key][condition];
            switch (condition) {
              case "vIs":
                failures.push({ field: key, scope, error: "unexpectedValue", message: msg || `'${label}' is does not equal expected value.` });
                break;
              case "vNot":
                failures.push({ field: key, scope, error: "isRestrictedValue", message: msg || `'${label}' must not be restricted value.` });
                break;
              case "vNotEmpty":
                failures.push({ field: key, scope, error: "isEmpty", message: msg || `'${label}' must not be empty.` });
                break;
              case "vRequired":
                failures.push({ field: key, scope, error: "missing", message: msg || `'${label}' is missing.` });
                break;
              case "vTypes":
                failures.push({ field: key, scope, error: "invalidType", message: msg || `Type of '${label}' must be ${conditionValue.map(x => `'${x}'`).join(" ,")}.` });
                break;
              case "vNumber":
                failures.push({ field: key, scope, error: "invalidType", message: msg || `Type of '${label}' must be a number.` });
                break;
              case "vString":
                failures.push({ field: key, scope, error: "invalidType", message: msg || `Type of '${label}' must be a string.` });
                break;
              case "vBoolean":
                failures.push({ field: key, scope, error: "invalidType", message: msg || `Type of '${label}' must be a boolean.` });
                break;
              case "vLength":
                failures.push({ field: key, scope, error: "invalidLength", message: msg || `Length of '${label}' must be ${conditionValue}.` });
                break;
              case "vRange":
                failures.push({ field: key, scope, error: "invalidLength", message: msg || `Length of '${label}' must be in range ${conditionValue}.` });
                break;
              case "vGreaterThan":
                failures.push({ field: key, scope, error: "invalidLength", message: msg || `Length of '${label}' must be greater than ${conditionValue}.` });
                break;
              case "vLessThan":
                failures.push({ field: key, scope, error: "invalidLength", message: msg || `Length of '${label}' must be less than ${conditionValue}.` });
                break;
            }
          }
        }
      }
      if (failures.length <= 0) return false;
      reject({ errors: failures });
      return true;
    }
  }
  
  
  /**
   * Adds a fail message to the field. This will be used if the field is invalid instead of the default generated message.
   * 
   * @param {string} label Alias (label)
   */
  message(msg) {
    if (typeof msg === "string") {
      this.msg = msg;
      this.fields[this.scope][this.key].msg = this.msg;
    }
    return this;
  }
  
  
  /**
   * Adds an alias to the field.
   * 
   * @param {string} label Alias (label)
   */
  alias(label) {
    if (typeof label === "string") {
      this.label = label;
      this.fields[this.scope][this.key].label = this.label;
    }
    return this;
  }


  /**
   * @param {any} value The value that the field should have.
   */
  is(value) {
    if (value === this.fields[this.scope][this.key].value) {
      return this;
    }
    this.reportInvalid("vIs", null);
    return this;
  }


  /**
   * @param {any} value The value that the field should not have.
   */
  not(value) {
    if (value !== this.fields[this.scope][this.key].value) {
      return this;
    }
    this.reportInvalid("vNot");
    return this;
  }


  /**
   * If field is given, it may not be empty. If the field is not present, do nothing.
   */
  notEmpty() {
    const { value } = this.fields[this.scope][this.key];
    if (value === undefined || (typeof value !== "boolean" && value)) {
      return this;
    }
    this.reportInvalid("vNotEmpty");
    return this;
  }


  /**
   * If field is not given, report it.
   */
  required() {
    const { value } = this.fields[this.scope][this.key];
    if (typeof value !== "undefined" && value !== null) {
      return this;
    }
    this.reportInvalid("vRequired");
    return this;
  }


  /**
   * If field type is not any of the given types, report it.
   * 
   * @param {string|string[]} type Type or types.
   */
  type(type) {
    const { value } = this.fields[this.scope][this.key];
    const types = Array.isArray(type) ? type : [type];
    if (types.includes("number") && !isNaN(parseInt(value))) {
      return this;
    }
    if (types.includes("string") && typeof value === "string") {
      return this;
    }
    if (types.includes("boolean") && (
      (typeof value === "string" && value.toLowerCase() === "false") ||
      (typeof value === "string" && value.toLowerCase() === "true") ||
      value === "1" ||
      value === "0" ||
      value === 1 ||
      value === 0
    )) {
      return this;
    }
    this.reportInvalid("vTypes", types);
    return this;
  }


  /**
   * If field type is not of type number, report it.
   */
  number() {
    const { value } = this.fields[this.scope][this.key];
    if (!isNaN(parseInt(value))) {
      return this;
    }
    this.reportInvalid("vNumber");
    return this;
  }


  /**
   * If field type is not of type string, report it.
   */
  string() {
    const { value } = this.fields[this.scope][this.key];
    if (typeof value === "string") {
      return this;
    }
    this.reportInvalid("vString");
    return this;
  }


  /**
   * If field type is not of type boolean, report it.
   */
  boolean() {
    const { value } = this.fields[this.scope][this.key];
    if (
      (typeof value === "string" && value.toLowerCase() === "false") ||
      (typeof value === "string" && value.toLowerCase() === "true") ||
      value === "1" ||
      value === "0" ||
      value === 1 ||
      value === 0
    ) {
      return this;
    }
    this.reportInvalid("vBoolean");
    return this;
  }


  /**
   * If field value lies outside of the number range, report it.
   */
  range(min, max) {
    var { value } = this.fields[this.scope][this.key];
    if (Array.isArray(value) || typeof value === "string") {
      if (value.length >= min && value.length <= max) {
        return this;
      }
    }
    value = parseInt(value);
    if (!isNaN(value)) {
      if (value >= min && value <= max) {
        return this;
      }
    }
    this.reportInvalid("vRange", `${min}-${max}`);
    return this;
  }


  /**
   * If field value is not of the given length, report it.
   */
  length(number) {
    const { value } = this.fields[this.scope][this.key];
    if (Array.isArray(value) || typeof value === "string") {
      if (value.length == number) {
        return this;
      }
    }
    if (typeof value === "number") {
      if (value == number) {
        return this;
      }
    }
    this.reportInvalid("vLength", number);
    return this;
  }


  /**
   * If field value is not greater than the given number, report it.
   */
  greaterThan(number) {
    const { value } = this.fields[this.scope][this.key];
    if (Array.isArray(value) || typeof value === "string") {
      if (value.length > number) {
        return this;
      }
    }
    if (typeof value === "number") {
      if (value > number) {
        return this;
      }
    }
    this.reportInvalid("vGreaterThan", number);
    return this;
  }


  /**
   * If field value is not less than the given number, report it.
   */
  lessThan(number) {
    const { value } = this.fields[this.scope][this.key];
    if (Array.isArray(value) || typeof value === "string") {
      if (value.length < number) {
        return this;
      }
    }
    if (typeof value === "number") {
      if (value < number) {
        return this;
      }
    }
    this.reportInvalid("vLessThan", number);
    return this;
  }


  /**
   * Report an invalid field. Used by the validation functions in this class. But may also be used in the controller.
   */
  reportInvalid(v, value = null) {
    if (!this.invalid[this.scope][this.key]) {
      this.invalid[this.scope][this.key] = {}
    }
    // this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : []; // This is bad, because it allows identical keypairs. For example, something shouldn't be required to be of length 3 and of length 7 at the same time. This obviously is impossible.
    this.invalid[this.scope][this.key][v] = value;
  }

}


export default Validator;