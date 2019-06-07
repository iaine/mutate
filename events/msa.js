/*
 * This script intercepts the url requests in the active tab
 * and captures both the URL and the Request Method
 *
 * @todo: Sonify the data
 */
let audioCtx = new AudioContext();

let adsr = function (audioCtx, T, adsrEnv) {
  let gainNode = audioCtx.createGain();
  function set(v, t) { gainNode.gain.linearRampToValueAtTime(v, T + t); }
  set(0.0, -T);
  set(0.0, 0);
  set(1.0, adsrEnv['a']);
  set(adsrEnv['sustain'], adsrEnv['a'] + adsrEnv['d']);
  set(adsrEnv['sustain'], adsrEnv['a'] + adsrEnv['d'] + adsrEnv['s']);
  set(0.0, adsrEnv['a'] + adsrEnv['d'] + adsrEnv['s'] + adsrEnv['r']);

  return gainNode;
};

/**
 * Method to play the tone using an ADSR envelope instead of a pure tone
 * @param audioContext
 * @param frequency
 * @param note_length
 * @param volume
 * @param adsrEnv
 * @param id
 */
let playTone = function (audioContext, frequency, note_length, volume) {
  this.context = audioContext;

  const nowtime = this.context.currentTime;

  let oscillator = this.context.createOscillator();

  let gainNode = this.context.createGain();
  gainNode.gain.setValueAtTime(volume, nowtime);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, nowtime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency, nowtime + 0.03);
  oscillator.start(nowtime);
  oscillator.stop(nowtime + note_length);

  //connect all the parts up now
  oscillator.connect(this.context.destination);
  gainNode.connect(this.context.destination);

};

function logURL(requestDetails) {
  console.log("Background Loading: " + requestDetails.url);
  console.log("Method: " + requestDetails.method);
  //@todo: swap the frequency based on type.
  const adsrEnv = {'a': 0.1, 'd': 0.8, 's': 0.3, 'r': 0.1, 'sustain': 0.1};
  playTone(audioCtx, 329.63, 0.1, 0.5,)
}

// Use the WebRequest API
browser.webRequest.onBeforeRequest.addListener(
  logURL,
  { urls: ["<all_urls>"] }
);

