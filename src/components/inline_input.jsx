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
    if (event.key === "Enter" && this.props.onSubmit)
      this.props.onSubmit(event.target.value)

    // Exit edit mode if "Enter" or "Esc" are pressed
    if (event.key === "Enter" || event.keyCode === 27)
      this.setState({ editMode: false })
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

    return <div className="InlineInput" >
      { label }
      { children }
    </div>
  }
}

InlineInput.propTypes = {
  children: PropTypes.string.isRequired
}
