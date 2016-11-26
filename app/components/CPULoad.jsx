import React from 'react'

// CPU load visualization. Given a buffer length, and a sample rate, shows how
// much of the max render time is being used.
export default function CPULoad({renderTime, bufferLength, sampleRate}) {
  let maxRenderTimeLabel = '', percentage = 0

  if (sampleRate && bufferLength) {
    let maxRenderTime = Math.floor(1000*bufferLength/sampleRate)

    maxRenderTimeLabel = `Max: ${maxRenderTime}ms`
    percentage = renderTime
      ? 100*renderTime/maxRenderTime
      : 0
  }

  return <div className='Musika-CPULoad'>
    <div className='black' style={{minWidth: `${100 - percentage}%`}} />
    <span className='left'>CPU{renderTime ? `: ${Math.floor(renderTime)}ms` : ''}</span>
    <span className='right'>{maxRenderTimeLabel}</span>
  </div>
}

CPULoad.propTypes = {
  renderTime: React.PropTypes.number,
  bufferLength: React.PropTypes.number,
  sampleRate: React.PropTypes.number,
}
