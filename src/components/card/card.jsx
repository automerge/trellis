import React from 'react'
import Assignments from '../assignments/assignments'
import InlineInput from '../inline_input'
import Comments from '../comments'

export default class Card extends React.Component {
  constructor(props) {
    super(props)
    this.submitTitle        = this.submitTitle.bind(this)
    this.submitDescription  = this.submitDescription.bind(this)
    this.delete             = this.delete.bind(this)
  }

  delete(event) {
    event.stopPropagation()

    this.props.close()
    this.props.store.dispatch({
      type: "DELETE_CARD", cardId: this.props.cardId
    })
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
  }

  list() {
    return this.props.store.findList(this.card().listId)
  }

  submitTitle(value) {
    this.props.store.dispatch({
      type: "UPDATE_CARD_TITLE", cardId: this.props.cardId, newTitle: value
    })
  }

  submitDescription(value) {
    this.props.store.dispatch({
      type: "UPDATE_CARD_DESCRIPTION", cardId: this.props.cardId, newDescription: value
    })
  }

  render() {
    return (
      <div className="Card" onClick={ (e) => e.stopPropagation() } >
        <a className="Card__close" onClick={ this.props.close }>✕</a>
        <InlineInput
          onSubmit={ this.submitTitle }
          defaultValue={ this.card().title }
          className="Card__title">{ this.card().title }</InlineInput>
        <div className="Card__list">{ this.list().title }</div>
        <Assignments cardId={ this.props.cardId } store={ this.props.store } />
        <Comments cardId={ this.props.cardId } store={ this.props.store } />
        <img className="Card__delete" onClick={ this.delete } src="assets/images/trash.svg" />
      </div>
    )
  }
}
