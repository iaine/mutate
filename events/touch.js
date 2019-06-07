/**
 *  Web extension to watch the human interactions with the
 *  screen. The msa sits in the background.
 *
 *  @todo: Sonify me!
 */

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
//spatialNote(audioContext, frequency, note_length, volume, pos, id)
let playEnvelopeTone = function (audioContext, frequency, note_length, volume, adsrEnv, pos) {

  const nowtime = audioContext.currentTime;

  let gainNode = adsr(audioContext, nowtime, adsrEnv);

  let oscillator = audioContext.createOscillator();

    //let y = ((window.innerHeight/2) + pos.y);
    let y = pos.y;
    let x = pos.x;
    //let x = ((window.innerWidth/2) + pos.x);
    let z = 100;

    let listener = audioContext.listener;

    // Create static position for the listener
    if(listener.forwardX) {
        listener.forwardX.value = 0;
        listener.forwardY.value = 0;
        listener.forwardZ.value = -1;
        listener.upX.value = 0;
        listener.upY.value = 1;
        listener.upZ.value = 0;
    } else {
        listener.setOrientation(0,0,-1,0,1,0);
    }

    if(listener.positionX) {
        listener.positionX.value = pos.x;
        listener.positionY.value = (window.innerHeight/2);
        listener.positionZ.value = z;
    } else {
        listener.setPosition(pos.x, (window.innerHeight/2), z);
    }

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, nowtime);

  oscillator.start(nowtime);
  oscillator.stop(nowtime + note_length);

  //connect all the parts up now
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
};

var checkButtons = function() {

    let adsrEnv = {'a': 0.1, 'd': 0.4, 's': 0.15, 'r': 0.1, 'sustain': 0.1};

    let detune = 0;

    const power = Math.pow(2, 1 / 12);

    let calculateNewNote = function (base, newnote) {
        return base * Math.pow(power, newnote);
    };
};

/*
 *  Human functions
 */

let checkEvent = function (evt) {
    //@todo: use evt.type in the
    console.log('bonjour: ' + JSON.stringify(evt.type));
    //function (audioContext, frequency, note_length, volume, adsrEnv, pos)
    let AudioCtx = new AudioContext();
    const adsrEnv = {'a': 0.1, 'd': 0.8, 's': 0.3, 'r': 0.1, 'sustain': 0.1};
    playEnvelopeTone(AudioCtx, 260.25, 0.5, 0.5, adsrEnv, handleEventCoord(evt));
};

let handleEventCoord = function (evt) {
    let touchPoint = {};

    touchPoint.x = evt.clientX;
    touchPoint.y = evt.clientY;

    return touchPoint;
};

try {
    document.addEventListener("touchstart", checkEvent);
    document.addEventListener("touchend", checkEvent);
    document.addEventListener("touchcancel", checkEvent);
    document.addEventListener("touchmove", checkEvent);
    document.addEventListener("mouseenter", checkEvent);
    document.addEventListener("mousedown", checkEvent);
    document.addEventListener("mouseup", checkEvent);
    document.addEventListener("mouseleave", checkEvent);
    document.addEventListener("mouseover", checkEvent);
    document.addEventListener("pointerdown", checkEvent);
    document.addEventListener("pointerup", checkEvent);
    document.addEventListener("click", checkEvent);
    document.addEventListener("dblclick", checkEvent)
} catch (e) {
    console.error("WebEx: " + e)
}
// capture the x and y positions for available
// events
