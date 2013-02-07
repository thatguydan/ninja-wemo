
var stream = require('stream')
  , util = require('util');

// Give our module a stream interface
util.inherits(Device,stream);

// Export it
module.exports=Device;

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the cloud
 *
 * @fires data - Emit this when you wish to send data to the cloud
 */
function Device(wemo,g) {

  var self = this;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = g||'0'; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 1002; // 2000 is a generic Ninja Blocks sandbox device

  this._wemo = wemo;

  var fetchState = function() {
    wemo.state(function(err,state) {
      if (!err) self.emit('data',state);
    });
  }

  // setInterval(fetchState,30000);
  fetchState();
};

/**
 * Called whenever there is data from the cloud
 * This is required if Device.writable = true
 *
 * @param  {String} state The data received
 */
Device.prototype.write = function(state) {

  var self = this;

  if (state=='1') {
    this._wemo.on(function(err) {
      if (!err) self.emit('data','1');
    });
  } else {
    this._wemo.off(function(err) {
      if (!err) self.emit('data','0');
      console.log('emitted off')
    });
  }
};
