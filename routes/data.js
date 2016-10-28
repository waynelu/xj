var request = require('request');
var config = require('../config/config.js')
var Validator = require('jsonschema').Validator;
var _ = require('underscore');
var exec = require('child_process').exec;


var data = {

  forecast: function(req, res) {
    console.log(req.query);
    var command = config.spark.command;
    command += ' ' + req.query.tag;
    exec(command, function(error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        
        if (stdout) {
          try {
            res.json(JSON.parse(stdout));
          } catch (ex) {
            res.json(null);
          }
        } else {
          res.json(null);
        }
    });
  }
};

module.exports = data;
