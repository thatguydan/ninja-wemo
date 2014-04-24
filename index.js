'use strict';

var WemoDevice = require('./lib/device');
var util = require('util');
var stream = require('stream');
var WeMo = require('wemo');

// Give our module a stream interface
util.inherits(Driver,stream);

function Driver(opts,app) {
  this._app = app;
  this._opts = opts;

  app.once('client::up', this.init.bind(this));

  // Scan for devices once every minute (by default) (existing devices will be updated if ip or port changes)
  setInterval(this.scan.bind(this), opts.deviceScanInterval);

  // We store any found devices here, indexed by serial number (so we can update ip+port if they change)
  this.devices = {};
}

/**
 * Discover and load WeMos
 */
Driver.prototype.init = function(){
  this.scan();
};

Driver.prototype.scan = function() {

  // Stop an existing search if there was one running.
  if (this.search) {
    this.search.stop();
  }

  // Discover WeMos
  this.search = WeMo.Search();
  this.search.on('found', this.load.bind(this));
};

Driver.prototype.load = function(info) {

  if (!this.devices[info.serialNumber]) {
    this._app.log.info('(WeMo) Found a WeMo - %s (Type: %s) @ %s:%s', info.friendlyName, info.deviceType, info.ip, info.port);

    var device = new WemoDevice(this._app, new WeMo(info.ip, info.port), info, this._opts.devicePollInterval);
    this.devices[info.serialNumber] = device;

    this.emit('register', device);
  } 

  var existing = this.devices[info.serialNumber];

  if (existing.info.ip !== info.ip || existing.info.port !== info.port) {
    this._app.log.info('(WeMo) WeMo Changed IP - %s from %s:%s to %s:%s', info.friendlyName, existing.info.ip, existing.info.port, info.ip, info.port);
  
    existing.device = new WeMo(info.ip, info.port);
    existing.info = info;
  }

};

Driver.prototype.config = function(rpc,cb) {

  if (!rpc) {
    return cb(null, {
      'contents':[
        { 'type': 'submit', 'name': 'Scan', 'rpc_method': 'configScan' }
      ]
    });
  }

  if (rpc.method == 'configScan') {
    return cb(null, {
      'contents': [
        { 'type':'paragraph', 'text':'Scanning for WeMo devices. Any devices found will appear shortly.'},
        { 'type':'close', 'text':'Close'}
      ]
    });
  } else {
    return cb(true);
  }

};


// Export it
module.exports = Driver;
