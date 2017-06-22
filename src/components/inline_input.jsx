import React from 'react'
import PropTypes from 'prop-types'

export default class InlineInput extends React.Component {
  constructor(props) {
    super(props)

    this.handleKeyDown  = this.handleKeyDown.bind(this)
    this.handleBlur     = this.handleBlur.bind(this)
    this.edit           = this.edit.bind(this)
    this.state          = { editMode: false }
  }

  edit() {
    this.setState({ editMode: true }, () => this.input.focus())
  }

  handleKeyDown(event) {
    let doSubmit = !event.shiftKey && event.key === "Enter"
    if (doSubmit && this.props.onSubmit)
      this.props.onSubmit(event.target.value)

    // Exit edit mode if "Enter" or "Esc" are pressed
    if (doSubmit || event.keyCode === 27) {
      event.stopPropagation()
      this.setState({ editMode: false })
    }
  }

  handleBlur() {
    this.setState({ editMode: false })
  }

  render() {
    let children, label

    if(this.state.editMode) {
      children = <textarea
        ref={ (input) => this.input = input }
        onKeyDown={ this.handleKeyDown }
        onBlur={ this.handleBlur }
        defaultValue={ this.props.defaultValue }
      />
    } else {
      children = <div onClick={ this.edit }>{ this.props.children }</div>
    }

    if(this.props.label)
      label = <label>{ this.props.label }</label>

    let klass = "InlineInput"
    if(this.props.className)
        klass += " " + this.props.className

    return <div className={klass} >
      { label }
      { children }
    </div>
  }
}
