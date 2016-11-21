import React from 'react'
import Codemirror from 'react-codemirror'
require('codemirror/lib/codemirror.css')
//require('codemirror/theme/monokai.css')
require('codemirror/mode/javascript/javascript')
require('codemirror/addon/dialog/dialog')
require('codemirror/addon/dialog/dialog.css')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/search/search')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/comment/continuecomment')
require('codemirror/addon/display/rulers')

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Musika from 'Musika'
import {Int16Stereo, makeWAVURL} from 'PCM'

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
    this.handleUpdate()
  }

  handleUpdate() {
    this.setState({length: undefined})

    let code = this.refs.code.getCodeMirror().getValue()
    let builder = new Function('Musika', 'sampleRate', 'setLength', code)
    let fn = builder(Musika, this.state.sampleRate, this.setLength.bind(this))

    this.setState({builder, fn})
  }

  handleRender() {
    let {playing, builder} = this.state
    let renderSampleRate = this.refs.renderSampleRate.value

    if (playing) {
      this.handlePlay()
    }

    this.handleUpdate()

    let length
    let fn = builder(Musika, renderSampleRate, (l) => length = l)

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

  setLength(length) {
    this.setState({length})
  }

  render() {
    let {fn, length, renderTime, sampleRate} = this.state
    let {bufferLength} = this.props

    return <div>
      <Player ref='player' fn={fn} length={length} bufferLength={bufferLength}
        onPlayingChange={this.handlePlayingChange.bind(this)}
        onRenderTime={this.handleRenderTime.bind(this)}
      />
      <CPULoad renderTime={renderTime} bufferLength={bufferLength} sampleRate={sampleRate} />
      <Codemirror ref='code'
        defaultValue={require('!raw!./default-song.js')}
        options={{
          lineNumbers: true,
          mode: 'javascript',
          matchBrackets: true,
          continueComments: true,
          rulers: [{column: 80}],
          //theme: 'monokai',
        }}
      />
      <button onClick={this.handleUpdate.bind(this)}>Update</button>
      <div>
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
    </div>
  }
}

App.defaultProps = {
  bufferLength: 8192,
}
