var request = require('request');
var config = require('../config/config.js')
var Validator = require('jsonschema').Validator;
var elasticsearch = require('elasticsearch');
var _ = require('underscore');

var client = new elasticsearch.Client({
  host: config.es.host,
  log: config.es.logLevel
});

var createAbSchema = {
	type: 'object',
	properties: {
		name: {
			type: 'string',
			required: true
		}
	}
};

var deleteAbSchema = {
	type: 'object',
	properties: {
		abId: {
			type: 'string',
			pattern: "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$",
			required: true
		}
	}
};

var events = {

  getEventsByDeviceId: function(req, res) {
    client.search({
      index: config.es.index,
      type: config.es.type,
      body: {
        query: {
          match: {
            DEVICE: req.body['device_id']
          }
        },
        sort: [
          {
            "SERDATE" : {
              "order" : "asc"
            }
          }
        ]
      }
    }).then(function (resp) {
        var hits = resp.hits.hits;
        res.json({ 'events' : hits });
    }, function (err) {
        console.trace(err.message);
    });

  },
  
  getAlarmStatsByDeviceId: function(req, res) {
    var body = {
        from: 0, 
        size: 10000,
        "query": {
          "bool": {
            "must": [
              {
                "range" : {
                  "SERDATE": {
                    "gte": req.body['from'],
                    "lte": req.body['to'],
                    "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd"
                  }
                }
              }
            ]
          }
        },
        "sort" : [
            {"SERDATE" : {"order" : "asc"}}
         ]
    };
    if (req.body['device_id']) {
      body.query.bool.must.push({
        "match": {
          "NOTE1": req.body['device_id']
        }
      });
    }


    client.search({
      index: config.es.index,
      type: config.es.type,
      body: body
    }).then(function (resp) {
        var hits = resp.hits.hits;
        
        var stats = [];
        hits.forEach(function(event){
          var serDate = new Date(event._source.SERDATE);
          var deviceId = event._source.DEVICE;
          var event = event._source.EVENT;
          console.log(deviceId + ' : ' + event);
          if (!event) return;
          
          var device = _.find(stats, function(device) {
            return device.deviceId == deviceId;
          });
          if (!device) {
            device = {'deviceId': deviceId};
            stats.push(device);
          }
          
          if (event.indexOf("On") > 0) {
            var eventArr = event.split("On");
            var alarmId = eventArr[0].trim();
            
            if (!device.alarms) device.alarms = [];
            var alarm = _.find(device.alarms, function(alarm) {
              return alarm.alarmId === alarmId;
            });
            if (alarm) {
              if (alarm.on) {
                alarm.on.lastAnchor = serDate;
              } else {
                alarm.on = {
                  onOffCount: 0,
                  onOffMaxDuration: 0,
                  onOffTotalDuration: 0,
                  lastAnchor: serDate,
                }
              }
              if (alarm.off) {
                alarm.off.offOnCount++;
                var offOnDuration = serDate - alarm.off.lastAnchor;
                if (offOnDuration > alarm.off.offOnMaxDuration) alarm.off.offOnMaxDuration = offOnDuration;
                alarm.off.offOnTotalDuration += offOnDuration;
              }
            } else {
              var alarm = {};
              alarm['alarmId'] = alarmId;
              alarm['on'] = {
                  onOffCount: 0,
                  onOffMaxDuration: 0,
                  onOffTotalDuration: 0,
                  lastAnchor: serDate,
              }
              device.alarms.push(alarm);
            }
          } else if (event.indexOf("Off") > 0) {
            var eventArr = event.split("Off");
            var alarmId = eventArr[0].trim();
            
            if (!device.alarms) device.alarms = [];

            var alarm = _.find(device.alarms, function(alarm) {
              return alarm.alarmId === alarmId;
            });
            if (alarm) {
              if (alarm.off) {
                alarm.off.lastAnchor = serDate;
              } else {
                alarm.off = {
                  offOnCount: 0,
                  offOnMaxDuration: 0,
                  offOnTotalDuration: 0,
                  lastAnchor: serDate,
                }
              }
              if (alarm.on) {
                alarm.on.onOffCount++;
                var onOffDuration = serDate - alarm.on.lastAnchor;
                if (onOffDuration > alarm.on.onOffMaxDuration) alarm.on.onOffMaxDuration = onOffDuration;
                alarm.on.onOffTotalDuration += onOffDuration;
              }
            } else {
              var alarm = {};
              alarm['alarmId'] = alarmId;
              alarm['off'] = {
                  offOnCount: 0,
                  offOnMaxDuration: 0,
                  offOnTotalDuration: 0,
                  lastAnchor: serDate,
              }
              device.alarms.push(alarm);
            }
          }
        });
        res.json(stats);
    }, function (err) {
        console.trace(err.message);
    });

  }  
};


module.exports = events;
