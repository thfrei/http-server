#!/usr/bin/env node

var express = require('express');
var path = require('path');
var app = express();
var serveIndex = require('serve-index')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var slash = require('slash');
var watch = require('node-watch');
var fs = require('fs');
var ngrok = require('ngrok');

var glob = require("glob")

exports.startServer = function(options) {
  const _directory = options.directory || '.';
  const _port = options.port || 3000;

  var root = slash(path.join(process.cwd(), _directory));
  console.log('root', root);

  app.use('/', express.static(root));
  app.use('/', serveIndex(root, {'icons': true}));

  app.get('/getCompleteIndex', function (req, res) {
    var globFolder = slash(path.join(root, "**"));
    var options = {
      mark: true, // marks folder with trailing /
      nodir: true,
    };
    var globResult = glob.sync(globFolder, options);
    globResult = _.map(globResult, function(item) {
      return sanitizeFileName(item);
    });
    res.json(globResult);
  });

  io.on('connection', function(socket){
    // console.log('a user connected');
  });

  http.listen(_port, function(){
    console.log('listening on *:' + _port);
  });


  function sanitizeFileName(file) {
    return file.replace(root, '');
  }

  watch(root, { recursive: true }, function(evt, name) {
    var file = slash(name);
    if (evt == 'update') {
      console.log('event', evt, name);
      try {
        var isFile = fs.lstatSync(name).isFile()
        if (isFile) {
          console.log('%s changed.', sanitizeFileName(file));
          io.emit('update', sanitizeFileName(file));
        }
      } catch (err) {
        // Handle error
        if (err.code == 'ENOENT') {
          //no such file or directory
          //do something
        } else {
          //do something else
        }
      }
    }
    if (evt == 'remove') {
      console.log('%s was removed.', sanitizeFileName(file));
      io.emit('remove', sanitizeFileName(file));
    }
  });

  ngrok.connect(_port, function (err, url) {
    console.log('ngrok', url, err);
  }); // https://757c1652.ngrok.io -> http://localhost:9090

}