import React from 'react'

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Editor from 'components/Editor'
import compile from 'compile'
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
    this.handleUpdate()
  }

  handleUpdate() {
    let editor = this.refs.editor.editor
    let source = editor.getValue()
    let session = editor.getSession()

    session.setAnnotations()

    let {fn, length, error} = compile(source, this.state.sampleRate)

    if (error) {
      session.setAnnotations([{
        type: 'error',
        text: `${error.name}: ${error.message}`,
        row: error.row,
        column: error.column,
      }])
      console.error(error)
      throw error.e
    }

    this.setState({fn, length})
  }

  handleRender() {
    this.refs.player.pause()

    this.handleUpdate()

    let source = this.refs.editor.editor.getValue()
    let sampleRate = this.refs.renderSampleRate.value
    let {fn, length, error} = compile(code, sampleRate)

    if (!error) {
      let buffer = Int16Stereo(sampleRate, length, fn)

      let link = document.createElement('a')
      link.download = 'render.wav'
      link.href = makeWAVURL(buffer, 2, sampleRate)
      link.click()

      URL.revokeObjectURL(link.href)
    }
  }

  handlePlayingChange(playing) {
    this.setState({renderTime: undefined})
  }

  handleRenderTime(renderTime) {
    this.setState({renderTime})
  }

  handleError(error) {
    this.refs.editor.editor.getSession().setAnnotations([{
      type: 'error',
      text: `${error.name}: ${error.message}`,
      row: error.row,
      column: error.column,
    }])
    console.error(error)
    throw error.e
  }

  handleTogglePlay() {
    this.refs.player.togglePlay()
  }

  render() {
    let {fn, length, renderTime, sampleRate} = this.state
    let {bufferLength} = this.props

    return <div className='Musika-App'>
      <Player ref='player' fn={fn} length={length} bufferLength={bufferLength}
        onPlayingChange={this.handlePlayingChange.bind(this)}
        onRenderTime={this.handleRenderTime.bind(this)}
        onError={this.handleError.bind(this)}
      />
      <CPULoad renderTime={renderTime} bufferLength={bufferLength} sampleRate={sampleRate} />
      <Editor ref='editor' defaultValue={DEFAULT_SCRIPT}
        onUpdate={this.handleUpdate.bind(this)}
        onTogglePlay={this.handleTogglePlay.bind(this)}
      />
      <div className='Musika-bottomPanel'>
        <button onClick={this.handleUpdate.bind(this)}>Update</button>
        {length
          ? <span>
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
            </span>
          : null
        }
      </div>
    </div>
  }
}

App.defaultProps = {
  bufferLength: 8192,
}
