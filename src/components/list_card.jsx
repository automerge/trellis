import React from 'react'
import Assignments from './assignments'

export default class ListCard extends React.Component {
  constructor() {
    super()
    this.onDragStart = this.onDragStart.bind(this)
    this.delete = this.delete.bind(this)
  }

  onDragStart(event) {
    event.dataTransfer.setData("text", this.props.cardId)
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
  }

  delete() {
    this.props.store.deleteCard(this.card())
  }

  render() {
    return (
      <div
        className="ListCard"
        draggable="true"
        onDragStart={ this.onDragStart } >
        <div className="ListCard__delete" onClick={ this.delete }>x</div>
        <div className="ListCard__title"> { this.card().title }</div>
        <div style={{ clear: "both" }} />

        <Assignments card={ this } />
        <div style={{ clear: "both" }} />
      </div>
    )
  }
}
