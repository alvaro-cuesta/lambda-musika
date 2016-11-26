import React from 'react'

import Icon from 'components/Icon'

import { toMinSecs } from 'components/util'

const REWIND_FF_SECS = 10
const VERY_FF_SECS = 60

export default class TimeSeeker extends React.PureComponent {
  handleRestart() {
    let {onChange} = this.props

    if (typeof onChange !== 'undefined') {
      onChange(0)
    }
  }

  handleRewind() {
    let {value, onChange} = this.props

    if (typeof onChange !== 'undefined') {
      onChange(Math.max(0, value - REWIND_FF_SECS))
    }
  }

  handleChange({target: {value}}) {
    let {onChange} = this.props

    let [mins, secs] = value.split(':').map(n => parseInt(n, 10))

    if (typeof onChange !== 'undefined') {
      onChange(mins * 60 + secs)
    }
  }

  handleFastForward() {
    let {value, onChange} = this.props

    if (typeof onChange !== 'undefined') {
      onChange(value + REWIND_FF_SECS)
    }
  }

  handleVeryFastForward() {
    let {value, onChange} = this.props

    if (typeof onChange !== 'undefined') {
      onChange(value + VERY_FF_SECS)
    }
  }

  render() {
    let {value, onChange} = this.props

    return <div className='Musika-TimeSeeker'>
      <button className='color-purple' onClick={this.handleRestart.bind(this)}>
        <Icon name='undo' title='Restart' />
      </button>
      <button className='color-green' onClick={this.handleRewind.bind(this)}>
        <Icon name='backward' title={`-${REWIND_FF_SECS} seconds`} />
      </button>
      <input className='color-yellow' type='time' value={toMinSecs(value)} required
        onChange={this.handleChange.bind(this)}
      />
      <button className='color-blue' onClick={this.handleFastForward.bind(this)}>
        <Icon name='forward' title={`+${REWIND_FF_SECS} seconds`} />
      </button>
      <button className='color-red' onClick={this.handleVeryFastForward.bind(this)}>
        <Icon name='fast-forward' title={`+${VERY_FF_SECS} seconds`} />
      </button>
    </div>
  }
}

TimeSeeker.propTypes = {
  value: React.PropTypes.number,
  onChange: React.PropTypes.func,
}

TimeSeeker.defaultProps = {
  value: 0,
}
