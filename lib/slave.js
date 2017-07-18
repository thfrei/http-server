#!/usr/bin/env node

var request = require('request');
var slash = require('slash');
var path = require('path');
var _ = require('lodash');
var download = require('download-file');

var program = require('commander');
program
  .version('0.1.0')
  .option('-h, --host [host]', 'Host url')
  .option('-d, --dir [dir]', 'slave directory')
  .parse(process.argv);

if (typeof program.host === "undefined") {
  console.error('define a host');
  process.exit(1);
}
const host = program.host;
console.log('host', host);
const root = slash(path.join(__dirname, '../test/slave'));

var socket = require('socket.io-client')(host);

socket.on('connect', function(){
  console.log('connected');
  request.get(host + "/getCompleteIndex", function(err, res, body) {
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
  var url = host + item;
  var options = {
    directory: path.join(root, path.win32.dirname(item)),
    filename: path.win32.basename(item),
  };
  // console.log('url, options', url, options);
  download(url, options, function(err) {
    if(err) throw err;
    console.log('downloaded item', item);
  })
}
