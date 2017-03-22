# HLS Endless

Serve an HLS stream with an endlessly (cycling) sliding playlist generated from a VOD playlist.

## Getting started

### Installation

To install, use:
```
npm run install
```

### Running

To run, use:
```
npm start <PUBLIC_DIR> <HLS_PLAYLIST_PATH>
```
where
- `<PUBLIC_DIR>` is the directory that will be served
- `<HLS_PLAYLIST_PATH>` is the path relative to `<PUBLIC_DIR>` of the full m3u8 playlist

#### Example
```
npm start ../p2p-live-cdn-cache/public/ 1010qwoeiuryfg/1240_vod.m3u8
```
