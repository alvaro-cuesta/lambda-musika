import React from 'react'

import TimeSlider from 'components/TimeSlider'

// Audio player component which receives a function `fn` to generate audio
export default class Player extends React.Component {
  constructor(props) {
    super(props)

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    this.state = {
      audioCtx,
      scriptProcessor: undefined,
      playing: false,
      lastFrame: 0,
      renderTime: undefined,
    }
  }

  /* Public API */

  getSampleRate() {
    return this.state.audioCtx.sampleRate
  }

  play() {
    let {audioCtx, scriptProcessor} = this.state
    let {onPlayingChange} = this.props

    if (!this.state.playing) {
      this.setState({playing: true})
      scriptProcessor.connect(audioCtx.destination)
      if (typeof onPlayingChange !== 'undefined') {
        onPlayingChange(true)
      }
    }
  }

  pause() {
    let {audioCtx, scriptProcessor} = this.state
    let {onPlayingChange} = this.props

    if (this.state.playing) {
      this.setState({playing: false})
      scriptProcessor.disconnect(audioCtx.destination)
      if (typeof onPlayingChange !== 'undefined') {
        onPlayingChange(false)
      }
    }
  }

  togglePlay() {
    if (this.state.playing) {
      this.pause()
    } else {
      this.play()
    }
  }

  stop() {
    let {audioCtx, scriptProcessor, playing} = this.state
    let {onPlayingChange} = this.props

    this.setState({
      playing: false,
      lastFrame: 0,
    })

    if (playing) {
      scriptProcessor.disconnect(audioCtx.destination)
      if (typeof onPlayingChange !== 'undefined') {
        onPlayingChange(false)
      }
    }
  }

  /* Private API and lifecycle */

  componentDidMount() {
    this.makeScriptProcessor(this.props.bufferLength)
  }

  // Reinstantiate ScriptProcessorNode if we receive new buffer length
  componentWillReceiveProps(nextProps) {
    if (this.props.bufferLength !== nextProps.bufferLength) {
      this.makeScriptProcessor(nextProps.bufferLength)
    }
  }

  // Instantiate ScriptProcessorNode
  makeScriptProcessor(bufferLength) {
    let {audioCtx, scriptProcessor} = this.state
    let {sampleRate} = audioCtx

    if (typeof scriptProcessor !== 'undefined') {
      scriptProcessor.disconnect(audioCtx.destination)
    }

    scriptProcessor = audioCtx.createScriptProcessor(bufferLength, 0, 2)
    scriptProcessor.onaudioprocess = this.handleAudioProcess.bind(this)

    this.setState({scriptProcessor})
  }

  // Fills the audio buffer - this is what actually plays the sound
  handleAudioProcess(audioProcessingEvent) {
    let {audioCtx: {sampleRate}, lastFrame} = this.state
    let {fn, length, onRenderTime} = this.props

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
      let [l, r] = fn(t)
      lChannel[i] = l
      rChannel[i] = r
    }
    lastFrame += buffer.length

    // Continue playing or stop if we've reached the end
    if (lastFrame > length*sampleRate) {
      this.stop()
    } else {
      this.setState({lastFrame})
      if (typeof onRenderTime !== 'undefined') {
        onRenderTime(performance.now() - start)
      }
    }
  }

  // Handle seeking from controls
  handleTime(time) {
    this.setState({lastFrame: time * this.state.audioCtx.sampleRate})
  }

  render() {
    let {audioCtx: {sampleRate}, playing, lastFrame} = this.state
    let {length, bufferLength} = this.props

    return <div className='Musika-Player'>
      <button onClick={this.togglePlay.bind(this)}>{playing ? '⏸' : '▶'}</button>
      {length
        ? <TimeSlider length={length} value={lastFrame/sampleRate} onChange={this.handleTime.bind(this)} />
        : null
      }
    </div>
  }
}

Player.propTypes = {
  fn: React.PropTypes.func.isRequired,
  length: React.PropTypes.number,
  bufferLength: React.PropTypes.number,
  onPlayingChange: React.PropTypes.func,
  onRenderTime: React.PropTypes.func,
}

Player.defaultProps = {
  bufferLength: 8192,
}