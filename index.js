var helpers = require('./helpers');

function Library(m3u8Path) {
    this.startTime = Date.now()
    this.playlistInfo = helpers.getSegmentsDuration(m3u8Path)
}

Library.prototype.restart = function () {
    this.startTime = Date.now()
}

Library.prototype.getPlaylist = function () {
    var now = Date.now();
    var delta = (now - this.startTime) / 1000;
    var totalLoops = Math.floor(delta / this.playlistInfo.totalDuration);
    var deltaInLoop = delta - (this.playlistInfo.totalDuration * totalLoops);
    var sequence = totalLoops * this.playlistInfo.segments.length;
    var currentSegment = 0;
    var segments = [];
    var m3u8Template, videoPath, _segment;
    for (var i in this.playlistInfo.segments) {
        _segment = this.playlistInfo.segments[i];
        deltaInLoop -= _segment;
        if (deltaInLoop > 0) {
            currentSegment++;
        } else if (segments.length < helpers.maxSegmentsInPlaylist) {
            videoPath = ',\n' + this.playlistInfo.names[i];
            segments.push("#EXTINF:" + _segment + videoPath);
        } else {
            break;
        }
    }
    m3u8Template = "#EXTM3U\n#EXT-X-TARGETDURATION:11\n#EXT-X-VERSION:3\n#EXT-X-MEDIA-SEQUENCE:" + (sequence + currentSegment);
    m3u8Template += "\n" + segments.join('\n') + "\n";

    return m3u8Template
}

module.exports = Library
