import React from 'react'

export default function Icon({name, title}) {
  let props = {}

  let hasTitle = typeof title !== 'undefined'

  let icon = <i className={`fa fa-${name}`} title={title} aria-hidden={!hasTitle} />

  if (title) {
    return <span>
      {icon}
      <span className='sr-only'>{title}</span>
    </span>
  }

  return icon
}

Icon.propTypes = {
  name: React.PropTypes.string.isRequired,
  title: React.PropTypes.string,
}
