var TiBeacons = require('org.beuckman.tibeacons'),
	io = require('socket.io'),
	uri = 'ws://10.6.112.133:8000',
	socket = io.connect(uri);

Ti.API.info("module is => " + TiBeacons);
TiBeacons.enableAutoRanging();

var iBeaconColletion = Alloy.Collections.iBeacon;
iBeaconColletion.fetch();

function enterRegion(e) {
	var model = ensureModel(e);
}
function exitRegion(e) {
	var model = ensureModel(e);
	iBeaconColletion.remove(model);
}
function updateRanges(e) {
	Ti.API.trace(e);
}
function handleProximity(e) {
	Ti.API.info(e);
	var model = ensureModel(e);
	model.set("proximity", e.proximity);
}

function ensureModel(e) {
	var atts = {
		id: e.uuid+" "+e.major+" "+e.minor,
		identifier: e.identifier,
		uuid: e.uuid,
		major: parseInt(e.major),
		minor: parseInt(e.minor),
		proximity: e.proximity,
		rssi: e.rssi,
		distance: e.accuracy
	};
	var model;
	var models = iBeaconColletion.where({id:atts.id});

	if (models.length === 0) {
		model = Alloy.createModel("iBeacon", atts);
		iBeaconColletion.add(model);
	}
	else {
		model = models[0];
		Ti.API.info("found model "+models[0].get("identifier"));
	}

	return model;
}

function addListeners() {
	TiBeacons.addEventListener("enteredRegion", enterRegion);
	TiBeacons.addEventListener("exitedRegion", exitRegion);
	TiBeacons.addEventListener("beaconRanges", updateRanges);
	TiBeacons.addEventListener("beaconProximity", handleProximity);
}
function removeListeners() {
	TiBeacons.removeEventListener("enteredRegion", enterRegion);
	TiBeacons.removeEventListener("exitedRegion", exitRegion);
	TiBeacons.removeEventListener("beaconRanges", updateRanges);
	TiBeacons.removeEventListener("beaconProximity", handleProximity);
}

function pauseApp() {
	TiBeacons.stopMonitoringAllRegions();
	TiBeacons.stopRangingForAllBeacons();
	$.monitoringSwitch.value = false;
	removeListeners();
}
function appResumed(e) {
	addListeners();
}
Ti.App.addEventListener("pause", pauseApp);
Ti.App.addEventListener("resumed", appResumed);

addListeners();

function toggleAdvertising() {
    if ($.advertisingSwitch.value) {
        TiBeacons.startAdvertisingBeacon({
            uuid : $.uuid.value,
            identifier : "TiBeacon Test",
            major: Math.abs(parseInt($.major.value)),
            minor: Math.abs(parseInt($.minor.value))
        });
        Ti.App.idleTimerDisabled = true;
    } else {
        TiBeacons.stopAdvertisingBeacon();
        Ti.App.idleTimerDisabled = false;
    }
}

function toggleMonitoring() {
    if ($.monitoringSwitch.value) {

				//All dev beacons from Estimote got the same uuid
        TiBeacons.startMonitoringForRegion({
            uuid : "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
            identifier : "Estimote"
        });

    } else {
			TiBeacons.stopMonitoringAllRegions();
    }
}

var service = Ti.App.iOS.registerBackgroundService({
    url: "bgService.js"
});

var init = function () {
	socket.emit('messages::create', {
		data: 'init'
	}, {}, function(error, messages) {
	});
	$.win.open();
};

socket.on('connect', function () {
	Ti.API.log('connected!');
	init();
});
