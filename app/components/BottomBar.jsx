import React from 'react'
import PropTypes from 'prop-types'

import { Icon, IconStack } from 'components/Icon'

import EXAMPLE_SCRIPTS from 'examples'

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
  title: PropTypes.string,
  loadName: PropTypes.string,
  onAccept: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

//

function ButtonWithPanel({panel, children, ...other}) {
  return <div className={`panel-container${panel ? ' open' : ''}`}>
    {panel ? <div className='panel'>{panel}</div> : null}
    <button {...other}>{children}</button>
  </div>
}

ButtonWithPanel.propTypes = {
  panel: PropTypes.node,
}

//

export default class BottomBar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      newConfirming: false,
      loadConfirming: false,
      examplesOpen: false,
      examplesConfirming: false,
      renderSampleRate: 44100,
    }
  }

  closePanels() {
    this.setState({
      newConfirming: false,
      loadConfirming: false,
      examplesOpen: false,
      examplesConfirming: false,
    })
  }

  handleNew() {
    if (this.props.isClean) {
      this.handleNewConfirmed()
    } else {
      this.closePanels()
      this.setState({newConfirming: true})
    }
  }

  handleNewConfirmed() {
    this.props.onNew()
    this.closePanels()
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
          this.props.isClean ? this.handleLoadConfirmed : null
        )
      }
      r.readAsText(f)
    }

    input.click()
  }

  handleLoadConfirmed() {
    let source = this.state.loadConfirming.content.replace(/\r\n/g, '\n')
    this.props.onNew(source)
    this.closePanels()
  }

  handleSave() {
    this.props.onSave()
    this.closePanels()
  }

  handleExamples() {
    this.closePanels()
    this.setState({examplesOpen: true})
  }

  handleExamplesConfirmed() {
    let source = EXAMPLE_SCRIPTS[this.state.examplesConfirming]
    this.props.onNew(source)
    this.closePanels()
  }

  handleRender() {
    this.props.onRender(this.state.renderSampleRate)
  }

  handleRenderSampleRate({target: {value}}) {
    this.setState({renderSampleRate: value})
  }

  render() {
    let {newConfirming, loadConfirming, examplesOpen, examplesConfirming, renderSampleRate} = this.state
    let {isClean, showRenderControls} = this.props

    let updateControls = <button className='color-orange'
      onClick={this.props.onUpdate}
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
                        isClean ? this.handleExamplesConfirmed : null
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

    let renderControls = showRenderControls
      ? <div className='color-red'>
          <button onClick={this.handleRender.bind(this)}
            title='Render'
            aria-label='Render'
          >
            <Icon name='download' /> .WAV
          </button>

          <select onChange={this.handleRenderSampleRate.bind(this)}
            value={renderSampleRate}
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

    return <div className='panel-wrapper'>
      <div className='Musika-BottomBar'>
        {updateControls}
        {fileControls}
        {exampleControls}
        {renderControls}
        {aboutControls}
      </div>
    </div>
  }
}

BottomBar.propTypes = {
  isClean: PropTypes.bool.isRequired,
  showRenderControls: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onRender: PropTypes.func.isRequired,
}
