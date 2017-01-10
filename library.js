var helpers = require('./helpers');

module.exports = (m3u8Path) => {

    var startTime = Date.now();
    var playlistInfo = helpers.getSegmentsDuration(m3u8Path);

    return {
        getPlayList: (id) => {
            // var id = parseInt(req.param('id'),10);
            if (isNaN(id) || id > 4) {
                throw new Error('id should be in [0,4]')
            }
            var now = Date.now();
            var delta = (now - startTime) / 1000;
            var totalLoops = Math.floor(delta / playlistInfo.totalDuration);
            var deltaInLoop = delta - (playlistInfo.totalDuration * totalLoops);
            var sequence = totalLoops * playlistInfo.segments.length;
            var currentSegment = 0;
            var segments = [];
            var m3u8Template, videoPath, _segment;
            for (var i in playlistInfo.segments) {
                _segment = playlistInfo.segments[i];
                deltaInLoop -= _segment;
                if (deltaInLoop > 0) {
                    currentSegment++;
                } else if (segments.length < helpers.maxSegmentsInPlaylist) {
                    // videoPath = ",\n/bipbop_4x3/gear" + id + "/segment_" + i + (id != 0 ? ".ts" : ".aac");
                    videoPath = ',\n' + playlistInfo.names[i];
                    segments.push("#EXTINF:" + _segment + videoPath);
                } else {
                    break;
                }
            }
            m3u8Template = "#EXTM3U\n#EXT-X-TARGETDURATION:11\n#EXT-X-VERSION:3\n#EXT-X-MEDIA-SEQUENCE:" + (sequence + currentSegment);
            m3u8Template += "\n" + segments.join('\n') + "\n";

            return m3u8Template
        }
    }
}
