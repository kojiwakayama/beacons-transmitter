var io = require('socket.io'),
    uri = 'ws://10.6.112.133:8000',
    socket = io.connect(uri);

var sendData = function (data) {
  socket.emit('beacons::create', data, {}, function(error, beacons) {});
};

if (OS_IOS) {
  var TiBeacons = require('org.beuckman.tibeacons');
  TiBeacons.enableAutoRanging();

  var enterRegion = function (e) {
    var data = {
      event: 'enter-region',
      timestamp: new Date().getTime(),
      id: e.uuid+" "+e.major+" "+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendData(data);
  };

  var exitRegion = function (e) {
    var data = {
      event: 'exit-region',
      timestamp: new Date().getTime(),
      id: e.uuid+" "+e.major+" "+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendData(data);
  };

  var updateRanges = function (e) {
    var data = {
      event: 'update-ranges',
      timestamp: new Date().getTime(),
      id: e.uuid+" "+e.major+" "+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendData(data);
  };

  var handleProximity = function (e) {
    var data = {
      event: 'handle-proximity',
      timestamp: new Date().getTime(),
      id: e.uuid+" "+e.major+" "+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendData(data);
  };

  var addListeners = function () {
    TiBeacons.addEventListener("enteredRegion", enterRegion);
    TiBeacons.addEventListener("exitedRegion", exitRegion);
    TiBeacons.addEventListener("beaconRanges", updateRanges);
    TiBeacons.addEventListener("beaconProximity", handleProximity);
  };

  var removeListeners = function () {
    TiBeacons.removeEventListener("enteredRegion", enterRegion);
    TiBeacons.removeEventListener("exitedRegion", exitRegion);
    TiBeacons.removeEventListener("beaconRanges", updateRanges);
    TiBeacons.removeEventListener("beaconProximity", handleProximity);
  };

  var pauseApp = function () {
    TiBeacons.stopMonitoringAllRegions();
    TiBeacons.stopRangingForAllBeacons();
    $.monitoringSwitch.value = false;
    removeListeners();
  };

  var appResumed = function (e) {
    addListeners();
  };

  Ti.App.addEventListener("pause", pauseApp);
  Ti.App.addEventListener("resumed", appResumed);

  addListeners();

  var toggleMonitoring = function () {
    if ($.monitoringSwitch.value) {
      //All dev beacons from Estimote got the same uuid
      TiBeacons.startMonitoringForRegion({
        uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
        identifier : "Estimote"
      });
    } else {
      TiBeacons.stopMonitoringAllRegions();
    }
  };
}

if (OS_ANDROID) {
  var iBeacon = require('miga.tibeacon');

  // register success Callback and set interval to 30sec
  iBeacon.initBeacon({
      success : onSuccess, error:onError, interval: 30, region: onRegion, found:onFound
  });

  var onSuccess = function (e) {
    e.devices.forEach(function(device) {
        var data = {
          event: 'on-success',
          timestamp: new Date().getTime(),
          id: device.uuid+"-"+device.major+"-"+device.minor,
          identifier: device.mac,
          uuid: device.uuid,
          major: parseInt(device.major),
          minor: parseInt(device.minor),
          proximity: device.proximity,
          rssi: device.rssi
        };
      sendData(data);
    });
  };

  var onRegion = function (e) {
    var device = e.device,
        data = {
          event: 'on-region',
          timestamp: new Date().getTime(),
          id: device.uuid+"-"+device.major+"-"+device.minor,
          identifier: device.mac,
          uuid: device.uuid,
          major: parseInt(device.major),
          minor: parseInt(device.minor),
          proximity: device.proximity,
          rssi: device.rssi
        };
    sendData(data);
  };

  var onFound = function (e) {
    var device = e.device,
        data = {
          event: 'on-found',
          timestamp: new Date().getTime(),
          id: device.uuid+"-"+device.major+"-"+device.minor,
          identifier: device.mac,
          uuid: device.uuid,
          major: parseInt(device.major),
          minor: parseInt(device.minor),
          proximity: device.proximity,
          rssi: device.rssi
        };
    sendData(data);
  };

  var onError = function (e) {
    Ti.API.info(JSON.stringify(e));
  };

  var toggleMonitoring = function () {
    if ($.monitoringSwitch.value) {
      iBeacon.startScanning();
      Ti.API.info('start');

    } else {
      iBeacon.stopScanning();
      Ti.API.info('stop');
    }
  };
}

var init = function () {
  $.win.open();
};

socket.on('connect', function () {
  Ti.API.log('connected!');
  init();
});
