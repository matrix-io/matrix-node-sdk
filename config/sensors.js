var _ = require("underscore");


var sensorsMap = {}



function addSensor(sensorInfo) {
  _.extend(sensorsMap, sensorInfo);
};


module.exports =  {
  "addSensor": addSensor,
  "sensorsMap": sensorsMap
};



