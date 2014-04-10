'use strict';

var Socket = require('./lib/socket');
var util = require('util');
var stream = require('stream');
var WeMo = require('wemo');

// Give our module a stream interface
util.inherits(Driver,stream);

function Driver(opts,app) {
  this._app = app;
  this._opts = opts;

  app.once('client::up', this.init.bind(this));
}

/**
 * Discover and load WeMos
 */
Driver.prototype.init = function(){
  this.scan();
};

Driver.prototype.scan = function() {

  if (this.search) {
    this.search.stop();
  }

  // Discover WeMos
  this.search = WeMo.Search();
  this.search.on('found', this.load.bind(this));
};

Driver.prototype.load = function(device) {
  this._app.log.info('(WeMo) Found a WeMo - %s (Type: %s) @ %s', device.friendlyName, device.deviceType, device.ip);

  if (device.deviceType.indexOf('controllee') > -1) {
    this.emit('register', new Socket(this._app, new WeMo(device.ip, device.port), device));
  } else {
    this._app.log.warn('(WeMo) Unknown device (Not a switch?)');
  }
};

/**
 * Called when a user prompts a configuration
 * @param  {Object}   rpc     RPC Object
 * @param  {Function} cb      Callback with return data
 */
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