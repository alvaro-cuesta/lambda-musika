import React from 'react'

import ace from 'brace'

import Player from 'components/Player'
import CPULoad from 'components/CPULoad'
import Editor from 'components/Editor'
import { Icon, IconStack } from 'components/Icon'

import compile from 'compile'
import {Int16Stereo, makeWAVURL} from 'PCM'

import EXAMPLE_SCRIPTS from 'examples'

const DEFAULT_SCRIPT = require('!raw!examples/default')

function ButtonWithPanel({panel, children, ...other}) {
  return <div className={`panel-container${panel ? ' open' : ''}`}>
    {panel ? <div className='panel'>{panel}</div> : null}
    <button {...other}>{children}</button>
  </div>
}

ButtonWithPanel.propType = {
  panel: React.PropTypes.node,
}

// HACK: Setting it as App.BACKUP_INTERVAL yields undefined inside component!?
const BACKUP_INTERVAL = 1000

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fn: () => [0, 0],
      length: 0,
      renderTime: undefined,
      newConfirming: false,
      loadConfirming: false,
      examplesOpen: false,
      changesMade: true,
    }

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }

  componentDidMount() {
    let editor = this.refs.editor.editor

    if (history.state) {
      let {$undoStack, $redoStack, dirtyCounter} = history.state
      let undoManager = new ace.UndoManager()
      let session = editor.getSession()

      if (typeof $undoStack !== 'undefined'
        && typeof $redoStack !== 'undefined'
        && typeof dirtyCounter !== 'undefined'
      ) {
        undoManager.$doc = session
        undoManager.$undoStack = $undoStack
        undoManager.$redoStack = $redoStack
        undoManager.dirtyCounter = dirtyCounter
      }

      session.setUndoManager(undoManager)
    }

    this.handleUpdate()
    this.backupInterval = setInterval(this.handleBackup.bind(this), BACKUP_INTERVAL)
  }

  componentWillUnmount() {
    this.audioCtx.close()
    clearInterval(this.backupInterval)
  }

  handleBackup() {
    let editor = this.refs.editor.editor
    let source = editor.getValue()

    if (!history.state || history.state.source !== source) {
      let {$undoStack, $redoStack, dirtyCounter} = editor.getSession().getUndoManager()
      history.replaceState({source, $undoStack, $redoStack, dirtyCounter}, '')
    }
  }

  handleUpdate() {
    let editor = this.refs.editor.editor
    let source = editor.getValue()

    this.handleBackup()

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
      this.closePanels()
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

  handleChange() {
    if (this.state.changesMade === false) {
      this.setState({changesMade: true})
    }
  }

  /* Panels */

  handleNew() {
    if (this.state.changesMade) {
      this.setState({
        newConfirming: true,
        loadConfirming: false,
      })
    } else {
      this.handleNewConfirmed()
    }
  }

  handleNewConfirmed() {
    this.refs.editor.new()
    this.handleUpdate()
    this.closePanels()
    this.setState({changesMade: false})
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
            newConfirming: false,
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
    this.refs.editor.new(this.state.loadConfirming.content.replace(/\r\n/g, '\n'))
    this.handleUpdate()
    this.closePanels()
    this.setState({changesMade: false})
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

    this.setState({changesMade: false})
  }

  handleExamples() {
    this.setState({
      examplesOpen: true,
      examplesConfirming: false
    })
  }

  handleExamplesConfirmed() {
    this.refs.editor.new(EXAMPLE_SCRIPTS[this.state.examplesConfirming])
    this.handleUpdate()
    this.closePanels()
    this.setState({changesMade: false})
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
      ? <div>
          <h1>New script</h1>
          <p>
            This will delete <em>everything</em>, including your undo history.<br/>
            <b>It cannot be undone.</b>
          </p>
          <p>Discard all changes?</p>
          <button onClick={this.handleNewConfirmed.bind(this)}>Accept</button>
          {' '}
          <button onClick={this.closePanels.bind(this)}>Cancel</button>
        </div>
      : null

    let loadConfirmPanel = loadConfirming
      ? <div>
          <h1>Load file</h1>
          <p>
            This will delete everything, including your undo history.<br/>
            <b>It cannot be undone.</b>
          </p>
          <p>Discard all changes and load «<em>{loadConfirming.name}</em>»?</p>
          <button onClick={this.handleLoadConfirmed.bind(this)}>Accept</button>
          {' '}
          <button onClick={this.closePanels.bind(this)}>Cancel</button>
        </div>
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
            : <div>
                <p>
                  This will delete everything, including your undo history.<br/>
                  <b>It cannot be undone.</b>
                </p>
                <p>Discard all changes and load «<em>{examplesConfirming}</em>»?</p>
                <button onClick={this.handleExamplesConfirmed.bind(this)}>Accept</button>
                {' '}
                <button onClick={this.closePanels.bind(this)}>Cancel</button>
              </div>}
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

      <Editor ref='editor'
        defaultValue={initialScript}
        onChange={this.handleChange.bind(this)}
      />

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
