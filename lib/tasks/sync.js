'use strict';

var lazy = require('lazy-cache')(require);
var utils = require('../utils');
lazy('fs');
lazy('async');
lazy('github-base', 'github');

function syncCollaborators (creds, user, collaborator, done) {
  var github = new lazy.github(utils.normalizeCreds(creds));

  var repos = [];
  lazy.fs.readFile(__dirname + '/tmp/repos.json', 'utf8', function (err, content) {
    if (err) return done(err);
    try {
      repos = JSON.parse(content);
    } catch (err) {
      return done(err);
    }
    lazy.async.each(repos, function (repo, next) {
      var name = repo.name;
      var collaborators = repo.collaborators.map(function (col) { return col.login; });
      if (collaborators.indexOf(collaborator) > -1) return next();
      console.log('Adding', collaborator, 'to', name + '.');
      github.put('/repos/:owner/:repo/collaborators/:user', {owner: user, user: collaborator, repo: name}, function (err) {
        if (err) return next(err);
        console.log('User', collaborator, 'added to', name + '.');
        next();
      });
    }, done);
  });
}

module.exports = syncCollaborators;
