import React from 'react'
import PropTypes from 'prop-types'

import { Icon, IconStack } from 'components/Icon'

import { toMinSecs } from 'components/util'

const REWIND_FF_SECS = 5
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

    let restartLabel = 'Restart'
    let rewindLabel = `-${REWIND_FF_SECS} seconds`
    let timeLabel = 'Time'
    let forwardLabel = `+${REWIND_FF_SECS} seconds`
    let fastForwardLabel = `+${VERY_FF_SECS} seconds`

    return <div className='Musika-TimeSeeker'>
      <button className='color-purple'
        onClick={this.handleRestart.bind(this)}
        title={restartLabel}
        aria-label={restartLabel}
      >
        <Icon name='fast-backward' />
      </button>

      <button className='color-green'
        onClick={this.handleRewind.bind(this)}
        title={rewindLabel}
        aria-label={rewindLabel}
      >
        <Icon name='backward' />
      </button>

      <input className='color-yellow' type='time' value={toMinSecs(value)} required
        onChange={this.handleChange.bind(this)}
        title={timeLabel}
        aria-label={timeLabel}
      />

      <button className='color-blue'
        onClick={this.handleFastForward.bind(this)}
        title={forwardLabel}
        aria-label={forwardLabel}
      >
        <Icon name='forward' />
      </button>

      <button className='color-red'
        onClick={this.handleVeryFastForward.bind(this)}
        title={fastForwardLabel}
        aria-label={fastForwardLabel}
      >
        <IconStack style={{top: '-2px', left: '1px'}} icons={[
            {name: 'forward', style: {left: '-0.2em'}},
            {name: 'forward', style: {left: '0.2em'}},
          ]}
        />
      </button>
    </div>
  }
}

TimeSeeker.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
}

TimeSeeker.defaultProps = {
  value: 0,
}
