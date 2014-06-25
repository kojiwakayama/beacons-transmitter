var io = require('socket.io');
var socket;
var transmitterTag;

var sendBeacon = function (beacon) {
  Ti.API.info(beacon);
  socket.emit('beacon::create', beacon, {}, function(error, beacon) {});
};

var sendRanges = function (ranges) {
  Ti.API.info(ranges);
  socket.emit('ranges::create', ranges, {}, function(error, ranges) {});
};

if (OS_IOS) {
  var TiBeacons = require('org.beuckman.tibeacons');

  var enterRegion = function (e) {
    var timestamp = new Date().getTime();

    var beacon = {
      tag: transmitterTag,
      event: 'enter-region',
      timestamp: timestamp,
      id: e.uuid+"-"+e.major+"-"+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendBeacon(beacon);
  };

  var exitRegion = function (e) {
    var timestamp = new Date().getTime();

    var beacon = {
      tag: transmitterTag,
      event: 'exit-region',
      timestamp: timestamp,
      id: e.uuid+"-"+e.major+"-"+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendBeacon(beacon);
  };

  var updateRanges = function (e) {
    var timestamp = new Date().getTime();
    var beaconsCollection = [];

    e.beacons.forEach(function(device) {
      var beacon = {
        tag: transmitterTag,
        event: 'update-ranges',
        timestamp: timestamp,
        id: device.uuid+"-"+device.major+"-"+device.minor,
        identifier: device.identifier,
        uuid: device.uuid,
        major: parseInt(device.major),
        minor: parseInt(device.minor),
        proximity: device.proximity,
        rssi: device.rssi,
        distance: device.accuracy
      };
      sendBeacon(beacon);
      beaconsCollection.push(beacon);
    });

    var ranges = {
      event: 'on-ranges',
      timestamp: timestamp,
      tag: transmitterTag,
      beacons: beaconsCollection
    };

    // Send only if beacons found
    if (beaconsCollection.length) {
      sendRanges(ranges);
    }







    // Todo: loop through beacons

    var beacon = {
      tag: transmitterTag,
      event: 'update-ranges',
      timestamp: timestamp,
      id: e.uuid+"-"+e.major+"-"+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendBeacon(beacon);

    var ranges = {
      event: 'update-ranges',
      timestamp: timestamp,
      tag: transmitterTag,
      beacons: ['todo: add beacons']
    };
    sendRanges(ranges);
  };

  var handleProximity = function (e) {
    var timestamp = new Date().getTime();

    var beacon = {
      tag: transmitterTag,
      event: 'handle-proximity',
      timestamp: timestamp,
      id: e.uuid+"-"+e.major+"-"+e.minor,
      identifier: e.identifier,
      uuid: e.uuid,
      major: parseInt(e.major),
      minor: parseInt(e.minor),
      proximity: e.proximity,
      rssi: e.rssi,
      distance: e.accuracy
    };
    sendBeacon(beacon);
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

  addListeners();
  Ti.App.addEventListener("pause", pauseApp);
  Ti.App.addEventListener("resumed", appResumed);

  TiBeacons.enableAutoRanging();

  // Todo: fix socket.io reconnect
  var toggleMonitoring = function () {
    var urlPort = $.urlPortInput.value;

    if (!urlPort) {
      $.monitoringSwitch.value = false;
      return;
    }

    if ($.monitoringSwitch.value) {
      var uri = 'ws://' + $.urlPortInput.value;
      transmitterTag = $.transmitterTagInput.value;

      socket = io.connect(uri);
      socket.on('connect', function () {
        // All dev estimote-beacons have the same uuid
        TiBeacons.startMonitoringForRegion({
          uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
          identifier : "Estimote"
        });
        Ti.API.info('start');
      });
    } else {
      TiBeacons.stopMonitoringAllRegions();
      Ti.API.info('stop');
    }
  };
}

if (OS_ANDROID) {
  var iBeacon = require('miga.tibeacon');

  var onSuccess = function (e) {
    var timestamp = new Date().getTime();
    var beaconsCollection = [];

    e.devices.forEach(function(device) {
      var beacon = {
        tag: transmitterTag,
        event: 'on-success',
        timestamp: timestamp,
        id: device.uuid+"-"+device.major+"-"+device.minor,
        identifier: device.mac,
        uuid: device.uuid,
        major: parseInt(device.major),
        minor: parseInt(device.minor),
        proximity: device.proximity,
        rssi: device.rssi
      };
      sendBeacon(beacon);
      beaconsCollection.push(beacon);
    });

    var ranges = {
      event: 'on-success',
      timestamp: timestamp,
      tag: transmitterTag,
      beacons: beaconsCollection
    };

    // Send only if beacons found
    if (beaconsCollection.length) {
      sendRanges(ranges);
    }
  };

  var onRegion = function (e) {
    var timestamp = new Date().getTime();

    var device = e.device,
        beacon = {
          tag: transmitterTag,
          event: 'on-region',
          timestamp: timestamp,
          id: device.uuid+"-"+device.major+"-"+device.minor,
          identifier: device.mac,
          uuid: device.uuid,
          major: parseInt(device.major),
          minor: parseInt(device.minor),
          proximity: device.proximity,
          rssi: device.rssi
        };
    sendBeacon(beacon);
  };

  var onFound = function (e) {
    var timestamp = new Date().getTime();

    var device = e.device,
        beacon = {
          tag: transmitterTag,
          event: 'on-found',
          timestamp: timestamp,
          id: device.uuid+"-"+device.major+"-"+device.minor,
          identifier: device.mac,
          uuid: device.uuid,
          major: parseInt(device.major),
          minor: parseInt(device.minor),
          proximity: device.proximity,
          rssi: device.rssi
        };
    sendBeacon(beacon);
  };

  var onError = function (e) {
    Ti.API.info(JSON.stringify(e));
  };

  // Register success callback and set interval to 10sec
  iBeacon.initBeacon({
      success : onSuccess, error:onError, interval: 10, region: onRegion, found:onFound
  });

  // Todo: fix socket.io reconnect
  var toggleMonitoring = function () {
    var urlPort = $.urlPortInput.value;

    if (!urlPort) {
      $.monitoringSwitch.value = false;
      return;
    }

    if ($.monitoringSwitch.value) {
     var uri = 'ws://' + $.urlPortInput.value;
     transmitterTag = $.transmitterTagInput.value;

      socket = io.connect(uri);
      socket.on('connect', function () {
        iBeacon.startScanning();
        Ti.API.info('start');
      });
    } else {
      socket.on('disconnect', function () {
        iBeacon.stopScanning();
        Ti.API.info('stop');
      });
      socket.disconnect();
    }
  };
}

var init = function () {
  $.win.open();
};

init();