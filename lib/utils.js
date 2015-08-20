'use strict';

var utils = module.exports = {};

utils.normalizeCreds = function (creds) {
  var res = {};
  if (creds.type === 'basic') {
    res.USERNAME = creds.username;
    res.PASSWORD = creds.password;
  } else {
    res.TOKEN = creds.token;
  }
  return res;
};
