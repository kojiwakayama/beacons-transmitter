# beacons-transmitter

Mobile app for iOS and Android to transmit beacons data to [beacons-api](https://github.com/kojiwakayama/beacons-api) over websockets.

## Features
* [Titanium](http://www.appcelerator.com/titanium/)
* [TiBeacons](https://github.com/jbeuckm/TiBeacons)
* [tibeacon](https://github.com/m1ga/tibeacon)
* [tiws](https://github.com/iamyellow/tiws)

## Getting started
```
# Install titanium and alloy
npm install -g titanium && npm install -g  alloy

# Install titanium sdk
titanium sdk install

# Cd into project folder
$ cd beacons-transmitter

# Build and run in emulator
$ titanium build [-p plattform]
# titanium build –p ios
# titanium build –p android

# Or build and run on device
$ titanium build [-p plattform] -T device
# ti build -p ios -T device
# ti build -p android -T device
```

## Dependencies
* [Node.js](http://nodejs.org/)

## Beacons api
see [beacons-api](https://github.com/kojiwakayama/beacons-api)

## Author
Koji Wakayama

## Contributors
Johan Lauri

## License
[MIT](http://opensource.org/licenses/MIT)