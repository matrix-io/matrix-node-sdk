var should = require('should')
describe('sdk', function () {

var sdk = require('../adsdk.js');

it('can be required', function(done){
  should(sdk).have.property('authenticate');
  // should(false).be(true);
  done();
});

it('can register a client');

it('can populate urls into a configuration object', function(done){
  sdk.makeUrls('http://dev-demo.admobilize.com');
  log(sdk);
})
it('can refresh a user token')
it('can get information about the current user')

it('can GET authenticated through RequestHandler.get')
it('can POST authenticated through RequestHandler.post')
it('can register via socket')
it('can handle socket server messages via sendDeviceCommand()')
});
describe('groups', function(){
  it('can create a group')
  it('can get a list of groups')
})
describe('device', function () {
  it('can get a list of all apps per device');
  it('can register a device')
  it('can refresh a device token')
  it('can list devices')
});
describe('apps', function(){
  it('can start an app')
  it('can install an app')
  it('can uninstall an app')
  it('can stop an app')
  it('can get logs from an app')
  it('can start an app')
  it('can search for apps')
  it('can create an app')
  it('can deploy an app')

  // e2e potential
  it('can configure an app')
});
