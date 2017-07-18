#!/usr/bin/env node

var request = require('request');
var slash = require('slash');
var path = require('path');
var _ = require('lodash');
var download = require('download-file');

exports.startSlave = function(options) {
  const _host = options.host;
  const _dir = slash(path.join(process.cwd(), options.dir));

  var socket = require('socket.io-client')(_host);

  socket.on('connect', function(){
    console.log('connected');
    request.get(_host + "/getCompleteIndex", function(err, res, body) {
      body = JSON.parse(body);

      _.map(body, function(item, key) {
        myDownload(item);
      })
    });

  });
  socket.on('update', function(file){
    console.log(file, 'changed');
    myDownload(file);
  });
  socket.on('remove', function(file){
    console.log(file, 'has been removed');
    // myDownload(file);
  });
  socket.on('disconnect', function(){

  });

  function myDownload(item) {
    var url = _host + item;
    var options = {
      directory: path.join(_dir, path.win32.dirname(item)),
      filename: path.win32.basename(item),
    };
    // console.log('url, options', url, options);
    download(url, options, function(err) {
      if(err) throw err;
      console.log('downloaded item', item);
    })
  }
} 