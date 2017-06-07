import React from 'react'
import PropTypes from 'prop-types'

export default class InlineInput extends React.Component {
  constructor(props) {
    super(props)

    this.handleKeyDown  = this.handleKeyDown.bind(this)
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

  render() { 
    let children

    if(this.state.editMode) {
      children = <textarea
        ref={ (input) => this.input = input }
        onKeyDown={ this.handleKeyDown }
        defaultValue={ this.props.children }
      />
    } else {
      children = <div onClick={ this.edit }>{ this.props.children }</div>
    }

    return <div className="InlineInput" >
      { children }
    </div>
  }
}

InlineInput.propTypes = {
  children: PropTypes.string.isRequired
}
