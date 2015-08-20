#!/usr/bin/env node

var minimist = require('minimist');
var cli = require('minimist-plugins')(minimist)
  .use(require('minimist-expand'))
  .use(require('minimist-events')());

var tasks = require('../lib/tasks');

// listen to cli events for registered tasks
tasks.listen(cli);

// parse the command line arguments
cli.parse(process.argv.slice(2), {alias: tasks.alias}, function (err, argv) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  // run any tasks that have been specified
  tasks.run();
});

