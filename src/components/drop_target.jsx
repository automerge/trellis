import React from 'react'
import PropTypes from 'prop-types'

export default class DropTarget extends React.Component {
  constructor() {
    super()
    this.onDrop  = this.onDrop.bind(this)
    this.onDragEnter = this.onDragEnter.bind(this)
    this.onDragLeave = this.onDragLeave.bind(this)
    this.counter = 0
  }

  preventDefault(event) {
    event.preventDefault()
  }

  onDrop(event) {
    event.currentTarget.classList.remove("drag-entered")
    this.counter = 0

    let cardId = event.dataTransfer.getData("text")

    this.props.store.dispatch({
      type: "MOVE_CARD",
      cardId: cardId,
      listId: this.props.listId,
      afterCardId: this.props.afterCardId
    })
  }

  onDragEnter(event) {
    if(this.counter === 0)
      event.currentTarget.classList.add("drag-entered")

    this.counter += 1
  }

  onDragLeave(event) {
    this.counter -= 1

    if(this.counter === 0)
      event.currentTarget.classList.remove("drag-entered")
  }

  render() {
    // Chrome has a drag-and-drop bug that requires onDragOver to not propogate its event
    return <div
      className="DropTarget"
      onDrop={ this.onDrop }
      onDragOver={ this.preventDefault }
      onDragEnter={ this.onDragEnter }
      onDragLeave={ this.onDragLeave } >
      { this.props.children }
    </div>
  }
}
