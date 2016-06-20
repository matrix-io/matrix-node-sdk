# Admobilize Node SDK

NOTE: Has been modified for Admatrix. Please disregard any part of the documentation which refers to making a `new` anything.

IMPORTANT: No endpoints work until `authenticate` or `makeUrls` is called. This generates urls for the endpoints.

## Overview

**AdMobilize  Node SDK **, is a node module to connect in an easy way to the  **AdMobilize API **




####With this module you can

* Register an  application
* Create AdMobilize users
* Authenticate AdMobilize users


## Try this module
Follow this steps

### Install node  
* Go to [http://nodejs.com/downloads](http://nodejs.com/downloads).
* Download the installer for you OS and follow the wizard steps



###Clone the repo

```bash
git clone https://bitbucket.org/admobilize/admobilize-node-sdk.git
```

### Install depedencies


```bash
cd admobilize-node-sdk
npm install
```
### Require the ASK

```javascript
   // You need to include the Admobilize SDK module
   var api = require('admatrix-node-sdk');
```

```javascript
  // populate urls with different variables
  api.makeUrls( process.env['ADMATRIX_API_SERVER'] );
```

### 1) A simple example to authenticate a client


```javascript

  //Use the client promise to create and authenticate a client
  adsdk.client('AdMobilizeClientID','AdMobilizeClientSecret')
      .then(onSuccess, onError);  // onSuccess is a function that recieves a client object
                                   // onError is a function that recieves an error


```

### 2) How to create and/or authenticate a user
I have to create a client first , then you can create a user like this:
```javascript

  //Use the client promise to create and authenticate a client
  adsdk.user('username','password∂')
      .then(onSuccess, onError);  // onSuccess is a function that recieves a user object and is call when the promise is resolved
                                   // onError is a function that recieves an error and is call when the promise is rejected


```



### 3) How to create device
To create a client you need to create a user first , then you can do this:
```javascript



     //Use the client promise to create and authenticate a client
     adsdk.device('device_name','device_description')
      .then(onSuccess, onError);  // onSuccess is a function that recieves a device object
                                   // onError is a function that recieves an error

```

Note: When the device is successfully registered the device gets a device token that you can access with the getDeviceToken  method

### Heartbeat

Register a device start automatically a proccess named "Hearbeat" that verify the connection to the Admobilize API server, you can verfy the status of the connection with the isAlive method of the device object

```javascript

   var status = myDevice.isAlive();// resturns a boolean value , is true if the   connection to server is OK.

```
  The Heartbeat proccess use the user access token to do the request and verfy the connection with the server , if the user token expires
  the proccess stop and do a resfresh token request automatically to get a new token , then the proccess restart.

  By default the proccess runs  every 5 minutes (300000 miliseconds) , you  can change this value in the config.js file
 (admobilize-node-sdk/config/config.js) changing the HEARTBEAT_INTERVAL variable.

### 6) Submit data point
To submit point information you need a registered device , you can send data in json format
```javascript

    //process data
    device.watch('time'); //
    device.attr('image', "http://my_image.jpg");
    device.submit().then(success, error);

```

###  Get devices  associated to an user
You can get a list of devices associated to an user.
```javascript

   // getDevices method recives a callback function and a options json , these options are optional ,
   //some options are  pagination_page,pagination_limit and pagination_sort
   myUser.getDevices(callback, options);
```
Get a specific device
```javascript

   // getDeviceById method recives a  deviceId, a callback function and a options json , these options are
   // optional.
   myUser.getDeviceById("deviceId",callback, options);
```

### 8) Get   data from devices  associated to an user

Get a json with the data from devices associated to an user

```javascript

   // getDevicesData method recives a callback function and a options json
   myUser.getDevicesData(callback, options);
```

###Run the examples
The examples folder has a few examples that you can run:

####Authenticate a client
AuthenticateClient.js creates a new client instance and authenticate it using the AdMobilize API,if
your want to try it  follow the next steps.

```bash
 cd examples
 node AuthenticateClient.js
```

api.authenticate(options) - {'clientId', 'clientSecret', 'apiUrl'}
api.group.create()
api.group.list()
api.device.setToken()
api.device.setId()
api.device.list()
api.device.checkUpdates()
api.user.setToken()
api.auth.client()
api.auth.device()
api.auth.user
