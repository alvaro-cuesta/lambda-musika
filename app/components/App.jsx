import React from 'react'

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Editor from 'components/Editor'
import { Icon, IconStack } from 'components/Icon'

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
    }

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }

  componentDidMount() {
    this.handleUpdate()
  }

  componentWillUnmount() {
    this.audioCtx.close()
  }

  handleUpdate() {
    let editor = this.refs.editor.editor
    let source = editor.getValue()

    let {fn, length, error} = compile(source, this.audioCtx.sampleRate)

    this.refs.editor.maybeAddError(error) // Throws
    this.setState({fn, length})
  }

  handleRender() {
    this.refs.player.pause()

    this.handleUpdate()

    let source = this.refs.editor.editor.getValue()
    let sampleRate = this.refs.renderSampleRate.value

    let {fn, length, error: compileError} = compile(source, sampleRate)
    this.refs.editor.maybeAddError(compileError) // Throws

    let {buffer, error: runtimeError} = Int16Stereo(sampleRate, length, fn)
    this.refs.editor.maybeAddError(runtimeError) // Throws

    let link = document.createElement('a')
    link.download = 'render.wav'
    link.href = makeWAVURL(buffer, 2, sampleRate)
    link.click()

    URL.revokeObjectURL(link.href)
  }

  handlePlayingChange(playing) {
    this.setState({renderTime: undefined})
  }

  handleRenderTime(renderTime) {
    this.setState({renderTime})
  }

  handleError(error) {
    try {
      this.refs.editor.maybeAddError(error)
    } catch (e) {/* IGNORE EXCEPTION! Let the player try to recover */}
  }

  handleTogglePlay() {
    this.refs.player.togglePlay()
  }

  handleKeyDown(e) {
    let {ctrlKey, shiftKey, altKey, keyCode} = e

    // Prevent CTRL-S from opening the webpage save dialog
    if (ctrlKey && !shiftKey && !altKey && keyCode === 83 /* S */) {
      e.preventDefault()
    }
  }

  handleKeyUp({ctrlKey, shiftKey, altKey, keyCode}) {
    if (ctrlKey && !shiftKey && !altKey) {
      if (keyCode === 83 /* S */ ) {
        this.handleUpdate()
      } else if (keyCode === 32 /* SPACE */) {
        this.handleTogglePlay()
      }
    }
  }

  render() {
    let {fn, length, renderTime} = this.state
    let {bufferLength} = this.props

    return <div className='Musika-App'
      onKeyDown={this.handleKeyDown.bind(this)} onKeyUp={this.handleKeyUp.bind(this)}
      // {/*Make element focusable (or it won't catch kotkeys when clicked on empty zones)*/}
      tabIndex='0'
    >
      <Player ref='player' fn={fn} length={length} bufferLength={bufferLength}
        audioCtx={this.audioCtx}
        onPlayingChange={this.handlePlayingChange.bind(this)}
        onRenderTime={this.handleRenderTime.bind(this)}
        onError={this.handleError.bind(this)}
      />
      <CPULoad renderTime={renderTime} bufferLength={bufferLength} sampleRate={this.audioCtx.sampleRate} />
      <Editor ref='editor' defaultValue={DEFAULT_SCRIPT} />
      <div className='Musika-bottomPanel'>
        <button className='color-orange' onClick={this.handleUpdate.bind(this)} title='CTRL-S'>
          <Icon name='share' /> Commit
        </button>
        <span className='color-purple'>
          <button onClick={this.handleUpdate.bind(this)} title='New'>
            <Icon name='file' />
          </button>
          <button onClick={this.handleUpdate.bind(this)} title='Load'>
            <IconStack icons={[
              {name: 'file', className: 'fa-stack-1x'},
              {name: 'arrow-left', className: 'icon-stack-0-5x', inverse: true, style: {left: '-0.3em'}},
            ]}
            />
          </button>
          <button onClick={this.handleUpdate.bind(this)} title='Save'>
            <span className="icon-stack">
              <i className="fa fa-file fa-stack-1x"></i>
              <i className="fa fa-arrow-right fa-inverse icon-stack-0-5x" style={{left: '-0.3em'}}></i>
            </span>
          </button>
        </span>
        <span className='color-blue'>
          <button onClick={this.handleUpdate.bind(this)} title='Default song'>
            <Icon name='file-text' />
          </button>
        </span>
        {length
          ? <span className='color-red'>
              <button onClick={this.handleRender.bind(this)} title='Render'>
                <Icon name='download' /> .WAV
              </button>
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

App.propTypes = {
  bufferLength: React.PropTypes.number,
}

App.defaultProps = {
  bufferLength: 8192,
}
