import React from 'react'

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
      <button onClick={this.handleRestart.bind(this)}>⏮</button>
      <button onClick={this.handleRewind.bind(this)}>⏪</button>
      <input type='time' value={toMinSecs(value)} required
        onChange={this.handleChange.bind(this)}
      />
      <button onClick={this.handleFastForward.bind(this)}>⏩</button>
      <button onClick={this.handleVeryFastForward.bind(this)}>➠</button>{/*⏩⏵*/}{/*⏭*/}{/*➛ ➜ ➔ ➝ ➞ ➟ ➠ ➥ ➦ ➧ ➨ ➲*/}
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
