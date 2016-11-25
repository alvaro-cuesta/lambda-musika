import { tryParseException } from 'compile'

export default class ScriptProcessorPlayer {
  constructor(audioCtx, bufferLength, fn, length, playing = false, lastFrame = 0) {
    this.audioCtx = audioCtx
    this.fn = fn
    this.length = length

    this.scriptProcessor = audioCtx.createScriptProcessor(bufferLength, 0, 2)
    this.scriptProcessor.onaudioprocess = this.handleAudioProcess.bind(this)

    this.playing = playing
    this.lastFrame = lastFrame

    if (playing) {
      this.scriptProcessor.connect(audioCtx.destination)
    }
  }

  play() {
    let {audioCtx, scriptProcessor, playing, onPlayingChange} = this

    if (!playing) {
      this.playing = true
      scriptProcessor.connect(audioCtx.destination)
      if (typeof onPlayingChange !== 'undefined') onPlayingChange(true)
    }
  }

  pause() {
    let {audioCtx, scriptProcessor, playing, onPlayingChange} = this

    if (playing) {
      this.playing = false
      scriptProcessor.disconnect(audioCtx.destination)
      if (typeof onPlayingChange !== 'undefined') onPlayingChange(false)
    }
  }

  togglePlay() {
    if (this.playing) {
      this.pause()
    } else {
      this.play()
    }
  }

  stop() {
    this.pause()
    this.lastFrame = 0

    let {onFrame} = this
    if (typeof onFrame !== 'undefined') onFrame(0)
  }

  setFrame(frame) {
    this.lastFrame = frame
  }

  setFunction(fn) {
    this.fn = fn
  }

  setLength(length) {
    this.length = length
  }

  handleAudioProcess(audioProcessingEvent) {
    let {audioCtx: {sampleRate}, lastFrame, fn, length, onFrame, onRenderTime, onError} = this

    let buffer = audioProcessingEvent.outputBuffer
    let lChannel = buffer.getChannelData(0)
    let rChannel = buffer.getChannelData(1)

    // Fill the buffer and time how long it takes
    let start;
    if (typeof onRenderTime !== 'undefined') {
      start = performance.now()
    }
    for (let i = 0; i < buffer.length; i++) {
      let t = (i + lastFrame)/sampleRate
      try {
        let [l, r] = fn(t)
        lChannel[i] = l
        rChannel[i] = r
      } catch (e) {
        if (typeof onError !== 'undefined') {
          onError(tryParseException(e))
        }
        // Try to recover using backup fn
        if (this.lastFn) {
          fn = this.fn = this.lastFn
          this.lastFn = undefined
          i = 0
          continue
        }
        // No backup fn, just stop
        else {
          this.pause()
          return
        }
      }
    }

    // Advance frame
    lastFrame += buffer.length
    if (typeof onFrame !== 'undefined') onFrame(lastFrame)

    // Save this (presumably working) fn as a backup fn
    if (typeof this.lastFn === 'undefined') this.lastFn = fn

    // Continue playing or stop if we've reached the end
    if (length && lastFrame > length*sampleRate) {
      this.stop()
    } else {
      this.lastFrame = lastFrame
      if (typeof onRenderTime !== 'undefined') {
        onRenderTime(performance.now() - start)
      }
    }
  }
}
