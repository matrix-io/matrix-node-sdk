var settings = {
  apiHost: "http://admobilize-api.herokuapp.com",
  socketHost: "http://localhost:3000",
  authClientPath:  "/v1/oauth2/client/token/",
  authUserPath:  "/v1/oauth2/user/token/",
  registerUserPath: "/v1/oauth2/user/register/",
  registerDevicePath: "/v1/device/register",
  updateDevicePath: "/v1/device/update",
  registerAnonymousDevicePath: "/v1/device/create",
  submitDataPointPath: "/v1/device/data/create",
  createDataPoint: "/v1/data/:object",
  mapPath: "/v1/data/:object/map",
  heartbeatPath: "/v1/device/heartbeat",
  refreshUserTokenPath: "/v1/oauth2/user/refresh_token",
  retriveUserDevicesPath: "/v1/device/retrieve",
  retriveDeviceDataPath: "/v1/device/data/paginate",
  retriveDeviceToken: "/v1/device/token",
  requestDeviceDetailsPath: "/admin/device/get",
  sensorsFolder:"/etc/sensors/",
  heartbeatInterval: 300000,
  admobilizeSDKRootPath: __dirname + "/../"
}



function setSettings(options) {
  _.extend(settings,options);

  //TODO: Extend into process.env's
};




module.exports =  {"settings": settings,
"setSettings": setSettings

};
