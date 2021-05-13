# Changelog
All notable changes to this project will be documented in this file.

View detailed changes in our [Trello board](https://trello.com/b/EPJJJbYH/avalanche).

## [Unreleased]

## [0.10.0] - 2021-05-13
### Added
- Added migrations

### Changes
- Fixes and improvements

## [0.9.3] - 2021-05-08
### Added
- Added way to load models right from WebNJS by importing 'webnjs/models'
- Added global project context variable `project` to runtime
- Added model class notation
- Added `$ webnjs serve` command

### Changes
- Fixes and improvements

## [0.8.10] - 2021-05-08
### Changes
- Mainly fixes and improvements

## [0.8.5] - 2021-05-03
### Added
- Added support for sessions

### Fixed
- Small fixes.

## [0.8.0] - 2021-05-03
### Added
- Added `$ model-add` command
- Added 

### Changes
- Small optimisations

### Fixed
- Small fixes.

## [0.7.5] - 2021-05-01
### Added
- Added `$ export` command
- Added `$ doctor` command
- Standardised notations using regex

### Fixed
- Fixed invalid imports.

## [0.7.2] - 2021-04-30
### Added
- Added `$ route-add` command
- Added `$ controller-add` command

## [0.7.0] - 2021-04-19
### Changes
- Major overhaul

## [0.5.67] - 2020-07-08
### Added
- Added inter-database model relations. You can set them up in an `AFModel`s property using the keys `database` & `table`. If a key is not inferrable you can use `bind` to explicitly specify it.

### Fixed
- Fixed the `delete` method in `AFModel`.

### Changes
- `updatedAt` and `updatedBy` have been deprecated and been replaced by `modifiedAt` and `modifiedBy`.

## [0.5.65] - 2020-07-04
### Fixed
- Fixed email configuration validation.
- Fixed `AFModel` conditions arguments parser when working with array values.

## [0.5.63] - 2020-06-28
### Added
- Added argument aliasses to `$ make ` command.

### Changes
- Deprecated `/migration/seeds/` as a population folder.

## [0.5.61] - 2020-06-03
### Added
- Added common options to `AFPushNotification`.

### Changes
- Optimised UUID compression.
- Optimised `AFPushNotification` delivery reporting.

## [0.5.58] - 2020-04-29
### Added
- Added `await` to model functions.
- Added `ordering`, `offset`, `page` and `limit` setting to `AFModel.select`.
- Added operator functions to items in the `conditions` setting in `AFModel.select`. This method can be used by making `conditions` an Object.

## [0.5.57] - 2020-04-18
### Added
- Added ability to change `database.charset` in your environment files.

### Changes
- default `database.charset` has been changed from `utf8` to `utf8mb4`.

## [0.5.56] - 2020-05-03
### Added
- Added command &nbsp;&nbsp;`$ avalanche make documentation`&nbsp;&nbsp; for generating documentation

### Fixed
- Fixed routes calculator in &nbsp;&nbsp;`$ avalanche info`&nbsp;&nbsp; command.

## [0.5.55] - 2020-04-03
### Added
- Added request log ignore filter. Available in the environment file as 'logIgnores';
- Added domains property to routing files;
- Added support for enums;
- Added modelName decoder to AFUtil;

### Fixed
- Fixed user agent specifier functions in AFUtil.
- Fixed request logging. (Status & coloring)

### Changes
- Many small structural optimisations.

## [0.5.48] - 2020-03-21
### Added
- Added `--notty` & `--tty=false` command-flags. Causes avalanche to skip user interaction with the terminal. Also disables terminal animations.
- Added &nbsp;&nbsp;`$ avalanche configure`&nbsp;&nbsp; command to configure environment files.
- Added guidelines for how to structure your code in an WebNJS application.
- Added option in 'AFModel.select'. It is now possible to pass an array as condition value.
- Added new short endpoint notation for routerfile.

### Changes
- Updated Dockerfile.
- Renamed ACSeeder to ACPopulator.
- Many small structural optimisations.

## [0.5.31] - 2020-01-23
### Added
- Added 'code', 'description' & 'deletedAt' as default properties to model template.

### Fixed
- Fixed bug in structure loaded.

## [0.5.30] - 2020-01-22
### Added
- Added ability to add middleware to the scope of a routes file instead of in the scope of an individual endpoint.

### Changes
- Changed the way AFLocalisation works.
- Made it so that unix-based platforms automatically close the current running port before trying to start the application to prevent disruptions.
- Minor optimisations.

## [0.5.27] - 2020-01-21
### Added
- Added structure loader & helper loader.

### Changes
- Minor optimisations.

## [0.5.26] - 2020-01-20
### Added
- Added easyer type rules to AFValidator; 'string()', 'boolean()' & 'number()' (instead of for example: 'type("string")'.
- Added &nbsp;&nbsp;`$ avalanche stopall`&nbsp;&nbsp; command; Stops all WebNJS applications that are currently running.
- When working with models the 'createdAt' & 'updatedAt' properties will now automatically be filled accordingly.
- When working with models the 'unique' setting of a property can be set to a string value. All the properties with that string will be grouped as unique.

### Fixed
- Many bugfixes.

## [0.5.24] - 2020-01-19
### Added
- Added support for decimal datatypes like 'float', 'decimal' and 'double'.
- Added AFUtil function 'parseBoolean'.

### Changes
- Standardized terminal animations.

### Fixed
- Many bugfixes.

## [0.5.21] - 2020-01-18
### Added
- Client-side webpage reload debug option.

### Fixed
- Fixed message when using &nbsp;&nbsp;`$ avalanche upgrade`&nbsp;&nbsp; command.
- Fixed process killer.
- Fixed loading animation.

### Changes
- Minor optimisations.

## [0.5.19] - 2020-01-16
### Added
- Added &nbsp;&nbsp;`$ avalanche localise`&nbsp;&nbsp; command to the WebNJS CLI.
- Added 'alias', 'notEmpty', 'not' & 'equals' functions to AVAValidator.

### Fixed
- Fixed bugs in existing templates.
- Fixed ACSocketKernel.

## [0.5.17] - 2019-12-22
### Added
- Added static functions 'select', 'delete' and 'get' to AFModel.
- Added global localisation.

### Changes
- Changed the term 'seed' to 'populate'
- Optimised terminal output.

## [0.5.12] - 2019-12-21
### Added
- Added troubleshooters to `run` command.
- Added ID method option to `make model` command.
- Added BOOL & BOOLEAN datatypes to AFModel.

### Changes
- Changed syntax for linking models to eachother.
- Updated model explenation comments.
- Optimised querybuilder.

## [0.5.7] - 2019-12-17
### Added
- Added Apple app association file.

### Fixed
- Fixed a bug where it was not possible to have 2 relations of the same table.

## [0.5.0] - 2019-11-17
### Added
- Added AFPushNotification class for iOS remote notifications.
- Implemented ES6 Module loader.

### Changes
- Separated AVAFoundation, AVACore & AVACLI namespaces.
- Updated package namespaces (AVAFoundation & AVACore).
- Standardized AFUtil & ACUtil.

## [0.4.31] - 2019-11-16
### Added
- Added ACUtil to AVAFoundation.
- Added foreign key constraints (relations) to Migrator.
- Added constraint checks option to AFDatabase.

### Fixed
- Fixed Seeder 'wipe' option.

## [0.4.27] - 2019-08-24
### Added
- Added 'gitignore' installable package.
- Added 'gitlab-ci' installable package.
- Added 'docker' installable package.
- Added ability to have no primaryKey in Migrator.

### Changes
- Optimised AFModel.

## [0.4.25] - 2019-08-12
### Added
- Added error handling to template builder.
- Added error handling when writing to request.log.
- Added secret generator to environment on 'make' command.
- Added ability to set a default value in a model.
- Added this CHANGELOG.md to the source code.

### Changes
- Removed NULL values from insert query on AFModel.save() fuction.
- Changed the progress animation on the 'update' command.
- Minor improvements.

### Fixed
- Fixed result message on the 'update' command.

### Removed
- Removed date from request console logs.

## [0.4.21] - 2019-08-11
### Changes
- Replaced all ugly tables printed by console.
- Minor improvements.

## [0.4.17] - 2019-08-09
### Added
- Added validator to non-middleware endpoints.
- Added YouTube tutorial video link to readme.md.

### Changes
- Many optimisations in AFModel class.

## [0.4.11] - 2019-08-08
### Added
- Added Knex query builder.

### Changes
- Minor optimisations.

### Fixed
- Fixed many fatal bugs.

## [0.4.7] - 2019-08-07
### Added
- Added AFValidator class. The validator is contained in every request object.
- Added ability to choose storage type in 'make' command when making a model.
- Added environment resource to 'make' command.
- Added seeds resource to 'make' command.
- Added routes resource to 'make' command.
- Added middleware resource to 'make' command.
- Added error handling for invalid routes.
- Added 'update' command. This command updates the WebNJS CLI to the latest version.
- Added 'upgrade' command. This command upgrades your project to the latest version.

## Changed
- Updated model template.
- Deprecated view resource option in 'make' command.
- Optimised 'fix' command.

## [0.3.25] - 2019-07-24
### Added
- Added ability to render file directly from routing without a controller as middle-man.

## [0.3.24] - 2019-07-23
### Added
- Dependency installer.

## Changes
- npm now gets installed by the 'init' command. So now you don't need to have an npm project before installing WebNJS, but you can if you want to.
- Changed the way middleware works. 
- New viewcontroller standard (Viewcontroller will be deprecated in the future).
- Minor improvements

## Fixed
- Fixed 'run' command on Windows.
- Fixed fatal bug regarding the run path.

## Removed
- Removed third-party modules from AVAFoundation. Dependencies are now installed seperately.

## [0.3.7] - 2019-07-17
### Added
- Added 'help' command.
- Added 'make' command.

### Changes
- Commands are now dynamic and stored in the commands folder.

## [0.3.1] - 2019-07-16
### Added
- Added CSRF security tokens.
- Added model registerer.
- Added migrator.
- Added seeder.
- Added builderplate resources. Now boilerplates can be defined as installs.
- Standardised terminal prefix.

### Changed
- Moved all AVACore utilities to the ACUtil class.
- Major improvements on AFModel.
- Minor improvements.

## [0.2.24] - 2019-07-14
### Added
- Added filewatcher.
- Added server restarter (triggered by filewatcher).

### Changed
- Minor improvements.

## [0.2.13] - 2019-07-13
### Added
- Added AFStorage class to utilize filestorage.
- Added AFDatabase class to utilize a database.
- Added ASCII art when installation was complete.
- Added more utilities.

### Changed
- Optimised boilerplates.
- Minor improvements.

## [0.2.3] - 2019-07-11
### Changed
- Renamed all AVAFoundation classes by adding 'AVA' prefix to all class names.
- Minor improvements.

## [0.1.24] - 2019-08-10
### Added
- Added third-party packages.
- Added webserver permissions error handling.
- Added webserver 'port in use' error handling.
- Added 404 status page to boilerplate.

## [0.1.17] - 2019-08-10
### Added
- Added Readme file.
- GitHub Wiki.

### Changed
- Minor improvements.

### Removed
- Obsolite packages. Project has been pruned.

## [0.1.6] - 2019-08-10
### Added
- Added ability to have different environments that can be loaded at runtime.

## [0.1.1] - 2019-08-10
### Added
- AVAFoundation (Class library).

## [0.1.0] - 2019-08-07
### Added
- AVACore (Core framework).
- WebNJS CLI.
- Project structure.
- Added installable boilerplates.
- Added request logger.
- Added &nbsp;&nbsp;`$ avalanche version`&nbsp;&nbsp; command.
- Added &nbsp;&nbsp;`$ avalanche info`&nbsp;&nbsp; command.
- Added &nbsp;&nbsp;`$ avalanche init`&nbsp;&nbsp; command.
- Added &nbsp;&nbsp;`$ avalanche run`&nbsp;&nbsp; command.
- Added &nbsp;&nbsp;`$ avalanche routes`&nbsp;&nbsp; command.
- Added &nbsp;&nbsp;`$ avalanche fix`&nbsp;&nbsp; command.