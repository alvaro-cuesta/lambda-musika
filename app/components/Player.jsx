import React from 'react'
import PropTypes from 'prop-types'

import TimeSlider from 'components/TimeSlider'
import TimeSeeker from 'components/TimeSeeker'
import Icon from 'components/Icon'

import ScriptProcessorPlayer from 'ScriptProcessorPlayer'

// Audio player component which receives a function `fn` to generate audio
export default class Player extends React.PureComponent {
  constructor(props) {
    super(props)

    this.newFnPlayer(props)

    this.state = {
      playing: false,
      lastFrame: 0,
    }
  }

  /* Public API */

  play() {
    this.fnPlayer.play()
  }

  pause() {
    this.fnPlayer.pause()
  }

  togglePlay() {
    this.fnPlayer.togglePlay()
  }

  stop() {
    this.fnPlayer.stop()
  }

  /* Private API and lifecycle */

  newFnPlayer({audioCtx, bufferLength, fn, length, onRenderTime, onError}, playing, lastFrame) {
    if (this.fnPlayer) {
      this.fnPlayer.onPlayingChange = undefined  // Do not notify of stop...
      this.fnPlayer.stop()  // ..because we just want to detroy and recreate
    }

    this.fnPlayer = new ScriptProcessorPlayer(audioCtx, bufferLength, fn, length, playing, lastFrame)
    this.fnPlayer.onPlayingChange = this.handlePlayingChange.bind(this)
    this.fnPlayer.onFrame = this.handleFrame.bind(this)
    this.fnPlayer.onRenderTime = onRenderTime
    this.fnPlayer.onError = onError
  }

  componentWillReceiveProps(nextProps) {
    if ( (this.props.audioCtx !== nextProps.audioCtx)
      || (this.props.bufferLength !== nextProps.bufferLength)
    ) {
      let {playing, lastFrame} = this.state
      this.newFnPlayer(nextProps, playing, lastFrame)
    }

    if (this.props.fn !== nextProps.fn) {
      this.fnPlayer.setFunction(nextProps.fn)
    }

    if (this.props.length !== nextProps.length) {
      this.fnPlayer.setLength(nextProps.length)
    }

    if (this.props.onRenderTime !== nextProps.onRenderTime) {
      this.fnPlayer.onRenderTime = nextProps.onRenderTime
    }

    if (this.props.onError !== nextProps.onError) {
      this.fnPlayer.onError = nextProps.onError
    }
  }

  componentWillUnmount() {
    this.fnPlayer.stop()
  }

  // Handle seeking from controls
  handleTime(time) {
    let lastFrame = time * this.props.audioCtx.sampleRate
    this.fnPlayer.setFrame(lastFrame)
    this.setState({lastFrame})
  }

  // Handle frame updates as time progresses
  handleFrame(lastFrame) {
    this.setState({lastFrame})
  }

  handlePlayingChange(playing) {
    this.setState({playing})
    this.props.onPlayingChange(playing)
  }

  render() {
    let {playing, lastFrame} = this.state
    let {audioCtx: {sampleRate}, fn, length} = this.props

    let title = `${playing ? 'Pause' : 'Play'} (CTRL-Space)`
    let hasFn = typeof fn !== 'undefined'

    return <div className='Musika-Player'>
      <button onClick={this.togglePlay.bind(this)}
        className={hasFn ? 'color-orange' : 'color-grey'}
        disabled={!hasFn}
        title={title}
        aria-label={title}
      >
        <Icon name={playing ? 'pause' : 'play'} />
      </button>

      {hasFn
        ? (length
            ? <TimeSlider length={length} value={lastFrame/sampleRate} onChange={this.handleTime.bind(this)} />
            : <TimeSeeker value={lastFrame/sampleRate} onChange={this.handleTime.bind(this)} />)
        : null}
    </div>
  }
}

const AudioContext = window.AudioContext || window.webkitAudioContext
Player.propTypes = {
  audioCtx: PropTypes.instanceOf(AudioContext).isRequired,
  fn: PropTypes.func,
  length: PropTypes.number,
  bufferLength: PropTypes.number,
  onPlayingChange: PropTypes.func,
  onRenderTime: PropTypes.func,
  onError: PropTypes.func,
}

Player.defaultProps = {
  bufferLength: 8192,
}
