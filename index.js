var Socket = require('./lib/socket')
  , util = require('util')
  , stream = require('stream')
  , WeMo = require('wemo.js');

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

  app.on('client::up',function(){

    // Discover WeMos
    WeMo.discover(function(WeMos) {
      WeMos.forEach(loadWemo.bind(self))
    });
  });
};

// Export it
module.exports = wemo;

function loadWemo(thisWeMo) {

  var host = thisWeMo.location.host;

  if (this._opts.sockets.indexOf(host)===-1) {
    this._opts.sockets.push(host);
    this.save();
  }

  var client = WeMo.createClient(host);
  var G = this._opts.sockets.indexOf(host);

  this.emit('register',new Socket(client,G));
};