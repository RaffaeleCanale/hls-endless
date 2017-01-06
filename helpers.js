var fs = require('fs');
module.exports = {
  maxSegmentsInPlaylist:10,
  getSegmentsDuration: function(file){
    var data = fs.readFileSync(file, 'utf-8');
    var re = /EXTINF:([\d\.]+),/gi;
    var segments = [], duration = 0, found;
    while (found = re.exec(data)){
      segments.push(found[1]);
      duration+=parseFloat(found[1]);
    }

    re = /(.+\.ts)/gi;
    var names = []
    while (found = re.exec(data)){
      names.push(found[1]);
    }

    if (names.length !== segments.length) throw new Error('Invalid m3u8 file')

    return { totalDuration:duration, segments, names};
  }
}
