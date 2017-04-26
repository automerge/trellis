import React from 'react'

export default class ListCard extends React.Component {
  constructor() {
    super()
    this.onDragStart = this.onDragStart.bind(this)
  }

  onDragStart(event) {
    event.dataTransfer.setData("text", this.props.cardId)
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
  }

  render() {
    return (
      <div
        className="ListCard"
        draggable="true"
        onDragStart={ this.onDragStart } >
        <div className="ListCard__title"> { this.card().title }</div>
      </div>
    )
  }
}
