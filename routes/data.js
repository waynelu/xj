var request = require('request');
var config = require('../config/config.js')
var Validator = require('jsonschema').Validator;
var _ = require('underscore');
var exec = require('child_process').exec;


var data = {

  forecast: function(req, res) {
    console.log(req.query);
    var command = '/Users/wlu000/spark/spark-1.6.2-bin-hadoop2.6/bin/spark-submit --class com.r2.xj.DataForecast /Users/wlu000/spark/spark-xj/target/xj-data-forecast-0.0.1-SNAPSHOT-jar-with-dependencies.jar';
    command += ' ' + req.query.tag;
    exec(command, function(error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        
        if (stdout) {
          res.json(JSON.parse(stdout));
        } else {
          res.json({})
        }
    });
  }
};

module.exports = data;
