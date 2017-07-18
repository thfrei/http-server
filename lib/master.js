/**
 * Created by thomas.frei on 18.07.2017.
 */
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

var folder = '../test/public';
var root = slash(path.join(__dirname, folder));

var glob = require("glob")

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
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
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
