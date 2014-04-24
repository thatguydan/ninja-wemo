'use strict';

var stream = require('stream');
var util = require('util');
var _ = require('underscore');

// Give our device a stream interface
util.inherits(Device, stream);

// Export it
module.exports = Device;

function Device(app, device, info, devicePollInterval) {

  this.isSensor = info.deviceType.match(/sensor/i);

  this.G = 'wemo'+info.serialNumber;
  this.V = 0;

  this.D = this.isSensor? 7 /* PIR Motion Sensor */ : 1009 /* Belkin WeMo Socket */;

  this.name = info.friendlyName;

  this.app = app;

  this.device = device;
  this.info = info;

  // Read from the device every 2 seconds.
  setInterval(this.read.bind(this), devicePollInterval);

  this.read();

  // So we can limit the number of error messages if the device disappears
  this.hideReadError = false;
}

/**
 * Whenever this is run it fetches the state from the device, and emits it IF the state has changed.
 */
Device.prototype.read = function(cb) {
  this.device.getBinaryState(function(err, state) {
    if (err) {
      return this.logReadError(new Error('blag'));
    }
      
    if (state !== this.lastState) {
      this.lastState = state;

      // Urgh. Sensors are swapped values....
      if (this.isSensor) {
        state = state === '1'? '0' : '1';
      } 

      this.emit('data', state);
    }
  }.bind(this));
};

/**
 * This function has been 'throttled' by underscore.js, so that it will never execute more than once
 * every two minutes. As we are reading from the device every 3 seconds, a disconnected device would have
 * otherwise filled the logs pretty quickly!
 */
Device.prototype.logReadError = _.throttle(function(err) {
  this.app.log.error('(WeMo) Failed reading device %s - %s', this.name, err);
}, 120000);

/**
 * Called whenever there is data from the cloud. For compatibility with the older cloud,
 * we'll accept any value that's 'falsy' or the string "0" as OFF, anything else is ON.
 */
Device.prototype.write = function(data) {

  var state = !(data === '0' || !data);

  this.app.log.info('(WeMo) Setting device %s to state %s', this.name, state);

  this.device.setBinaryState(state?1:0, function(err, result) {
    if (err) {
      return this.app.log.error('(WeMo) Failed writing device %s - %s', this.name, err);
    }

    this.read();
  }.bind(this));

};
