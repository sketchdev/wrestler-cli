#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const util = require('util');
const figlet = util.promisify(require('figlet'));
const pkg = require('./package.json');
const program = require('commander');

const PORT = process.env.PORT || 3077;
let configFile, config;

program.version(pkg.version, '-v, --version');
program.usage('[config]');
program.arguments('config');
program.description('Runs an Express+Wrestler instance using the configuration file provided.');
program.action(config => configFile = config);
program.parse(process.argv);

if (configFile && typeof configFile === 'string') {
  if (fs.existsSync(configFile)) {
    config = require(path.resolve(configFile));
  } else {
    console.log(`\nFile [${configFile}] does not exist.`);
    program.help();
  }
}

(async () => {
  try {
    console.log(await figlet('Wrestler'));
    console.log('Press ctrl+c to exit');

    const express = require('express');
    const logger = require('morgan');
    const wrestler = require('wrestler');
    const api = await wrestler.setup(config);

    const app = express();
    app.set('trust proxy', 1); // trust first proxy
    app.use(logger(process.env.LOG_FORMAT || 'dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(api);
    app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
  } catch (err) {
    console.log(err);
  }
})();

