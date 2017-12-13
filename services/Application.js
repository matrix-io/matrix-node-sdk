var RequestHandler = require('../utils/RequestHandler');
var Socket = require('../utils/Socket');
var Device = require('./Device')

var request = require('request');
var fs = require('fs');
var async = require('async');

/* handles application REST requests */
module.exports = {
  start: startApp,
  stop: stopApp,
  restart: restartApp,
  install: installApp,
  uninstall: uninstallApp,
  deploy: deployApp,
  list: listApps,
  lookup: lookupAppInfo,
  configure: configureApp,
  getLog: getLog,
  trigger: trigger,
  search: search,
  assign: assignAppToDevice
}

// SEND ALL THESE SOCKET CALLS to an interface
var sendDeviceCommand = Socket.sendDeviceCommand;

function search(name, cb) {
  RequestHandler.get(
    admatrix.config.url.app.search + '/' + name + '?access_token=' + admatrix.state.user.token
  ).then(function(resp){
    cb(null, resp)
  }).fail(cb);
}

// we need to know the url and version for the app
function lookupAppInfo(name, cb) {
  // TODO: Add app lookup here, assume latest version #110867812
  // get /v1/app/:app_name
  RequestHandler.get(admatrix.config.url.app.search + '/' + name + '?access_token=' + admatrix.state.user.token)
    .then(function (resp) { cb(null, resp) }).fail(function(err) {console.error(err)});
}


function getLog(options, cb) {
  debug('App Cmd'.green, options);
  sendDeviceCommand('app-log', options, cb, {
    keepOpen: true
  });
}

// TODO: Remove,  Depreciated to docker
function configureApp(options, cb) {
  if (!_.has(options, 'name') || !_.has(options, 'key') || !_.has(options, 'value')) {
    cb('App Config Requires Name, Key and Value'.red);
  }

  sendDeviceCommand('app-config-update', options, function(err, resp){
    cb(err, resp, true)
  });

  var configObj = { configuration: {}};
  configObj.configuration[options.key] = options.value;

  // manage api records
  RequestHandler.put(admatrix.config.url.app.config + '/' + options.name, configObj).then(function(resp){
    cb(null, resp, false)
  }).fail(cb);
}


function startApp(appName, deviceId, cb) {
  sendDeviceCommand('app-start', {
    name: appName
  }, cb);
}

function restartApp(appName, cb) {
  sendDeviceCommand('app-restart', {
    name: appName
  }, cb);
}

function trigger(deviceId, data, cb) {
  sendDeviceCommand('trigger', {
    data: data
  }, cb);
}

function stopApp(appName, deviceId, cb) {
  sendDeviceCommand('app-stop', {
    name: appName
  }, cb);
}

function createApp(options, cb){
  var form = {
    current_version : options.version || '0.0.0',
    description: options.description,
    name: options.name,
    private: options.private || true
  };
  RequestHandler.post( admatrix.config.url.app.create, form ).then(function (resp) {
    cb(null, resp);
  });
}

//TODO: Remove, in docker now
function assignAppToDevice( appName, cb ) {
  RequestHandler.put( admatrix.config.url.app.assign + '/' + appName + '/' + admatrix.config.device.token + '?access_token=' + admatrix.config.user.token )
    .then( function ( resp ) {
      cb( null, resp );
    }).fail( cb );
}


// TODO: deviceId not needed, remove
function installApp(appInfo, deviceId, cb) {
  debug('install App', appInfo)
    // cli will send string

  function _installEvent(appInfo, cb) {
    debug('appInstall', appInfo)
    sendDeviceCommand('app-install', appInfo, function(err, resp){
      if (_.isFunction(cb))
      cb(err, resp, true)
    });

    // manage api records
    RequestHandler.post(admatrix.config.url.app.install, {
        name: appInfo.name,
        token: admatrix.deviceToken
    }).then(function(resp){
      debug('Install(API)>', resp);
      cb(null, resp, false)
    });
  }

  //no url available, just name
  if (_.isString(appInfo)) {
    lookupAppInfo(appInfo, function(err, app) {
      if (err) return console.error(err);

      // assume first match
      try {
        var appData = JSON.parse(app);
        appData = appData.results[0];
      } catch (e) {
        return cb('JSON Parse Error', app);
      }

      debug('install app info', appData);

      if (_.isUndefined(appData)) {
        return cb('No application', appInfo, 'found');
      }

      debug(appInfo, 'lookup', appData);

      // remux variables for SS
      appInfo = {
        name: appData.name,
        version: appData.currVers,
        url: appData.currDeployUrl
      }

      if (!_.has(appInfo, 'name') || !_.has(appInfo, 'version') || !_.has(appInfo, 'url')) {
        return cb('App Installation Requires Name, Url and Version'.red + appInfo);
      }

      _installEvent(appInfo, cb);

    })

  } else {

    _installEvent(appInfo, cb);

  }
}


function uninstallApp(appName, deviceId, cb) {
  sendDeviceCommand('app-uninstall', {
    name: appName,
    deviceId: deviceId
  }, function(err, resp){
    // diff callback for socket
    cb(err, resp, true);
  });

  // manage api records
  RequestHandler.post(admatrix.config.url.app.install, {
      name: appName,
      token: admatrix.deviceToken
  }, cb);
}


function deployApp(config, cb) {
  debug('Deploy:', config);
  var file = config.file;
  var name = config.name;
  var configObject = config.appConfig;

  // upload zip to S3
  var r = request({
    method: 'POST',
    url: admatrix.config.url.app.deploy
  }).on('response', function(resp, body) {
    if (resp.statusCode === 200) {
      debug(body);
      cb(null, resp);

    } else {
      if (resp.statusCode === 401) {
        console.log('Unauthorized for user and/or device. Please matrix login and matrix use again.')
      }
      cb([resp.statusCode, resp.statusMessage.grey].join(' '));
    }
  });

  try {
    var configData = JSON.stringify(configObject);
  } catch (e) {
    console.error('Application:', name, 'has invalid configuration file.')
  }

  var upload = fs.createReadStream(file);

  // setup multipart for upload
  console.log('Deploying... '.green, file)
  var form = r.form();
  form.append('app_name', name);
  form.append('access_token', admatrix.state.user.token);
  form.append('config', configData);
  form.append('app_file', upload);
  debug(form);
}

function listApps(cb) {
  RequestHandler.get(admatrix.config.url.app.list + '?access_token=' + admatrix.state.user.token)
  .then(function(body) {
    cb(body);
  })
}
