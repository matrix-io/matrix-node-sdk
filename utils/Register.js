
var q = require('q');
var RequestHandler = require('./RequestHandler');
/**
 * The Register module allows a Client to register a new account to the AdMobilize platform
 * @class Register
 * @constructor
 *
 */



  /**
   * @method registerUser
   * @description Register a new user using the client credentials and user's username and password
   * @param {User} user
   * @param {Function} callback(error,responseJSON)
   */
   function registerUser (options) {
    var defer  = q.defer();

    var url    = admatrix.config.url.auth.registerUser;

    var params = {
     username: options.username,
     password: options.password,
     // For MatrixOS
     client_id: '07442ec6-f533-11e5-9ce9-5e5517507c66'
   };

   RequestHandler.post({url:url, form:params, json:true})
     .then(function(body){
      log('user made'.blue)
       admatrix.state.user.token = body.results.access_token;
       defer.resolve(body.results)
     }).then(null,defer.reject);

     return defer.promise;

   }


    /**
   * @method registerDevice
   * @description Register a new device using the user access token and device id
   * @param {Device} device
   * @param {Function} callback(error,responseJSON)
   */
   function registerDevice (options) {
    var defer = q.defer();
    var url    = admatrix.config.url.device.register;

    var params = {
      device_id: options.deviceId,
      access_token: admatrix.state.user.token,
      name: options.deviceName,
      description : options.deviceDescription
    };

    RequestHandler.post({url:url, form:params, json:true})
    .then(function(body){
      defer.resolve(body.results);
    }).fail(defer.reject);

    return defer.promise;
  }




module.exports = {
  registerUser: registerUser,
  registerDevice: registerDevice
};
