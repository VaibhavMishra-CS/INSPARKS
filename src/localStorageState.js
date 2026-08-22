// localStorageState.js — watched / hidden video / hidden channel / album state.
// Shared, small module so dashboard.jsx stays readable.

const LS_WATCHED = "insparks_watched_videos";
const LS_HIDDEN_VIDEOS = "insparks_hidden_videos";
const LS_HIDDEN_CHANNELS = "insparks_hidden_channels";
const LS_ALBUM = "insparks_album_videos";

function readArray(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch (e) { return []; }
}
function writeArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

export function getWatched() { return new Set(readArray(LS_WATCHED)); }
export function setWatched(set) { writeArray(LS_WATCHED, [...set]); }

export function getHiddenVideos() { return new Set(readArray(LS_HIDDEN_VIDEOS)); }
export function setHiddenVideos(set) { writeArray(LS_HIDDEN_VIDEOS, [...set]); }

export function getHiddenChannels() { return new Set(readArray(LS_HIDDEN_CHANNELS)); }
export function setHiddenChannels(set) { writeArray(LS_HIDDEN_CHANNELS, [...set]); }

export function getAlbum() { return new Set(readArray(LS_ALBUM)); }
export function setAlbum(set) { writeArray(LS_ALBUM, [...set]); }