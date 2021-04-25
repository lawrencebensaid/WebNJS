WebNJS<sup>(BETA)</sup> is here!
The NodeJS MVC framework for creating APIs, Web platforms, App services, fullstack solutions, and many more!
No more structuring your Node projects over and over again.

# Getting started

~~A step by step guide how to get a development environment up and running.~~

~~Alternatively, you can [watch the YouTube tutorial](https://www.youtube.com/watch?v=c7-wttwkv7I).~~

~~Development progress of this project can be tracked in our [Trello Board](https://trello.com/b/EPJJJbYH/avalanche).~~

## Prerequisites
 
Install [NodeJS](https://nodejs.org/en/) from their [website](https://nodejs.org/en/)


## Installation

**1. Install WebNJS globally.**
This allows the CLI to work with a global perspective.
It also prevents issues while updating WebNJS in the future.

(*NOTE: You might need to use `sudo`*)
```
$ npm install avacore -g
```

**2. Initialize WebNJS.**
This sets up your WebNJS project.
```
$ avalanche init
```

**3. Run your local webserver.**
```
$ avalanche run
```
Done! For more info, browse the [WebNJS wiki on GitHub](https://github.com/Software-Essentials/WebNJS/wiki).


## Troubleshooting

### Port in use

The default port is 80. Often times that port is in use and that causes problems.
To resolve this issue you can do two things; you can shutdown the application that is currently using that port on your machines and then retry. Alternatively, you can change the port in the environment file. This file can be found in "*app/environments/*". By default this file is called "*development.environment.json*".


![Screenshot](readme.assets/se_logo.png)

*The WebNJS framework is an open-source project by Software Essentials*