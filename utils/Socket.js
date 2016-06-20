
var socket;


function sendDeviceCommand(eventName, payload, cb, options) {

  // TODO: Parameter defaults in ES6
  var options = ( _.isUndefined(options) ) ? {} : options;

  // support 2 parameter form
  if ( _.isFunction(payload)){
    cb = payload;
  }

  if ( _.isUndefined(payload) || _.isFunction(payload)){
    payload = {};
  }

  _.extend(payload, { token: admatrix.config.device.token });

    initSocket(function(err, io) {
      if (err) return cb(err);
      io.on('open', function() {
        debug('socket open');
        io.on('close', function(){
          debug('socket close')
          if ( _.isFunction(cb)) {
            cb(null);
          }
        });
        io.on('error', function(err){
          debug('socket error')
          if ( _.isFunction(cb)) {
            cb(err);
          }
        })
        io.on('message', function(msg) {
          // console.log(msg);
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
              debug('Register ok');
              var theEvent = {
                t: eventName,
                deviceId: admatrix.config.device.identifier,
                p: payload
              };
              debug('[ss]', theEvent);
              // don't like this
              emitSocket('client-cmd', theEvent);
              if ( options.keepOpen === true ) {
                //do nothing
              } else {
                io.close();
              }
              break;
            case 'app-log':
            case 'server-message':
              debug('[ss]>sdk'.green, msg);
              if ( _.isFunction(cb)) {
                cb(null, msg);
              } else {
                console.error('Server-Message not handled from:', eventName)
              }
              break;
            default:
              console.warn('Bad channel:', msg.channel);
              break;
          }
        });
      });
    });
}

function initSocket(sUrl, cb){
  if ( _.isFunction(sUrl)){
    cb = sUrl;
    sUrl = admatrix.config.url.streaming;
  }
  if (!admatrix.config.user.hasOwnProperty('token') ){
    return cb('SDK needs Access Token. Login Again');
  }

  var url = require('url');
  sUrl = url.parse(sUrl);
  // sUrl.protocol = 'ws:';
  sUrl.pathname = 'engine.io';

  require('net').connect({
    port: sUrl.port,
    host: sUrl.hostname
  }, function(res){
      var io = require('engine.io-client')(url.format(sUrl));
      io.on('open', function(){
        debug('Socket Connection:'.grey,  require('url').format(sUrl) );
        socket = io;
        io.send(JSON.stringify({
          channel : 'client-register',
          payload: { userId: admatrix.config.user.id, userToken: admatrix.config.user.token }
        }));
      });

      io.on('error', function(err){
        console.log('socket error'.red, err);
      });

      io.on('register-fail', function(e){
        console.log('registration fail', e);
      });

      cb(null, io);
  }).on('error', function(err){
    return cb('No Streaming Server Visible'.red + ' @ ' +require('url').format(sUrl) + err );
  });

}

function emitSocket(channel, msg){
  debug('[ss]>', channel.blue, msg)
  socket.send(JSON.stringify({
    channel: channel, payload: msg
  }));
}

module.exports = {
  init: initSocket,
  emit: emitSocket,
  socket: socket,
  sendDeviceCommand: sendDeviceCommand
}
