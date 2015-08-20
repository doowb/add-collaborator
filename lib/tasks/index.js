'use strict';

var inquirer = require('inquirer');
var QuestionCache = require('question-cache');
var questions = new QuestionCache({inquirer: inquirer});
var githubAuth = require('ask-for-github-auth');
var ask = require('ask-once')(questions, 'add-collaborator');
var forOwn = require('for-own');
var composer = require('composer');

questions.set('user', 'Who\'s the owner of the repositories?');
questions.set('collaborator', 'Who\'s the collaborator being added?');

// variables to be used inside tasks passed by commandline
var collaborator = null;
var reask = false;
var creds = null;
var user = null;

composer.task('getAuth', function (done) {
  githubAuth({force: reask, store: 'add-collaborator'}, function (err, res) {
    if (err) return done(err);
    creds = res;
    done();
  });
});

composer.task('getUser', function (done) {
  ask('user', {force: reask}, function (err, res) {
    if (err) return done(err);
    user = res;
    done();
  });
});

composer.task('getCollaborator', function (done) {
  ask('collaborator', {force: reask}, function (err, res) {
    if (err) return done(err);
    collaborator = res;
    done();
  });
});

composer.task('repos', function (done) {
  if (creds == null) return done(new Error('Invalid github credentials.'));
  var repos = require('./repos');
  repos(creds, user, done);
});

composer.task('sync', function (done) {
  if (creds == null) return done(new Error('Invalid github credentials.'));
  var sync = require('./sync');
  sync(creds, user, collaborator, done);
});

function finished (err) {
  if (err) return console.error(err);
  console.log('finished');
}

var tasks = [];

module.exports = {
  alias: {
    repos: 'r',
    user: 'u',
    token: 't',
    collaborator: 'c',
    sync: 's',
    force: 'f',
  },
  run: function (cli) {
    if (tasks.length > 0) {
      if (collaborator == null) {
        tasks.unshift('getCollaborator');
      }
      if (user == null) {
        tasks.unshift('getUser');
      }
      if (creds == null) {
        tasks.unshift('getAuth');
      }
      composer.run(tasks, finished);
    }
  },
  listen: function (cli) {
    // listen for any tasks by name
    forOwn(composer.tasks, function (task, name) {
      cli.on(name, function () {
        tasks.push(name);
      });
    });

    // listen for additional flags
    cli.on('user', function (username) {
      if (typeof username !== 'string') {
        throw new Error('Invalid user argument.');
      }
      user = username;
    });

    cli.on('token', function (token) {
      if (typeof token !== 'string') {
        throw new Error('Invalid token argument.');
      }
      creds = {
        type: 'oauth',
        token: token
      };
    });

    cli.on('collaborator', function (collab) {
      if (typeof collab !== 'string') {
        throw new Error('Invalid collaborator argument.');
      }
      collaborator = collab;
    });

    cli.on('force', function (force) {
      if (typeof force !== 'boolean') {
        throw new Error('Invalid force argument.');
      }
      reask = force;
    });
  }
};
