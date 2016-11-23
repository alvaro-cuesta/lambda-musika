import React from 'react'

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Editor from 'components/Editor'
import Musika from 'Musika'
import {Int16Stereo, makeWAVURL} from 'PCM'

const DEFAULT_SCRIPT = require('!raw!examples/default')

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fn: () => [0, 0],
      length: 0,
      renderTime: undefined,
      sampleRate: undefined,
    }
  }

  componentDidMount() {
    this.setState({sampleRate: this.refs.player.getSampleRate()})
  }

  handleUpdate() {
    let code = this.refs.editor.get().getValue()
    let builder = new Function('Musika', 'sampleRate', 'setLength', code)

    let length
    let fn = builder(Musika, this.state.sampleRate, l => length = l)

    this.setState({builder, fn, length})
  }

  handleRender() {
    let {playing, builder} = this.state
    let renderSampleRate = this.refs.renderSampleRate.value

    this.refs.player.pause()
    this.handleUpdate()

    let length
    let fn = builder(Musika, renderSampleRate, l => length = l)

    let download = document.createElement('a')
    let buffer = Int16Stereo(renderSampleRate, length, fn)
    download.download = 'render.wav'
    download.href = makeWAVURL(buffer, 2, renderSampleRate)
    download.click()

    URL.revokeObjectURL(download.href)
  }

  handlePlayingChange(playing) {
    this.setState({renderTime: undefined})
  }

  handleRenderTime(renderTime) {
    this.setState({renderTime})
  }

  render() {
    let {fn, length, renderTime, sampleRate} = this.state
    let {bufferLength} = this.props

    return <div className='Musika-App ace-tomorrow-night-eighties ace_dark'>
      <Player ref='player' fn={fn} length={length} bufferLength={bufferLength}
        onPlayingChange={this.handlePlayingChange.bind(this)}
        onRenderTime={this.handleRenderTime.bind(this)}
      />
      <CPULoad renderTime={renderTime} bufferLength={bufferLength} sampleRate={sampleRate} />
      <Editor ref='editor' defaultValue={DEFAULT_SCRIPT} />
      <div className='Musika-bottomPanel'>
        <button onClick={this.handleUpdate.bind(this)}>Update</button>
        {length
          ? <div>
              <button onClick={this.handleRender.bind(this)}>Render</button>
              <select ref='renderSampleRate' defaultValue={44100}>
                <option value={8000}>8000Hz</option>
                <option value={11025}>11025Hz</option>
                <option value={16000}>16000Hz</option>
                <option value={22500}>22500Hz</option>
                <option value={32000}>32000Hz</option>
                <option value={37800}>37800Hz</option>
                <option value={44100}>44100Hz</option>
                <option value={48000}>48000Hz</option>
                <option value={88200}>88200Hz</option>
                <option value={96000}>96000Hz</option>
              </select>
            </div>
          : null
        }
      </div>
    </div>
  }
}

App.defaultProps = {
  bufferLength: 8192,
}
