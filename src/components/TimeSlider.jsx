import React from 'react'

import { toMinSecs } from 'components/util'

// A slider component to seek time
export default class TimeSlider extends React.PureComponent {
  // Regular change event
  handleChange({target: {value}}) {
    let {onChange} = this.props

    if (typeof onChange !== 'undefined') {
      onChange(value)
    }
  }

  // Also allow changing value by sliding
  handleMouseDown() {
    this.isSliding = true
  }

  handleMouseUp({target: {value}}) {
    let {onChange} = this.props

    this.isSliding = false
    if (typeof onChange !== 'undefined') {
      onChange(value)
    }
  }

  handleMouseMove({target: {value}}) {
    let {onChange} = this.props

    if (this.isSliding && typeof onChange !== 'undefined') {
      onChange(value)
    }
  }

  render() {
    let {length, value, onChange, ...other} = this.props

    return <div className='Musika-TimeSlider'>
      {toMinSecs(Math.floor(value))}
      <input {...other}
        type='range' min='0' max={length} value={value}
        onChange={this.handleChange.bind(this)}
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseUp={this.handleMouseUp.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
      ></input>
      {toMinSecs(length)}
    </div>
  }
}

TimeSlider.propTypes = {
  length: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func,
}

TimeSlider.defaultProps = {
  value: 0,
  length: 0,
}
