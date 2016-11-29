import React from 'react'

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Editor from 'components/Editor'
import { Icon, IconStack } from 'components/Icon'

import compile from 'compile'
import {Int16Stereo, makeWAVURL} from 'PCM'

import EXAMPLE_SCRIPTS from 'examples'

const DEFAULT_SCRIPT = require('!raw!examples/default')

function ConfirmPanel({title, loadName, onAccept, onCancel}) {
  return <div>
    {title ? <h1>{title}</h1> : null}
    <p>
      This will delete <em>everything</em>, including your undo history.<br/>
      <b>It cannot be undone.</b>
    </p>
    {loadName
      ? <p>Discard all changes and load «<em>{loadName}</em>»?</p>
      : <p>Discard all changes?</p>}
    <button onClick={onAccept}>Accept</button>
    {' '}
    <button onClick={onCancel}>Cancel</button>
  </div>
}

ConfirmPanel.propTypes = {
  title: React.PropTypes.string,
  loadName: React.PropTypes.string,
  onAccept: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
}

function ButtonWithPanel({panel, children, ...other}) {
  return <div className={`panel-container${panel ? ' open' : ''}`}>
    {panel ? <div className='panel'>{panel}</div> : null}
    <button {...other}>{children}</button>
  </div>
}

ButtonWithPanel.propTypes = {
  panel: React.PropTypes.node,
}

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
      newConfirming: false,
      loadConfirming: false,
      examplesOpen: false,
      changesMade: true,
    }

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }

  new(source) {  // Throws
    this.setState({fn: undefined, length: undefined})
    this.refs.editor.new(source)
    this.closePanels()
    this.markClean()
    this.handleUpdate()  // Throws
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
    this.setState({changesMade: false})
  }

  // HACK! This shouldn't be polled, but there seems to be no event emitted
  //       after dirtyCounter changes
  handleDirtyInterval() {
    this.setState({changesMade: !this.refs.editor.isClean()})
  }

  /* Events */

  handleUpdate() {  // Throws
    let editor = this.refs.editor.editor
    let source = editor.getValue()

    this.handleBackup()

    let {fn, length, error} = compile(source, this.audioCtx.sampleRate)

    this.refs.editor.maybeAddError(error)  // Throws
    this.setState({fn, length})
  }

  handleRender() {  // Throws
    this.refs.player.pause()

    this.handleUpdate()  // Throws

    let source = this.refs.editor.editor.getValue()
    let sampleRate = this.refs.renderSampleRate.value

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

  /* Panels */

  handleNew() {
    if (this.state.changesMade) {
      this.setState({newConfirming: true})
    } else {
      this.handleNewConfirmed()
    }
  }

  handleNewConfirmed() {
    this.new()
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
        this.setState(
          {
            loadConfirming: {
              name: f.name,
              content: result,
            }
          },
          !this.state.changesMade ? this.handleLoadConfirmed : null
        )
      }
      r.readAsText(f)
    }

    input.click()
  }

  handleLoadConfirmed() {
    this.new(this.state.loadConfirming.content.replace(/\r\n/g, '\n'))
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

  handleExamples() {
    this.setState({
      examplesOpen: true,
      examplesConfirming: false
    })
  }

  handleExamplesConfirmed() {
    this.new(EXAMPLE_SCRIPTS[this.state.examplesConfirming])
  }

  closePanels() {
    this.setState({
      newConfirming: false,
      loadConfirming: false,
      examplesOpen: false,
      examplesConfirming: false,
    })
  }

  handleMouseDown({target, button}) {
    if (button !== 0 /* LEFT BUTTON*/) return

    for (let node = target; node; node = node.parentNode) {
      if (node.className === 'panel') return
    }

    this.closePanels()
  }

  render() {
    let {fn, length, renderTime, newConfirming, loadConfirming, examplesOpen, examplesConfirming} = this.state
    let {bufferLength} = this.props

    let initialScript = history.state && history.state.source !== 'undefined'
      ? history.state.source
      : DEFAULT_SCRIPT

    //

    let updateControls = <button className='color-orange'
      onClick={this.handleUpdate.bind(this)}
      title='CTRL-S'
      aria-label='Commit (CTRL-S)'
    >
      <Icon name='share' /> Commit
    </button>

    //

    let newConfirmPanel = newConfirming
      ? <ConfirmPanel
          title='New script'
          onAccept={this.handleNewConfirmed.bind(this)}
          onCancel={this.closePanels.bind(this)}
        />
      : null

    let loadConfirmPanel = loadConfirming
      ? <ConfirmPanel
          title='Load file'
          loadName={loadConfirming.name}
          onAccept={this.handleLoadConfirmed.bind(this)}
          onCancel={this.closePanels.bind(this)}
        />
      : null

    let examplesPanel = examplesOpen
      ? <div>
          <h1>Examples</h1>
          {examplesConfirming === false
            ? <div>
                <ul>
                  {Object.keys(EXAMPLE_SCRIPTS).map(name => {
                    let onClick = (e) => {
                      e.preventDefault()
                      this.setState(
                        {examplesConfirming: name},
                        !this.state.changesMade ? this.handleExamplesConfirmed : null
                      )
                    }

                    return <li key={name}>
                      <a href='' onClick={onClick}>{name}</a>
                    </li>
                  })}
                </ul>
                <button onClick={this.closePanels.bind(this)}>Close</button>
              </div>
            : <ConfirmPanel
                loadName={examplesConfirming}
                onAccept={this.handleExamplesConfirmed.bind(this)}
                onCancel={this.closePanels.bind(this)}
              />}
        </div>
      : null

    let fileControls = <div className='color-purple'>
      <ButtonWithPanel onClick={this.handleNew.bind(this)}
        panel={newConfirmPanel}
        title='New'
        aria-label='New'
      >
        <Icon name='file' />
      </ButtonWithPanel>

      <ButtonWithPanel onClick={this.handleLoad.bind(this)}
        panel={loadConfirmPanel}
        title='Load'
        aria-label='Load'
      >
        <IconStack icons={[
            {name: 'file'},
            {name: 'arrow-left', inverse: true, style: {
              fontSize: '0.5em',
              left: '-0.4em',
            }},
          ]}
        />
      </ButtonWithPanel>

      <button onClick={this.handleSave.bind(this)}
        title='Save'
        aria-label='Save'
      >
        <IconStack icons={[
            {name: 'file'},
            {name: 'arrow-right', inverse: true, style: {
              fontSize: '0.5em',
              left: '-0.4em'
            }},
          ]}
        />
      </button>
    </div>

    //

    let exampleControls = <div className='color-blue'>
      <ButtonWithPanel onClick={this.handleExamples.bind(this)}
        panel={examplesPanel}
        title='Examples'
        aria-label='Examples'
      >
        <Icon name='file-text' />
      </ButtonWithPanel>
    </div>

    //

    let renderControls = length
      ? <div className='color-red'>
          <button onClick={this.handleRender.bind(this)}
            title='Render'
            aria-label='Render'
          >
            <Icon name='download' /> .WAV
          </button>

          <select ref='renderSampleRate'
            defaultValue={44100}
            title='Render sample rate'
            aria-label='Render sample rate'
          >
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

    let aboutControls = <a className='github right'
      href='https://www.github.com/alvaro-cuesta/lambda-musika'
      target="_blank"
    >
      <Icon name='github' title='alvaro-cuesta/lambda-musika at GitHub' />
    </a>

    //

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

      <div className='panel-wrapper'>
        <div className='Musika-bottomPanel'>
          {updateControls}
          {fileControls}
          {exampleControls}
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
