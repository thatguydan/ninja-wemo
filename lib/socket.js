'use strict';

var stream = require('stream');
var util = require('util');

// Give our module a stream interface
util.inherits(Device,stream);

// Export it
module.exports=Device;

function Device(app, device, info) {

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = 'wemo'+info.serialNumber;
  this.V = 0;
  this.D = 1009;
  this.name = info.friendlyName;

  this.app = app;

  this.device = device;

  setInterval(this.read.bind(this), 30000);

  this.read();
}

Device.prototype.read = function() {
  this.device.getBinaryState(function(err, state) {
    if (err) {
      return this.app.log.error('(WeMo) Failed reading device %s - %s', this.device.friendlyName, err);
    }

    if (state !== this.lastState) {
      this.lastState = state;
      this.emit('data', state+'');
    }
  }.bind(this));
};

/**
 * Called whenever there is data from the cloud
 * This is required if Device.writable = true
 *
 * @param  {String} state The data received
 */
Device.prototype.write = function(state) {
  if (state === '1') {
    state = true;
  } else if (state === '0') {
    state = false;
  }

  this.app.log.error('(WeMo) Setting device %s to state %s', this.name, state);

  this.device.setBinaryState(state?1:0, function(err, result) {
    if (err) {
      return this.app.log.error('(WeMo) Failed writing device %s - %s', this.device.friendlyName, err);
    }

    this.read();
  }.bind(this));

};
