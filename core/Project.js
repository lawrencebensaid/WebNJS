import fs from "fs"

const Project = (() => {

  var _name = null;
  var _title = null;
  var _version = null;
  var _description = null;
  var _authorName = null;
  var _authorEmail = null;
  var _scripts = null;
  var _projectDir = null;

  /**
   * 
   */
  function constructor(name, title, version, description, authorName, authorEmail, scripts, projectDir) {
    _name = name;
    _title = title;
    _version = version;
    _description = description;
    _authorName = authorName;
    _authorEmail = authorEmail;
    _scripts = scripts;
    _projectDir = projectDir;


    /**
     * @returns {string} title.
     */
    function getTitle() {
      return _title || _name;
    }
    this.getTitle = getTitle;


    /**
     * @returns {string} version.
     */
    function getVersion() {
      return _version;
    }
    this.getVersion = getVersion;


    /**
     * @returns {string} description.
     */
    function getDescription() {
      return _description;
    }
    this.getDescription = getDescription;


    /**
     * @returns {string} author name.
     */
    function getAuthorName() {
      return _authorName;
    }
    this.getAuthorName = getAuthorName;


    /**
     * @returns {string} author email.
     */
    function getAuthorEmail() {
      return _authorEmail;
    }
    this.getAuthorEmail = getAuthorEmail;


    /**
     * @returns {string} author email.
     */
    function getScripts() {
      return _scripts;
    }
    this.getScripts = getScripts;


    /**
     */
    function setScript(script, command) {
      const filepath = "./package.json";
      if (fs.existsSync(filepath)) {
        const config = JSON.parse(fs.readFileSync(filepath, "utf8"));
        config.scripts[script] = command;
        fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
      }
    }
    this.setScript = setScript;


    /**
     * @returns {string} path to project directory.
     */
    function getDir() {
      return _projectDir;
    }
    this.getDir = getDir;


    /**
     * @param {boolean} absolute returns the absolute path. `false` by default.
     * @returns {string} path to app directory.
     */
    function getAppDir(absolute = false) {
      const dir = "app";
      return absolute ? `${this.getDir()}/${dir}` : dir;
    }
    this.getAppDir = getAppDir;


    /**
     * @param {boolean} absolute returns the absolute path. `false` by default.
     * @returns {string} path to app directory.
     */
    function getModelsDir(absolute = false) {
      const dir = "models";
      return `${this.getAppDir(absolute)}/${dir}`;
    }
    this.getModelsDir = getModelsDir;


    /**
     * @param {boolean} absolute returns the absolute path. `false` by default.
     * @returns {string} path to app directory.
     */
    function getRoutesDir(absolute = false) {
      const dir = "routes";
      return `${this.getAppDir(absolute)}/${dir}`;
    }
    this.getRoutesDir = getRoutesDir;


    /**
     * @param {boolean} absolute returns the absolute path. `false` by default.
     * @returns {string} path to app directory.
     */
    function getHelpersDir(absolute = false) {
      const dir = "helpers";
      return `${this.getAppDir(absolute)}/${dir}`;
    }
    this.getHelpersDir = getHelpersDir;


    /**
     * @param {boolean} absolute returns the absolute path. `false` by default.
     * @returns {string} path to app directory.
     */
    function getMigrationsDir(absolute = false) {
      const dir = "migrations";
      return `${this.getAppDir(absolute)}/${dir}`;
    }
    this.getMigrationsDir = getMigrationsDir;


    /**
     * @param {boolean} absolute returns the absolute path. `false` by default.
     * @returns {string} path to app directory.
     */
    function getControllersDir(absolute = false) {
      const dir = "controllers";
      return `${this.getAppDir(absolute)}/${dir}`;
    }
    this.getControllersDir = getControllersDir;

  }

  return constructor;

})();

/**
 * @param {object} packageJson contents of package.json.
 * @returns {Project}
 */
Project.fromPackageJson = ({ name, title, version, description, author, scripts }) => {
  const authorObj = typeof author === "object" ? author : { name: author };
  const project = new Project(name, title, version, description, authorObj.name, authorObj.email, scripts, process.cwd());
  return project;
};

export default Project;