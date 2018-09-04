#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const pkg = require('./package.json');
const program = require('commander');

let configFile, config;

program.version(pkg.version, '-v, --version');
program.usage('[config]');
program.arguments('config');
program.description('Runs an Express+Wrestler instance using the configuration file provided.');
program.action(config => configFile = config);
program.parse(process.argv);

if (configFile && fs.existsSync(configFile)) {
  config = require(configFile);
}

const express = require('express');
const logger = require('morgan');
const wrestler = require('../wrestler');

const PORT = process.env.PORT || 3000;

const app = express();
app.set('trust proxy', 1); // trust first proxy
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(wrestler(config));
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
