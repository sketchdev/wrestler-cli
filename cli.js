#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const util = require('util');
const figlet = util.promisify(require('figlet'));
const pkg = require('./package.json');
const program = require('commander');

let config;

program.version(pkg.version, '-v, --version');
program.option('-c, --config <file>', 'Path to a configuration file');
program.option('-e, --eject', 'Eject the server code');
program.description('Runs an Express+Wrestler instance using the configuration file provided.');
program.parse(process.argv);

if (program.config) {
  if (fs.existsSync(program.config)) {
    config = require(path.resolve(program.config));
  } else {
    console.log(`\nFile [${program.config}] does not exist.`);
    program.help();
  }
}

if (program.eject) {
  const requires = 'const path = require(\'path\');';
  const startCode = start.toString();
  const startOptions = program.config ? `require(path.resolve('${program.config}'))` : '{}';
  const runCode = `start(${startOptions});`;
  console.log(`${requires}\n\n${startCode}\n\n${runCode}`);
} else {
  (async () => {
    try {
      console.log(await figlet('Wrestler'));
      await start(config);
    } catch (err) {
      console.log(err);
    }
  })();
}


function start(options) {
  const express = require('express');
  const logger = require('morgan');
  const helmet = require('helmet');
  const cors = require('cors');
  const Wrestler = require('wrestler');

  const PORT = process.env.PORT || 3077;
  const wrestler = new Wrestler();

  wrestler.setup(options).then(() => {
    const app = express();
    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(logger(process.env.LOG_FORMAT || 'dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());
    app.use(wrestler.middleware());
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
      console.log('Press ctrl+c to exit');
    });
  }).catch(err => {
    console.log(err);
  });
}

