import React from 'react'
import PropTypes from 'prop-types'

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Editor from 'components/Editor'
import BottomBar from 'components/BottomBar'

import compile from 'compile'
import {Int16Stereo, makeWAVURL} from 'PCM'

const DEFAULT_SCRIPT = require('!raw!examples/default')

// HACK: Setting it as App.XXX_INTERVAL yields undefined inside component!?
const BACKUP_INTERVAL = 1000
const DIRTY_INTERVAL = 100

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fn: undefined,
      length: 0,
      renderTime: undefined,
      isClean: false,
    }

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }

  closePanels() {
    this.refs.bottomBar.closePanels()
  }

  /* Lifecycle */

  componentDidMount() {
    if (history.state) {
      this.refs.editor.setSerialState(history.state)
    }

    // Mark state as never clean (always asks for confirmation)
    this.refs.editor.markDirty()

    this.backupInterval = setInterval(this.handleBackup.bind(this), BACKUP_INTERVAL)
    this.dirtyInterval = setInterval(this.handleDirtyInterval.bind(this), DIRTY_INTERVAL)

    this.handleUpdate()  // Throws
  }

  componentWillUnmount() {
    this.audioCtx.close()
    clearInterval(this.backupInterval)
    clearInterval(this.dirtyInterval)
  }

  /* Autosave */

  handleBackup() {
    let serialState = this.refs.editor.getSerialState()
    let {source, cursor: {row, column}} = serialState

    if (!history.state
      || history.state.source !== source
      || !history.state.cursor
      || history.state.cursor.row !== row
      || history.state.cursor.column !== column
    ) {
      history.replaceState(serialState, '')
    }
  }

  /* Track document changes */

  markClean() {
    this.refs.editor.markClean()
    this.setState({isClean: true})
  }

  // HACK! This shouldn't be polled, but there seems to be no event emitted
  //       after dirtyCounter changes
  handleDirtyInterval() {
    this.setState({isClean: this.refs.editor.isClean()})
  }

  /* Events */

  handleKeyDown(e) {
    let {ctrlKey, shiftKey, altKey, keyCode} = e

    // Prevent CTRL-S from opening the webpage save dialog
    if (ctrlKey && !shiftKey && !altKey && keyCode === 83 /* S */) {
      e.preventDefault()
    }
    // Escape closes panels
    else if (!ctrlKey && !shiftKey && !altKey && keyCode === 27 /* Escape */) {
      this.closePanels()
    }
  }

  handleKeyUp({ctrlKey, shiftKey, altKey, keyCode}) {
    if (ctrlKey && !shiftKey && !altKey) {
      if (keyCode === 83 /* S */ ) {
        this.handleUpdate()
      } else if (keyCode === 32 /* SPACE */) {
        this.refs.player.togglePlay()
      }
    }
  }

  handleMouseDown({target, button}) {
    if (button !== 0 /* LEFT BUTTON*/) return

    for (let node = target; node; node = node.parentNode) {
      if (node.className === 'panel') return
    }

    this.closePanels()
  }

  /* Player events */

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

  /* Bottom bar events */

  handleUpdate() {  // Throws
    let editor = this.refs.editor.editor
    let source = editor.getValue()

    this.handleBackup()

    let {fn, length, error} = compile(source, this.audioCtx.sampleRate)

    this.refs.editor.maybeAddError(error)  // Throws
    this.setState({fn, length})
  }

  handleNew(source) {  // Throws
    this.setState({fn: undefined, length: undefined})
    this.refs.editor.new(source)
    this.markClean()
    this.handleUpdate()  // Throws
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

    this.markClean()
  }

  handleRender(sampleRate) {  // Throws
    this.refs.player.pause()

    this.handleUpdate()  // Throws

    let source = this.refs.editor.editor.getValue()

    let {fn, length, error: compileError} = compile(source, sampleRate)
    this.refs.editor.maybeAddError(compileError)  // Throws

    let {buffer, error: runtimeError} = Int16Stereo(sampleRate, length, fn)
    this.refs.editor.maybeAddError(runtimeError)  // Throws

    let link = document.createElement('a')
    link.download = 'render.wav'
    link.href = makeWAVURL(buffer, 2, sampleRate)
    link.click()

    URL.revokeObjectURL(link.href)
  }

  /**/

  render() {
    let {fn, length, renderTime, isClean} = this.state
    let {bufferLength} = this.props

    let initialScript = history.state && history.state.source !== 'undefined'
      ? history.state.source
      : DEFAULT_SCRIPT

    return <div className='Musika-App'
      onKeyDown={this.handleKeyDown.bind(this)}
      onKeyUp={this.handleKeyUp.bind(this)}
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

      <CPULoad renderTime={renderTime}
        bufferLength={bufferLength}
        sampleRate={this.audioCtx.sampleRate}
      />

      <Editor ref='editor' defaultValue={initialScript} />

      <BottomBar ref='bottomBar'
        isClean={isClean}
        showRenderControls={typeof length !== 'undefined' && length > 0}
        onUpdate={this.handleUpdate.bind(this)}
        onNew={this.handleNew.bind(this)}
        onSave={this.handleSave.bind(this)}
        onRender={this.handleRender.bind(this)}
      />
    </div>
  }
}

App.propTypes = {
  bufferLength: PropTypes.number,
}

App.defaultProps = {
  bufferLength: 8192,
}
