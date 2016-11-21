import React from 'react'
import ReactDOM from 'react-dom'

import App from 'components/App'

ReactDOM.render(<App />, document.getElementById('container'));

/*

ALTERNATE RENDER METHOD

Instead of using ScriptProcessorNode. Worth considering again.

function StereoBuffer(/*sampleRate, *//*length, fn) {
  let frameCount = Math.floor(length * audioCtx.sampleRate);
  let buffer = audioCtx.createBuffer(2, frameCount, audioCtx.sampleRate);

  let lChannel = buffer.getChannelData(0);
  let rChannel = buffer.getChannelData(1);

  for (let i = 0; i < frameCount; i++) {
    let t = i/audioCtx.sampleRate;
    let [l, r] = fn(t);
    lChannel[i] = l;
    rChannel[i] = r;
  }

  return buffer;
}

let source = audioCtx.createBufferSource();
source.buffer = StereoBuffer(SONG_LENGTH, makeComposition());
source.connect(audioCtx.destination);
source.start();

*/
