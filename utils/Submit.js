var debug     = new DebugLog('sdk');
var request = require('request');

module.exports = function(dataJSON, fileData, cb) {
  // accepts two forms, ( data, cb ) and (data, file, cb)
  if (_.isFunction(fileData)) {
    var cb = fileData;
  }

  var url = admatrix.config.url.device.submit;

  var requestPost = request.post(url, function(error, response, body) {
      if (error) {
        cb(new Error('Server unavailable'), {
          error: 'Server unavailable'
        });
      } else {
        try {
          var responseJSON = JSON.parse(body);
          if (responseJSON.status === 'OK') {
            cb(null, responseJSON);
          } else {
            if (typeof responseJSON.error == 'String') {
              cb(new Error('Error ' + responseJSON.status_code + ' ' + responseJSON.error), responseJSON);
            } else {
              cb(new Error('Error ' + responseJSON.status_code), responseJSON);
            }
          }
        } catch (err) {
          var statusCode = response ? response.statusCode : '';
          cb(new Error('Error submitting data (' + statusCode + ')'), {
            error: 'Error submitting data',
            response: response
          });
          return;
        }
      }
    });

  var form = requestPost.form();

  form.append('device_token', admatrix.state.device.token);
  form.append('data_point', JSON.stringify(dataJSON));
  if (!_.isFunction(fileData)) {
    form.append('file', fileData);
  }
}
