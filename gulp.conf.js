module.exports = {

testUnitFiles: [
        'test/unit.test.js',
        'test/unit/*.js'
        ],
 testFolder: "test/unit/",
 unitTask: [
   {name:"suite",path :"test/unit/suite.js"},
   {name:"map",path :"test/unit/map.js"},
   {name:"authentication",path :"test/unit/authentication.js"},
   {name:"sensor",path :"test/unit/sensor.js"}
 ] 

}