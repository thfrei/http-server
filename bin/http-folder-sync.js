#!/usr/bin/env node

'use strict';

var colors   = require('colors/safe'),
  os         = require('os'),
  httpServer = require('../lib/http-server'),
  portfinder = require('portfinder'),
  opener     = require('opener'),
  argv       = require('optimist')
    .boolean('cors')
    .argv;


var ifaces = os.networkInterfaces();

if (argv.h || argv.help) {
  console.log([
    'usage: http-folder-sync [path]',
    '',
    'options:',
    '  -p --port    Port to use [8080]',
    '  -h --help    Print this list and exit.'
  ].join('\n'));
  process.exit();
}

var port = argv.p || parseInt(process.env.PORT, 10),
  host = argv.a || '0.0.0.0',
  ssl = !!argv.S || !!argv.ssl,
  proxy = argv.P || argv.proxy,
  utc = argv.U || argv.utc,
  logger;
