var browserify = require('browserify');
var b = browserify();
b.add('./config/config.js');
b.add('./config/sensors.js');
b.add('./config/url.js');
b.add('./daemons/*.js');
b.add('./managers/*.js');
b.add('./models/*.js');
b.add('./services/*.js');
b.add('./utils/*.js');
b.add('adsdk.js');
b.require('request');
b.require('q');
b.require('async');
b.require('async-waterfall');
b.require('lodash');
b.bundle().pipe(process.stdout);