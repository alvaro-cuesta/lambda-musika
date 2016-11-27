import React from 'react'

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Editor from 'components/Editor'
import { Icon, IconStack } from 'components/Icon'

import compile from 'compile'
import {Int16Stereo, makeWAVURL} from 'PCM'

const DEFAULT_SCRIPT = require('!raw!examples/default')

function ButtonWithPanel({panel, children, ...other}) {
  return <div className={`panel-container${panel ? ' open' : ''}`}>
    {panel ? <div className='panel'>{panel}</div> : null}
    <button {...other}>{children}</button>
  </div>
}

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fn: () => [0, 0],
      length: 0,
      renderTime: undefined,
      newConfirming: false,
      loadConfirming: false,
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
    // Escape closes panels
    else if (!ctrlKey && !shiftKey && !altKey && keyCode === 27 /* Escape */) {
      this.closeConfirmations()
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

  handleNew() {
    this.setState({
      newConfirming: true,
      loadConfirming: false,
    })
  }

  handleNewConfirmed() {
    this.refs.editor.new()
    this.handleUpdate()
    this.closeConfirmations()
  }

  handleLoad() {
    let input = document.createElement('input')
    input.type = 'file'
    input.accept = '.musika,application/javascript'
    input.onchange = () => {
      let f = input.files[0]

      if (!f) return

      let r = new FileReader()
      r.onload = ({target: {result}}) => {
        this.setState({
          newConfirming: false,
          loadConfirming: {
            name: f.name,
            content: result,
          }
        })
      }
      r.readAsText(f)
    }

    input.click()
  }

  handleLoadConfirmed() {
    this.refs.editor.new(this.state.loadConfirming.content)
    this.handleUpdate()
    this.closeConfirmations()
  }

  handleSave() {
    let script = this.refs.editor.editor.getValue()
    let blob = new Blob([script], {type: 'application/javascript;charset=utf-8'})
    let url = URL.createObjectURL(blob)

    let link = document.createElement('a')
    link.download = 'script.musika'
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
  }

  handleDefault() {

  }

  closeConfirmations() {
    this.setState({
      newConfirming: false,
      loadConfirming: false,
    })
  }

  handleMouseDown({target, button}) {
    if (button !== 0 /* LEFT BUTTON*/) return

    for (let node = target; node; node = node.parentNode) {
      if (node.className === 'panel') return
    }

    this.closeConfirmations()
  }

  render() {
    let {fn, length, renderTime, newConfirming, loadConfirming} = this.state
    let {bufferLength} = this.props

    //

    let updateControls = <button className='color-orange' onClick={this.handleUpdate.bind(this)} title='CTRL-S'>
      <Icon name='share' /> Commit
    </button>

    //

    let newConfirmPanel = newConfirming
      ? <div>
          <h1>New file</h1>
          <p>This will delete everything, including your undo history. <b>It cannot be undone.</b></p>
          <p>Discard all changes?</p>
          <button onClick={this.handleNewConfirmed.bind(this)}>Accept</button>
          {' '}
          <button onClick={this.closeConfirmations.bind(this)}>Cancel</button>
        </div>
      : null

    let loadConfirmPanel = loadConfirming
      ? <div>
          <h1>Load file</h1>
          <p>This will delete everything, including your undo history. <b>It cannot be undone.</b></p>
          <p>Discard all changes and load «<em>{loadConfirming.name}</em>»?</p>
          <button onClick={this.handleLoadConfirmed.bind(this)}>Accept</button>
          {' '}
          <button onClick={this.closeConfirmations.bind(this)}>Cancel</button>
        </div>
      : null

    let fileControls = <div className='color-purple'>
      <ButtonWithPanel onClick={this.handleNew.bind(this)} title='New' panel={newConfirmPanel}>
        <Icon name='file' />
      </ButtonWithPanel>
      <ButtonWithPanel onClick={this.handleLoad.bind(this)} title='Load' panel={loadConfirmPanel} >
        <IconStack icons={[
            {name: 'file'},
            {name: 'arrow-left', inverse: true, style: {fontSize: '0.5em', left: '-0.4em'}},
          ]}
        />
      </ButtonWithPanel>
      <button onClick={this.handleSave.bind(this)} title='Save'>
        <IconStack icons={[
            {name: 'file'},
            {name: 'arrow-right', inverse: true, style: {fontSize: '0.5em', left: '-0.4em'}},
          ]}
        />
      </button>
    </div>

    //

    let defaultControls = <div className='color-blue'>
      <button onClick={this.handleDefault.bind(this)} title='Default song'>
        <Icon name='file-text' />
      </button>
    </div>

    //

    let renderControls = length
      ? <div className='color-red'>
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
        </div>
      : null

    //

    let aboutControls = <a className='right'
      href='https://www.github.com/alvaro-cuesta/lambda-musika'
      target="_blank"
    >
      <Icon name='github' title='alvaro-cuesta/lambda-musika at GitHub' />
    </a>

    //

    return <div className='Musika-App'
      onKeyDown={this.handleKeyDown.bind(this)} onKeyUp={this.handleKeyUp.bind(this)}
      onMouseDown={this.handleMouseDown.bind(this)}
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
      <div className='panel-wrapper'>
        <div className='Musika-bottomPanel'>
          {updateControls}
          {fileControls}
          {defaultControls}
          {renderControls}
          {aboutControls}
        </div>
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
