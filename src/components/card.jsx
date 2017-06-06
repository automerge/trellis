import React from 'react'
import Assignments from './assignments'

export default class Card extends React.Component {
  constructor(props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleBlur    = this.handleBlur.bind(this)
    this.editTitle     = this.editTitle.bind(this)

    this.state = { editMode: false }
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      let newTitle = event.target.value
      this.props.store.dispatch({
        type: "UPDATE_CARD_TITLE",
        cardId: this.card().id,
        newTitle: newTitle
      })
    }

    // Exit edit mode if "Enter" or "Esc" are pressed
    if (event.key === "Enter" || event.keyCode === 27) {
      this.setState({ editMode: false })
    }
  }

  handleBlur(event) {
    this.setState({ editMode: false })
  }

  editTitle() {
    this.setState({ editMode: true })
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
  }

  render() {
    let title = ""

    if(this.state.editMode) {
      title = <textarea
        ref= { (input) => this.titleInput = input }
        defaultValue={ this.card().title }
        onBlur={ this.handleBlur }
        onKeyDown={ this.handleKeyDown } />
    } else {
      title = <h3 onClick={ this.editTitle } > { this.card().title }</h3>
    }

    return (
      <div className="Card">
        <a onClick={ this.props.close }>X</a>
        <div className="Card__title"> { title } </div>

        <div className="Card__description">
          <b>Description</b> <a href="#">Edit</a>
          <p>The marketing team would like to add at least 10x more pop to the landing page.</p>
        </div>

        <Assignments cardId={ this.props.cardId } store={ this.props.store } />
      </div>
    )
  }
}
