var Socket = require('./lib/socket')
  , util = require('util')
  , stream = require('stream')
  , WeMo = require('wemo.js')
  , configHandlers = require('./lib/config');

// Give our module a stream interface
util.inherits(wemo,stream);

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default module configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the cloud
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the cloud
 */
function wemo(opts,app) {

  var self = this;
  this._app = app;
  this._opts = opts;
  this._opts.sockets = opts.sockets || [];

  app.on('client::up', this.init);
};

/**
 * Discover and load WeMos
 */
wemo.prototype.init = function(){


  this.scan();
  // Register known WeMos
  this._opts.sockets.forEach(this.load.bind(this));
};

// Export it
module.exports = wemo;

wemo.prototype.scan = function() {
  // Discover WeMos
  WeMo.discover(function(WeMos) {

    // Iterate over found WeMos
    WeMos.forEach(function(WeMo) {

      var host = WeMo.location.host;

      if (this._opts.sockets.indexOf(host)===-1) {

        this.remember(host);
        this.load(host);
      }
    }.bind(this));

  }.bind(this));
}

wemo.prototype.load = function(host) {

  var client = WeMo.createClient(host);
  var G = this._opts.sockets.indexOf(host);

  this.emit('register',new Socket(client,G));
};

/**
 * Add a particular WeMo to this configuration
 * @param {[String} host Host of the WeMo to remember
 */
wemo.prototype.remember = function(host) {

  this._opts.sockets.push(host);
  this.save();
};

/**
 * Called when a user prompts a configuration
 * @param  {Object}   rpc     RPC Object
 * @param  {Function} cb      Callback with return data
 */
wemo.prototype.config = function(rpc,cb) {

  var self = this;

  if (!rpc) {
    return configHandlers.probe.call(this,cb);
  }

  switch (rpc.method) {
    case 'scan':               return configHandlers.configScan.call(this,rpc.params,cb); break;
    case 'manual_set_wemo':    return configHandlers.manual_set_wemo.call(this,rpc.params,cb); break;
    case 'manual_get_wemo':    return configHandlers.manual_get_wemo.call(this,rpc.params,cb); break;
    case 'manual_show_remove': return configHandlers.manual_show_remove.call(this,rpc.params,cb); break;
    case 'manual_remove_wemo': return configHandlers.manual_remove_wemo.call(this,rpc.params,cb); break;
    default:                   return cb(true);                                              break;
  }
};