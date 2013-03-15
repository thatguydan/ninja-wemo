var messages = require('./config_messages');
var WeMo = require('wemo.js')


exports.probe = function(cb) {

  cb(null,messages.probeGreeting);
};

exports.configScan = function(params,cb) {

  this.scan();
  cb(null,messages.scanFinished);
}

exports.manual_get_wemo = function(params,cb) {

  cb(null,messages.fetchWeMoModal);
};

exports.manual_set_wemo = function(params,cb) {

  if (!params.wemo_host) {
    return cb(null,messages.finish);
  }

  var host = params.wemo_host;
  var index = this._opts.sockets.indexOf(params.host);

  if (index===-1) {
    this.remember(host);
    this.load(host);
  }

  cb(null,messages.finish);
};

exports.manual_show_remove = function(params,cb) {

  var toShow = messages.removeWeMoModal;

  var sockets = this._opts.sockets;

  var optionArr = [];

  for (var i=0;i<sockets.length;i++) {
    optionArr.push({name:sockets[i],value:sockets[i]});
  }

  if (optionArr.length>0) {
    toShow.contents[1].options = optionArr;
  }
  cb(null,toShow);
};

exports.manual_remove_wemo = function(params,cb) {

  if (!params.wemo_host) {

    return cb(null,messages.finish);
  }

  var index = this._opts.sockets.indexOf(params.wemo_host);

  if (index>-1) {
    this._opts.sockets.splice(index,1);
    this.save();
  }
  cb(null,messages.removeWeMoModalSuccess);
};