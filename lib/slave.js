/**
 * Created by thomas.frei on 18.07.2017.
 */
const host = 'http://localhost:3000';

var socket = require('socket.io-client')(host);
var request = require('request');
var slash = require('slash');
var path = require('path');
var _ = require('lodash');
var download = require('download-file');

const root = slash(path.join(__dirname, '../test/slave'));

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
