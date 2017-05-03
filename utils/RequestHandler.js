var request = require('request');
var q = require('q');

/**
 * Module to handle http request
 * @class RequestHandler
 * @constructor
 *
 */

/**
 * @method get
 * @description Make a GET request
 * @param {String} path
 * @param {Object} params
 * @param {Function} callback
 */
function get(params) {
  var defer = q.defer();
  debug('[get]', params)
  request.get(params, function(error, response, body) {
    debug('[get>', body);
    if (error) {
      defer.reject(error);
    } else if ( response.statusCode !== 200 ){
      defer.reject(body);
    } else if (!body || body === '') {
      defer.reject(new Error('Error ' + response.status));
    } else {
      handleResponse(body).then(defer.resolve, defer.reject);
    }
  });

  return defer.promise;
}



/**
 * @method post
 * @description Make a POST request
 * @param {String} path
 * @param {Object} params
 * @param {Function} callback
 */
function post(params) {
  var defer = q.defer();

  debug('[post] params:', params)
  var options = {
    method: 'post',
    body: params.form,
    json: params.json || false,
    url: params.url
  }

  request(options, function (error, response, body) {
    debug('[post] body:', body);
    if (error) {
      defer.reject(error);
    } else if ( response.statusCode !== 200 ){
      defer.reject(body);
    } else if (!body || body === "") {
      defer.reject(new Error('Error ' + response.status));
    } else {
      handleResponse(body).then(defer.resolve, defer.reject);
    }
  });
  return defer.promise;
}


/**
 * @method put
 * @description Make a PUT request
 * @param {String} path
 * @param {Object} params
 * @param {Function} callback
 */
function put(params) {
  var defer = q.defer();

  debug('[put]', params)
  request.put(params, function (error, response, body) {
    debug('[put]', body);
    if (error) {
      defer.reject(error);
    } else if (response.statusCode !== 200) {
      defer.reject(body);
    } else if (!body || body === "") {
      defer.reject(new Error("Error " + response.status));
    } else {
      handleResponse(body).then(defer.resolve, defer.reject);
    }
  });
  return defer.promise;
}

/**
 * @method delete
 * @description Make a DELETE request
 * @param {String} path
 * @param {Object} params
 * @param {Function} callback
 */
function del(params) {
  var defer = q.defer();

  debug('[delete]', params)
  request.del(params, function(error, response, body) {
    debug('[delete]', body);
    if (error) {
      defer.reject(error);
    } else if ( response.statusCode !== 200 ){
      defer.reject(body);
    } else if (!body || body === '') {
      defer.reject(new Error('Error ' + response.status));
    } else {
      handleResponse(body).then(defer.resolve, defer.reject);
    }
  });
  return defer.promise;
}



/**
 * @method handleResponse
 * @description Parse the json response from API
 * @param {Object} body
 */

function handleResponse(body) {
  var defer = q.defer();
  if (body) {
    if (!body.error) {
      defer.resolve(body);
    } else {
      defer.reject(new Error(body.error));
    }
  } else {
    defer.reject(new Error("Request fail"));
  }
  return defer.promise;
}



module.exports = {
  post: post,
  get: get,
  put: put,
  delete: del
}
