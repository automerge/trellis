import React from 'react'
import Assignments from './assignments'
import InlineInput from './inline_input'

export default class Card extends React.Component {
  constructor(props) {
    super(props)
    this.submitTitle        = this.submitTitle.bind(this)
    this.submitDescription  = this.submitDescription.bind(this)
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
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
          label="Title"
          onSubmit={ this.submitTitle }
          defaultValue={ this.card().title }
          className="Card__title">{ this.card().title }</InlineInput>
        <InlineInput
          label="Description"
          onSubmit={ this.submitDescription }
          defaultValue={ this.card().description }
          className="Card__description">{ this.card().description || "Add Description" }</InlineInput>
        <Assignments cardId={ this.props.cardId } store={ this.props.store } />
        <div style={ { clear: "both" } } />
        <div className="Card__shortcuts">Click any field to edit. Press Shift+Enter to Submit.</div>
      </div>
    )
  }
}
