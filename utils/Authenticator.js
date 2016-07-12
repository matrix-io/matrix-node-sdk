var request = require('request');
var q = require('q');

var Register = require('./Register');

var RequestHandler = require('./RequestHandler');
/**
 * Module for authenticate clients and accounts
 * @class Authenticator
 * @constructor
 *
 */

  /**
  * @method authenticateClient
  * @description Make sure the application is authorized on load to create registrations, using the client_id ,client_secret  and grant_type parameters
  * @param {Object} client
  */

  function authenticateClient(options,callback) {
    var defer = q.defer();


    var url    = admatrix.config.url.auth.client;

    var form = {
      client_id : options.clientId,
      client_secret: options.clientSecret,
      grant_type:  "client_credentials"
    };


    RequestHandler.post({url:url, form: form, json:true })
    .then(function(body){
      defer.resolve(body.results);
    }).fail(function(err){
      // try to register if fail
      Register.registerUser(options)
      .then(function(body){
        defer.resolve(body.results)
      }).fail(defer.reject);
    });

    return defer.promise;
  }

  /**
   * @method authenticateUser
   * @description Authenticate a registered user
   * @param {Object} client
   * @param {Object} user
   * @param {Function} callback(error, responseJSON)
   */
   function authenticateUser (options) {
    var defer = q.defer();
    var url    = admatrix.config.url.auth.user;

    var  form = {
      // remove need for client auth on endpoint. hardcode for now.
     client_id : 'AdMobilizeClientId',
     client_secret: 'AdMobilizeClientId',
     username: options.username,
     password: options.password,
     grant_type: 'password'
   }


    RequestHandler.post({url:url, form: form, json:true })
    .then(function(body){
      defer.resolve(body.results);
    }).then(null, defer.reject);

    return defer.promise;

 }

  /**
   * @method refreshUserToken
   * @description Refresh the user's token
   * @param {User} user
   * @param {Function} callback(error, responseJSON)
   */
   function refreshUserToken (user) {
    var defer = q.defer();
    var url    = admatrix.config.url.auth.refreshUserToken;

    var form = {
     client_id : admatrix.state.client.id,
     client_secret: admatrix.state.client.secret,
     access_token: admatrix.state.user.token,
     grant_type: "refresh_token"
   }

    RequestHandler.post({url:url, form: form, json:true })
    .then(function(body){
      admatrix.state.user.token = body.results;
      console.log(body.results);
      defer.resolve(body.results);
    }).then(null, defer.reject);

    return defer.promise;
}



module.exports = {
  refreshUserToken: refreshUserToken,
  authenticateUser:authenticateUser,
  authenticateClient:authenticateClient
};
