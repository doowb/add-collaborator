'use strict';

var lazy = require('lazy-cache')(require);
var utils = require('../utils');
lazy('write');
lazy('async');
lazy('github-base', 'github');


function getRepos (creds, user, done) {
  var github = new lazy.github(utils.normalizeCreds(creds));

  github.getAll('/users/' + user + '/repos?type=owner&per_page=1000', function (err, repos) {
    if (err) return done(err);
    console.log('found repos:', repos && repos.length);
    lazy.async.eachSeries(repos, function (repo, next) {
      console.log('getting collaborators for', repo.full_name);
      repo.collaborators = repo.collaborators || [];
      repo.collaborators = Array.isArray(repo.collaborators) ? repo.collaborators : [repo.collaborators];

      github.getAll('/repos/' + repo.full_name + '/collaborators?per_page=1000', function (err, collabs) {
        if (err) return next(err);
        if (collabs && Array.isArray(collabs)) {
          repo.collaborators = repo.collaborators.concat(collabs);
        }
        next();
      });
    }, function (err) {
      if (err) return done(err);
      console.log(repos.length, 'repos loaded');
      lazy.write(__dirname + '/tmp/repos.json', JSON.stringify(repos, null, 2), done);
    });
  });
}

module.exports = getRepos;
