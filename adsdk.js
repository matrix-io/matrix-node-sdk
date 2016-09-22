
// modules
var async = require('async');
var q     = require('q');
var D     = require('debug');

// globals
require('colors');
log       = console.log;
_         = require('lodash');
debug     = D('sdk');

var v = JSON.parse(require('fs').readFileSync(__dirname + '/package.json')).version;

debug( '🔓  [ MATRIX ] Auth SDK v'.yellow + v )


// Internal Modules
var RequestHandler  = require('./utils/RequestHandler');
var Register        = require('./utils/Register');
var Authenticator   = require('./utils/Authenticator');
var DoSubmit        = require('./utils/Submit');
var Socket = require('./utils/Socket')

var Application = require('./services/Application');
var Device      = require('./services/Device');

// TODO: admatrix global is ugly for an SDK, fix
admatrix = {}
admatrix.config = {};
admatrix.state = {};
admatrix.state.client = {};
admatrix.state.user = {};
admatrix.state.device = {};

var adsdk = {
  sensor: {
    install: installSensor
  },
  // setup endpoint, clientId, userId
  authenticate: authenticate,

  // make URLs available, needs apiServer
  makeUrls: makeUrls,

  // pass a token from outside
  client: {
    setToken: setClientToken
  },

  device: {
    //TODO: remove all these crappy set tokens and state vars, should be managed by parent
    getToken: getDeviceToken,
    setToken: setDeviceToken,
    setId: setDeviceId,
    list: Device.list,
    checkUpdates: checkUpdates,
    reboot: Device.reboot,
    getAppList: Device.getAppList,
    create: Device.create,
    register: Device.register,
    getSecret: Device.getSecret,
  },

  user: {
    setToken: setUserToken
  },

  // authenticate all the things
  auth: {
    client: authenticateClient,
    device: Device.authenticate,
    user: authenticateUser
  },

  setConfig: setConfig,

  // manage teh apps
  app: {
    log: Application.getLog,
    list: listApps,
    start: startApp,
    stop: stopApp,
    update: updateApp,
    restart: restartApp,
    install: installApp,
    uninstall: uninstallApp,
    deploy: deployApp,
    lookup: Application.lookup,
    configure: configureApp,
    trigger: Application.trigger,
    search: Application.search,
    assign: Application.assign
  },

  //register new things
  register: {
    device: Device.register,
    user: registerUser
  },

  refresh: refreshToken,

  // communications
  submit: DoSubmit,
  subscribe: subscribeStream,
  publish: publishStream
}

// populate user / device / etc
function setConfig(extConfig){
  _.extend(admatrix.config, extConfig);
}

function configureApp(options,cb){
  Application.configure(options,cb);
}

function refreshToken(){
  Authenticator.refreshUserToken().then(function(d){
    console.log('??',d);
  })
}

function getLog(cb){
  Application.getLog(cb);
}

function deployApp(config, cb){
  Application.deploy( config, cb );
}

function has(object, needle) {
  if (_.isArray(needle)) {
    for (var n in needle) {
      var complete = false;
      if (object.hasOwnProperty(needle[n])) {
        complete = true;
      }
      return complete;
    }
  } else {
    return object.hasOwnProperty(needle);
  }
  return false;
}

// get most recent version from server, return to Matrix
// expecting { version: 'x.x.x', url: 'http://...' }
function checkUpdates(cb){
  RequestHandler.get( admatrix.config.url.device.update, { token : {
    token: admatrix.state.device.token
  }} ).then(cb).fail(cb);
}

// add urls to global
function makeUrls(base, stream){
  admatrix.config.url = require('./config/url').populateUrls(base, stream);
}

function setClientToken(token){
  // TODO: Add error checking
  admatrix.state.client.token = token;
}

function setDeviceToken(token){
  // TODO: Add error checking
  admatrix.state.device.token = token;
}

function setDeviceId(id) {
  admatrix.state.device.id = id;
}

function setUserToken(token){
  // TODO: Add error checking
  admatrix.state.user.token = token;
}

function getDeviceToken(options, cb) {
  if ( _.isUndefined(options)){
    options = adsdk.defaultOptions;
  }

  //make finished urls available
  makeUrls( options.apiServer );

  Device.authenticate(options.deviceId, options.deviceSecret, function(err, res) {
    if (err) return cb(new Error('Device Token Retrieval Error: '+err))
    cb(null, res.results.device_token);
  })
}

