import React from 'react'

// CPU load visualization. Given a buffer length, and a sample rate, shows how
// much of the max render time is being used.
export default function CPULoad({renderTime, bufferLength, sampleRate}) {
  let maxRenderTime = 1000*bufferLength/sampleRate
  let percentage

  if (renderTime) {
    percentage = 100*renderTime/maxRenderTime
  } else {
    percentage = 0
  }

  return <div className='CPULoad'>
    <div className='black' style={{minWidth: `${100 - percentage}%`}} />
    {renderTime
      ? <span className='left'>{renderTime.toFixed(2)}ms</span>
      : null}
    <span className='right'>{(maxRenderTime).toFixed(2)}ms</span>
  </div>
}

CPULoad.propTypes = {
  renderTime: React.PropTypes.number,
  bufferLength: React.PropTypes.number.isRequired,
  sampleRate: React.PropTypes.number.isRequired,
}
