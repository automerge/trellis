import React from 'react'

export default class ListCard extends React.Component {
  constructor() {
    super()

    // Hard bind `onDragStart` to this object so we can
    // access `this.props` in the event handler
    this.onDragStart = this.onDragStart.bind(this)
  }

  onDragStart(event) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData("text", this.props.title)
  }

  render() {
    return (
      <div
        className="ListCard"
        draggable="true"
        onDragStart={ this.onDragStart } >
        <div className="ListCard__title"> { this.props.title }</div>
      </div>
    )
  }
}
