import React from 'react'
import PropTypes from 'prop-types'

export default class DropTarget extends React.Component {
  constructor() {
    super()
    this.onDrop = this.onDrop.bind(this)
  }

  preventDefault(event) {
    event.preventDefault()
  }
 
  onDrop(event) {
    let cardId = event.dataTransfer.getData("text")

    this.props.store.dispatch({
      type: "MOVE_CARD",
      cardId: cardId,
      listId: this.props.listId,
      afterCardId: this.props.afterCardId
    })
  }


 render() {
   // Chrome has a drag-and-drop bug that requires onDragOver to not propogate its event
   return <div className="DropTarget" onDrop={ this.onDrop } onDragOver={ this.preventDefault } >
   </div>
 }
}
