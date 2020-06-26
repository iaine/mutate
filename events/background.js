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
 * Fade the tone up or down based on method
 */
let fadeTone = function(audioCtx, pos, now, volume) {
  //fade (audioCtx, pos, now, volume) {
    var gainNode = audioCtx.createGain();

    if (pos == "up") {
      gainNode.gain.setValueAtTime(0.0, now);
      gainNode.gain.linearRampToValueAtTime((volume*0.25), now + 0.1);
      gainNode.gain.linearRampToValueAtTime((volume*0.5), now + 0.2);
      gainNode.gain.linearRampToValueAtTime((volume*0.75), now + 0.3);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.5);
    } else {
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.linearRampToValueAtTime((volume*0.75), now + 0.1);
      gainNode.gain.linearRampToValueAtTime((volume*0.5), now + 0.2);
      gainNode.gain.linearRampToValueAtTime((volume*0.25), now + 0.3);
      gainNode.gain.linearRampToValueAtTime(0.0, now + 0.5);
    }

  return gainNode;
}

/**
 * Method to play the tone using an ADSR envelope instead of a pure tone
 * @param audioContext
 * @param frequency
 * @param note_length
 * @param volume
 * @param adsrEnv
 * @param id
 */
let playTone = function (audioContext, frequency, note_length, volume, pos) {

  const nowtime = audioContext.currentTime;

  let oscillator = audioContext.createOscillator();

  let gainNode = fadeTone(audioContext, pos, nowtime, 0.5);
  //gainNode.gain.setValueAtTime(volume, nowtime);

  oscillator.type = "saw";
  oscillator.frequency.setValueAtTime(frequency, nowtime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency, nowtime + 0.03);
  oscillator.start(nowtime);
  oscillator.stop(nowtime + note_length);

  //connect all the parts up now
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

};

function logURL(requestDetails) {
  console.log(requestDetails.method)
  if (requestDetails.url != "http://127.0.0.1:3000/") {
    //@todo: swap the frequency based on type.
    const adsrEnv = {'a': 0.1, 'd': 0.8, 's': 0.3, 'r': 0.1, 'sustain': 0.1};
    if (requestDetails.method == "GET") {
      playTone(audioCtx, 329.63, 0.1, 0.5, "down");
    } else {
      playTone(audioCtx, 440.04, 0.2, 0.2, "up");
    }
    //sound here for the 
    //putData(makeAnnotationBody(requestDetails.url, requestDetails.method));
  }
}

/**
 *  Generic PUT Function
 *
 */
var putData = function (annotation) {
  const url = "http://127.0.0.1:3000/";
  const options = {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: annotation
  };

  fetch(url, options).catch(err => {
    console.error('Request failed', err)
  })

};

/**
 * Make a web annotation message
 * @param annoType
 * @param annoValue
 * @returns {string}
 */
function makeAnnotationBody(annoType, annoValue) {
  return  JSON.stringify({ "@context": "http://www.w3.org/ns/anno.jsonld", "creator": window.location.hostname, "id": "http://example.org/msa/anno", "type": "Annotation","created": new Date().toISOString(), "body": {"type" : annoType,"value" : annoValue,"format" : "text/plain"},"target": [ "http://127.0.0.1/prov/", './prov/model'] });
}

// Use the WebRequest API
browser.webRequest.onBeforeRequest.addListener(
  logURL,
  { urls: ["<all_urls>"] }
);

