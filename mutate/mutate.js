/**
*  Web extension to watch changes
*/
let audioCtx = new AudioContext();

let adsr = function (audioCtx, T, adsrEnv) {
    var gainNode = audioCtx.createGain();
    function set(v, t) { gainNode.gain.linearRampToValueAtTime(v, T + t); }
    set(0.0, -T);
    set(0.0, 0);
    set(1.0, adsrEnv['a']);
    set(adsrEnv['sustain'], adsrEnv['a'] + adsrEnv['d']);
    set(adsrEnv['sustain'], adsrEnv['a'] + adsrEnv['d'] + adsrEnv['s']);
    set(0.0, adsrEnv['a'] + adsrEnv['d'] + adsrEnv['s'] + adsrEnv['r']);

    return gainNode;
};

let playEnvelopeTone = function (audioContext, frequency, note_length, volume, adsrEnv,detune) {

  const nowtime = audioContext.currentTime

  let gainNode = adsr(audioContext, nowtime, adsrEnv);

  let oscillator = audioContext.createOscillator();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, nowtime);
  oscillator.detune.setValueAtTime(detune, nowtime);
  oscillator.start(nowtime);
  oscillator.stop(nowtime + note_length);

  //connect all the parts up now
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
};

var checkButtons = function() {

//let audioCtx = new AudioContext();

let adsrEnv = {'a':0.1, 'd':0.4, 's':0.15, 'r':0.1, 'sustain': 0.1};

let detune = 0;

const power = Math.pow(2, 1 / 12);

let calculateNewNote = function (base, newnote) {
  return base * Math.pow(power, newnote);
};

//watch for changes across the document
// and track them
var targetNode = document.body;

// Options for the observer (which mutations to observe)
var config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {

        if (mutation.type == 'childList') {
            if (mutation.addedNodes.length > 0) {
              let added =  mutation.addedNodes;
              detune = 0;
              for (let i=0;i<added.length;i++) {
                console.log('A child node has been added.');
                playEnvelopeTone(audioCtx,calculateNewNote(260.25, i),0.5,0.5,adsrEnv, detune);
              }

            } else {
              let removed =  mutation.removedNodes;
              detune = 0;
              for (let j=(removed.length -1 );j>-1;j--) {
                console.log('A child node has been removed.');
                playEnvelopeTone(audioCtx, calculateNewNote(440.3, j),0.5,0.5,adsrEnv, detune);
              };

           }
        }
        else if (mutation.type == 'attributes') {
          detune = 90;
          playEnvelopeTone(audioCtx,340.25,0.5,0.5,adsrEnv,detune);
          console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
//observer.disconnect();

}
checkButtons();
