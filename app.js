var express = require('express');
var fs = require('fs');
var winston = require('winston');
var expressWinston = require('express-winston');
var app = express();
var helpers = require('./helpers');
var gear1 = __dirname + "/public/bipbop_4x3/gear1/prog_index.m3u8";
var startTime = Date.now();
var playlistInfo = helpers.getSegmentsDuration(gear1);
var isVOD = false;

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

app.use(express.static(__dirname + '/public'));

process.on('SIGUSR2', function(){
  isVOD = false;
});

process.on('SIGUSR1', function(){
  isVOD = true;
});

app.get('/bitrate_:id.m3u8', function(req, res, next){
  var id =parseInt(req.param('id'),10);
  if(isNaN(id) || id > 4){
    next();
    return;
  }
  var now = Date.now();
  var delta = (now-startTime)/1000;
  var totalLoops = Math.floor(delta/playlistInfo.totalDuration);
  var deltaInLoop = delta - (playlistInfo.totalDuration * totalLoops);
  var sequence = totalLoops * playlistInfo.segments.length;
  var currentSegment = 0;
  var segments = [];
  var m3u8Template, videoPath, _segment;
  for(var i in playlistInfo.segments){
    _segment = playlistInfo.segments[i];
    deltaInLoop -= _segment;
    if(deltaInLoop > 0){
      currentSegment++;
    }else if(segments.length < helpers.maxSegmentsInPlaylist){
      videoPath = ",\n/bipbop_4x3/gear"+id+"/segment_" + i + (id != 0 ? ".ts": ".aac");
      segments.push("#EXTINF:" + _segment + videoPath);
    }else{
      break;
    }
  }
  m3u8Template = "#EXTM3U\n#EXT-X-TARGETDURATION:11\n#EXT-X-VERSION:3\n#EXT-X-MEDIA-SEQUENCE:"+(sequence+currentSegment);
  m3u8Template += "\n"+segments.join('\n')+"\n";

  if (isVOD) {
    m3u8Template += "#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-ENDLIST\n";
  }

  res.contentType('application/vnd.apple.mpegurl');
  res.send(m3u8Template);

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
