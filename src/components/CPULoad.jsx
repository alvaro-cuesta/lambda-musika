import React from 'react'

// CPU load visualization. Given a buffer length, and a sample rate, shows how
// much of the max render time is being used.
export default function CPULoad({renderTime, bufferLength, sampleRate}) {
  let maxRenderTime = '', percentage = 0

  if (sampleRate && bufferLength) {
    maxRenderTime = `${(1000*bufferLength/sampleRate).toFixed(2)}ms`
    percentage = renderTime
      ? 100*renderTime/maxRenderTime
      : 0
  }

  return <div className='CPULoad'>
    <div className='black' style={{minWidth: `${100 - percentage}%`}} />
    {renderTime
      ? <span className='left'>{renderTime.toFixed(2)}ms</span>
      : null}
    <span className='right'>{maxRenderTime}</span>
  </div>
}

CPULoad.propTypes = {
  renderTime: React.PropTypes.number,
  bufferLength: React.PropTypes.number,
  sampleRate: React.PropTypes.number,
}
