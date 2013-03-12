var messages = require('./config_messages');
var WeMo = require('wemo.js')


exports.probe = function(cb) {

  cb(null,messages.probeGreeting);
};

exports.configScan = function(params,cb) {
  this.scan();
  cb(null,messages.finish);
}

exports.manual_get_wemo = function(params,cb) {

  cb(null,messages.fetchWeMoModal);
};

exports.manual_set_wemo = function(params,cb) {

  var host = params.wemo_host;
  var index = this._opts.sockets.indexOf(params.host||'');

  if (index===-1) {
    this.remember(host);
    this.load(host);
  }

  cb(null,messages.finish);
};

exports.manual_show_remove = function(params,cb) {

  var toShow = messages.removeWeMoModal;
  toShow.contents[2].options = this._opts.sockets;
  cb(null,toShow);
};

exports.manual_remove_wemo = function(params,cb) {

  var index = this._opts.wemos.indexOf(params.wemo_host||'');

  if (index>-1) {
    this._opts.wemos.splice(index,1);
    this.save();
  }
  cb(null,messages.finish);
};