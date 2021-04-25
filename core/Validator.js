

/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class Validator {

  constructor(request) {
    this.invalid = { body: {}, query: {}, param: {} };
    request.body.validate = (key) => {
      this.key = key
      this.label = key
      this.scope = "body";
      this.value = request.body[key];
      return this;
    }
    request.query.validate = (key) => {
      this.key = key
      this.label = key
      this.scope = "query";
      this.value = request.query[key];
      return this;
    }
    request.params.validate = (key) => {
      this.key = key
      this.label = key
      this.scope = "param";
      this.value = request.params[key];
      return this;
    }
    request.validate = ({ onFailure, onSuccess }) => {
      var failures = [];
      for (const method of Object.keys(this.invalid)) {
        for (const key in this.invalid[method]) {
          for (const condition in this.invalid[method][key]) {
            const label = this.invalid[method][key].label;
            const conditionValue = this.invalid[method][key][condition];
            switch (condition) {
              case "vEquals":
                failures.push({ field: key, scope: method, error: "unexpectedValue", message: `'${label}' is does not equal expected value.` });
                break;
              case "vNot":
                failures.push({ field: key, scope: method, error: "isRestrictedValue", message: `'${label}' must not be restricted value.` });
                break;
              case "vNotEmpty":
                failures.push({ field: key, scope: method, error: "isEmpty", message: `'${label}' must not be empty.` });
                break;
              case "vType":
                failures.push({ field: key, scope: method, error: "invalidType", message: `Type of '${label}' must be '${conditionValue}'.` });
                break;
              case "vNumber":
                failures.push({ field: key, scope: method, error: "invalidType", message: `Type of '${label}' must be a number.` });
                break;
              case "vString":
                failures.push({ field: key, scope: method, error: "invalidType", message: `Type of '${label}' must be a string.` });
                break;
              case "vBoolean":
                failures.push({ field: key, scope: method, error: "invalidType", message: `Type of '${label}' must be a boolean.` });
                break;
              case "vLength":
                failures.push({ field: key, scope: method, error: "invalidLength", message: `Length of '${label}' must be ${conditionValue}.` });
                break;
              case "vRange":
                failures.push({ field: key, scope: method, error: "invalidLength", message: `Length of '${label}' must be in range ${conditionValue}.` });
                break;
              case "vGreaterThan":
                failures.push({ field: key, scope: method, error: "invalidLength", message: `Length of '${label}' must be greater than ${conditionValue}.` });
                break;
              case "vLessThan":
                failures.push({ field: key, scope: method, error: "invalidLength", message: `Length of '${label}' must be less than ${conditionValue}.` });
                break;
            }
          }
        }
      }
      if (failures.length <= 0) return true;
      onFailure({ error: new Error("Validation failed"), errors: failures });
      return false;
    }
  }

  alias(alias) {
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    if (typeof alias === "string") {
      this.invalid[this.scope][this.key].label = alias;
    }
    return this;
  }

  equals(value) {
    if (value === this.value) {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vEquals = null;
    return this;
  }

  not(value) {
    if (value !== this.value) {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vNot = null;
    return this;
  }

  notEmpty() {
    if (typeof this.value !== "boolean" && this.value) {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vNotEmpty = null;
    return this;
  }

  type(type) {
    if (type === "number" && !isNaN(parseInt(this.value))) {
      return this;
    }
    if (type === "string" && typeof this.value === "string") {
      return this;
    }
    if (type === "boolean" && (
      (typeof this.value === "string" && this.value.toLowerCase() === "false") ||
      (typeof this.value === "string" && this.value.toLowerCase() === "true") ||
      this.value === "1" ||
      this.value === "0" ||
      this.value === 1 ||
      this.value === 0
    )) {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vType = type;
    return this;
  }

  number() {
    if (!isNaN(parseInt(this.value))) {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vNumber = null;
    return this;
  }

  string() {
    if (typeof this.value === "string") {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vString = null;
    return this;
  }

  boolean() {
    if (
      (typeof this.value === "string" && this.value.toLowerCase() === "false") ||
      (typeof this.value === "string" && this.value.toLowerCase() === "true") ||
      this.value === "1" ||
      this.value === "0" ||
      this.value === 1 ||
      this.value === 0
    ) {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vBoolean = null;
    return this;
  }

  range(min, max) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length >= min && this.value.length <= max) {
        return this;
      }
    }
    const value = parseInt(this.value);
    if (!isNaN(value)) {
      if (value >= min && value <= max) {
        return this;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vRange = `${min}-${max}`;
    return this;
  }

  length(number) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length == number) {
        return this;
      }
    }
    if (typeof this.value === "number") {
      if (this.value == number) {
        return this;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vLength = number;
    return this;
  }

  greaterThan(number) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length > number) {
        return this;
      }
    }
    if (typeof this.value === "number") {
      if (this.value > number) {
        return this;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vGreaterThan = number;
    return this;
  }

  lessThan(number) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length < number) {
        return this;
      }
    }
    if (typeof this.value === "number") {
      if (this.value < number) {
        return this;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].vLessThan = number;
    return this;
  }

}


export default Validator;