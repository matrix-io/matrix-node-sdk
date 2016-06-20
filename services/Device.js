var RequestHandler = require('../utils/RequestHandler');
var Socket = require('../utils/Socket');

/* handles application REST requests */
module.exports = {
  list: listDevices,
  getAppList: getAppList,
  authenticate: authenticateDevice,
  register: registerDevice,
  create: createDevice,
  reboot: rebootDevice,

}

function createNewDevice(options, cb) {
  // POST /v1/device/create

  var form = {
    device_id: options.deviceId,
    name: options.name,
    description: options.description,
    access_token: admatrix.state.user.token
  };

  RequestHandler.post({
    url: admatrix.config.url.device.create,
    form: form,
    json: true
  }).then(function(results){
    cb(null, results);
  }).fail(cb);
}

function getAppList(deviceId, cb) {
  //GET v1/app/getAllByDevice
  RequestHandler.get(admatrix.config.url.device.appList + '?access_token=' + admatrix.state.user.token)
    .then(function(resp) {
      cb(null, resp)
    })
}

function rebootDevice(deviceId, cb) {
  //TODO Refactor to use socket interface
  Socket.init(function(err, io) {
    if (err) return cb(err);
    io.on('open', function() {
      io.on('message', function(msg) {
        console.log(msg);
        try {
          msg = JSON.parse(msg);
        } catch (e) {
          console.error(e);
        }
        switch (msg.channel) {
          case 'register-fail':
            console.error('client registration fail');
            break;
          case 'register-ok':
            console.log('Register ok');
            var restartEvent = {
              t: 'device-reboot',
              deviceId: deviceId,
              p: {
                token: admatrix.state.device.token,
              }
            };
            Socket.emit('client-cmd', restartEvent);
            cb(null);
            break;
          default:
            console.warn('Bad channel:', msg.channel);
        }
      });
    });
  });
}


  function createDevice (options, cb) {
   var url    = admatrix.config.url.device.create;

   var params = {
     device_id: options.deviceId,
     name: options.deviceName,
     description : options.deviceDescription
   };

   debug(params);
   RequestHandler.post({url:url, form:params, json:true})
   .then(function(body){
     console.log('Device Created:'.blue, body.results.deviceId);
     admatrix.state.device.token = body.results.deviceToken;
     cb(null, body);
   }).fail(function (err) {
     console.error(err);
   });
 }



function listDevices(options, cb) {
  // rely on server list
  var opts = {};
  if (_.size(options) > 0) {
    opts = options;
  }
  // console.log(admatrix.config.url.device.list + '?access_token=' + admatrix.state.user.token);
  RequestHandler.post(admatrix.config.url.device.list + '?access_token=' + admatrix.state.user.token, opts)
    .then(cb, handleError);
  }

// get device token here
function authenticateDevice(deviceId, deviceSecret, cb) {
  var url = admatrix.config.url.device.retrieveToken + '?access_token=' + admatrix.state.user.token;
  var postOpts = {
    device_id: deviceId,
    device_secret: deviceSecret
  }

  RequestHandler.post({
    url: url,
    form: postOpts,
    json: true
  }).then(function(results){ cb(null, results); }, handleError);
}

function registerDevice(deviceId, cb) {
  RequestHandler.post({
    url: admatrix.config.url.device.register,
    form: {
      device_id: deviceId,
      access_token: admatrix.state.user.token
    },
    json: true
  }).then(function (results) {
    cb(null, results);
  }).fail(cb);
}

function handleError(err) {
  try {
    var err = JSON.parse(err);
  } catch (e) {
    console.error('Device JSON Parse Error', err);
  } finally {
    console.error('API Error: ', err.status_code, '-', err.error);
  }
}
