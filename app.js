var express = require('express');
var fs = require('fs');
var winston = require('winston');
var expressWinston = require('express-winston');


var path = process.argv[2] || __dirname + '/public/bipbop_4x3/gear1/'
var playlistName = process.argv[3] || 'prog_index.m3u8'
var library = require('./library')(path + playlistName)

var app = express();

app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console({
          json: false,
          colorize: true
        })
      ],
      meta: false, // optional: control whether you want to log the meta data about the request (default to true)
      msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    }));

app.use(express.static(__dirname + '/public/bipbop_4x3/gear1/'));

process.on('SIGUSR2', function(){
  isVOD = false;
});

process.on('SIGUSR1', function(){
  isVOD = true;
});

app.get('/playlist.m3u8', function(req, res, next){
  res.contentType('application/vnd.apple.mpegurl');
  res.send(library.getPlayList());
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status);
  res.send({message: err.message});
});

app.listen(6060);

module.exports = app;
