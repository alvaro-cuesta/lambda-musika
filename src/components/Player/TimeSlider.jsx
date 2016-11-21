import React from 'react'

// A slider component to seek time
export default class TimeSlider extends React.Component {
  constructor(props) {
    super(props)
    this.state = {sliding: false}
  }

  /* Private API */

  // Regular change event
  handleChange({target: {value}}) {
    let {onChange} = this.props

    if (typeof onChange !== 'undefined') {
      onChange(value)
    }
  }

  // Also allow changing value by sliding
  handleMouseDown() {
    this.setState({sliding: true})
  }

  handleMouseUp({target: {value}}) {
    let {onChange} = this.props

    this.setState({sliding: false})
    if (typeof onChange !== 'undefined') {
      onChange(value)
    }
  }

  handleMouseMove({target: {value}}) {
    let {onChange} = this.props

    if (this.state.sliding && typeof onChange !== 'undefined') {
      onChange(value)
    }
  }

  // Pretty-print seconds as MM:SS
  toMinSecs(secs) {
    let mins = Math.floor(secs / 60)
    secs = secs % 60

    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  render() {
    let {length, value, onChange, ...other} = this.props

    return <span className='SongSlider'>
      {this.toMinSecs(Math.floor(value))}
      <input {...other}
        type='range' min='0' max={length} value={value}
        onChange={this.handleChange.bind(this)}
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseUp={this.handleMouseUp.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
      ></input>
      {this.toMinSecs(length)}
    </span>
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
