import React from 'react'

export function Icon({name, title}) {
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

export function IconStack({icons, title, ...other}) {
  let hasTitle = typeof title !== 'undefined'

  let icon = Object.keys(icons).map((k, idx) => {
    let {name, className, inverse, style} = icons[k]
    return <i key={idx}
      className={`fa fa-${name} icon-stack-icon ${inverse ? 'fa-inverse' : ''} ${className}`}
      aria-hidden={!hasTitle}
      style={style}
    />
  })

  return <span className='icon-stack' title={title} {...other} >
    {icon}
    {title ? <span className='sr-only'>{title}</span> : null}
  </span>
}

IconStack.propTypes = {
  icons: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    inverse: React.PropTypes.boolean,
    style: React.PropTypes.object,
  })).isRequired,
  title: React.PropTypes.string,
}

export default Icon
