// var settings = {
//   apiHost: "http://admobilize-api.herokuapp.com",
//   authClientPath:  "/v1/oauth2/client/token/",
//   authUserPath:  "/v1/oauth2/user/token/",
//   registerUserPath: "/v1/oauth2/user/register/",
//   registerDevicePath: "/v1/device/register",
//   updateDevicePath: "/v1/device/update",
//   registerAnonymousDevicePath: "/v1/device/create",
//   submitDataPointPath: "/v1/device/data/create",
//   createDataPoint: "/v1/data/:object",
//   mapPath: "/v1/data/:object/map",
//   heartbeatPath: "/v1/device/heartbeat",
//   refreshUserTokenPath: "/v1/oauth2/user/refresh_token",
//   retriveUserDevicesPath: "/v1/device/retrieve",
//   retriveDeviceDataPath: "/v1/device/data/paginate",
//   retriveDeviceToken: "/v1/device/token",
//   requestDeviceDetailsPath: "/admin/device/get",
//   sensorsFolder:"/etc/sensors/",
//   heartbeatInterval: 300000,
//   admobilizeSDKRootPath: __dirname + "/../",
// currentUserPath: '/user/current'
// }

var j = {
  populateUrls: populateUrls
}

function populateUrls(apiUrl, streamingUrl) {
  var endpoints = {
    auth: {
      client: '/v1/oauth2/client/token/',
      user: '/v1/oauth2/user/token/',
      refreshUserToken: '/v1/oauth2/user/refresh_token',
      registerUser: '/v1/oauth2/user/register/',
    },
    current: {
      user: '/v1/user/current'
    },
    group: {
      list: '/v1/group',
      create: '/v1/group'
    },
    device: {
      appList:  '/v1/app/getAllByDevice',
      create: '/v1/device/create',
      retrieveToken: '/v1/device/token',
      register: '/v1/device/register',
      update: '/v1/device/update',
      create: '/v1/device/create',
      registerAnonymous: '/v1/device/create',
      submit: '/v1/device/data/create',
      heartbeat: '/v1/device/heartbeat',
      list: '/v1/device/retrieve',
      event: '/v1/device/event',
      secret: '/v2/device/secret',
    },
    app: {
      deploy: '/v1/app/deploy',
      start: '/v1/app/start',
      assign: '/v1/app/assign',
      stop: '/v1/app/stop',
      install: '/v1/app/install',
      uninstall: '/v1/app/uninstall',
      update: '/v1/app/update',
      list: '/v1/app',
      search: '/v1/app/search',
      config: '/v1/app/config'
    }
  }


  for (var j in endpoints) {
    var category = endpoints[j];
    for (var i in category) {
      category[i] = apiUrl + category[i];
    }
  }

  endpoints.api = apiUrl;
  endpoints.streaming = streamingUrl;

  return endpoints;
}


module.exports = j;