function authenticate(options, cb) {

  // log("(adm) API-SDK Init=-v\n", options);
  if ( _.isUndefined(options)){
    options = adsdk.defaultOptions;
    cb = function(){};
  }

  if (has(options, ['clientId', 'clientSecret', 'apiServer']) == false) {
    // TODO: use cb
    console.error('No clientId, clientSecret, or apiServer passed to start()')
    return;
  }

  //make finished urls available
  makeUrls( options.apiServer );

  //do all the authentications
  async.series([
    function(cb) {
      authenticateClient(options, cb);
    },
    function(cb) {
      if (has(options, 'username')) {
        authenticateUser(options, cb);
      } else {
        cb();
      }
    },
    function(cb) {
      if (has(options, 'deviceName')) {
        Device.register(options.deviceId, function(err, results){
          if (err) cb(new Error('Device Secret Retrieval Error:'+err))
          admatrix.state.device.secret = results.results.device_token;
          cb();
        });
      } else {
        cb(new Error('No deviceName Found'));
      }
    },
    function getDeviceToken(cb){
      Device.authenticate( options.deviceId, admatrix.state.device.secret, function(err, results){
        if (err) return cb(new Error('Device Token Retrieval Error: '+err))
        admatrix.state.device.token = results.results.device_token;
        cb();
      })
    }
  ], function(err) {
    if (err) return cb(err);
    console.log('-----', '  API Initalize Complete  '.green.bold, '-----');
    cb(null, admatrix.state);
  });
}

function authenticateClient(options, cb) {
  // log('auth client---v', options);
  if (has(options, ['clientId', 'clientSecret']) === false) {
    console.error('No clientId or clientSecret passed to authenticate client()')
    // TODO: Must call "cb" function with a optional parameter
    return;
  }
  Authenticator.authenticateClient(options)
  .then(function(response) {
    if ( _.isUndefined(response)){
      log('Client Authentication Failed : Bad ID or Secret'.red);
      return cb('Client Auth Failed');
    }
    // log('Client Authenticated :'.blue, response);
    admatrix.state.client = {
      id: options.clientId,
      secret: options.clientSecret,
      token: response.access_token
    };
    cb(null, response);
  }).fail(function(err) {
    cb(err);
  });
}



/**
* authenticateUser - description
*
* @param  String options username
* @param  String options password
* @param  Fn     cb      callback
*/

function authenticateUser(options, cb) {
  // log('---> user', options);
  if (has(options, ['username', 'password'] === false)) {
    console.error('No username and password passed to authenticateUser()')
    // TODO: Must call "cb" function with a optional parameter
    return;
  }

  Authenticator.authenticateUser(options).then(function(response) {
    debug('Auth User'.blue, '->', response)
    if ( _.isUndefined(response) || response.status === 'error'){
      log('User Authentication Failed : Bad Username or Password '.red);
      return cb('User Auth Failed');
    }
    // log('User Authenticated :'.blue, response);
    admatrix.state.user = {
      name: options.username,
      token: response.access_token
    };
    RequestHandler.get( admatrix.config.url.current.user + '?access_token=' + response.access_token )
    .then(function(resp){
      debug('Get User'.blue, '->', resp)
      try {
        var userInfo = JSON.parse(resp);
      } catch (e) {
        console.error('Bad Current User from Server', resp, e);
      }
      admatrix.state.user.id = userInfo.results.user.id;
      cb(null, _.extend(response, { id : admatrix.state.user.id }));
    }).fail(function(err){
      cb(new Error("User Info : " + err + err.stack));
    });
  }).fail(function(err) {
    cb(new Error("User Auth: " + err.error ));
  });
}

function registerUser(username, password, clientId, cb) {
  if (_.isUndefined(username) || _.isUndefined(password) || _.isUndefined(clientId)) {
    console.error('No username and password passed to registerUser()')
    return;
  }

  Register.registerUser(username, password, clientId).then(function(response) {
    admatrix.state.user = {
      name: username,
      token: response
    };
    cb(null, response);
  }).fail(function(err) {
    cb(err);
  });

}

function installSensor(name, cb){
  Socket.sendDeviceCommand('sensor-install', name, function(err, resp){
    if (err) return console.error(err);
    cb(null,resp);
  });

}

function submitDeviceData(options, cb) {}

function subscribeStream(options, cb) {}

function publishStream(options, cb) {}


function listApps(cb) {
  Application.list(cb);
}

function startApp(appName, deviceId, cb) {
  Application.start(appName, deviceId, cb);
}

function stopApp(appName, deviceId, cb) {
  Application.stop(appName, deviceId, cb);
}

function restartApp() {
  Application.restart(admatrix.config, cb);
}

function installApp(appInfo, deviceId, cb) {
  Application.install(appInfo, deviceId, cb);
}

function uninstallApp(app, deviceId, cb) {
  Application.uninstall(app, deviceId, cb);
}

function updateApp() {

}

function subscribeStream(options, cb){}
function publishStream(options, cb){}


module.exports = adsdk;
