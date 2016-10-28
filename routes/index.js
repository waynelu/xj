var express = require('express');
var router = express.Router();

var events = require('./events.js');
var data = require('./data.js');

/*
 * Routes that can be accessed by any one
 */
//router.post('/login', auth.login);

/*
 * Routes that can be accessed only by autheticated users
 */
//router.get('/api/events', events.getAll);
router.post('/api/events', events.getEventsByDeviceId);
router.post('/api/events/alarms', events.getAlarmStatsByDeviceId);

router.post('/api/data/forecast', data.forecast);

module.exports = router;
