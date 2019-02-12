import React from 'react'
import PropTypes from 'prop-types'

export function Icon({name, title}) {
  let hasTitle = typeof title !== 'undefined'

  let icon = <i className={`fa fa-${name}`} title={title} aria-hidden />

  if (title) {
    return <span>
      {icon}
      <span className='sr-only'>{title}</span>
    </span>
  }

  return icon
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
}

export function IconStack({icons, title, ...other}) {
  let hasTitle = typeof title !== 'undefined'

  let icon = Object.keys(icons).map((k, idx) => {
    let {name, className, inverse, style} = icons[k]
    return <i key={idx}
      className={`fa fa-${name} icon-stack-icon${inverse ? ' fa-inverse' : ''} ${className ? className : ''}`}
      style={style}
      aria-hidden
    />
  })

  return <span className='icon-stack' title={title} {...other} >
    {icon}
    {hasTitle ? <span className='sr-only'>{title}</span> : null}
  </span>
}

IconStack.propTypes = {
  icons: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    inverse: PropTypes.boolean,
    style: PropTypes.object,
  })).isRequired,
  title: PropTypes.string,
}

export default Icon
