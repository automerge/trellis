import React from 'react'
import Assignments from './assignments'
import DropTarget from './drop_target'

export default class ListCard extends React.Component {
  constructor() {
    super()
    this.onDragStart   = this.onDragStart.bind(this)
    this.delete        = this.delete.bind(this)
    this.editTitle     = this.editTitle.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.state = { editMode: false }
  }

  onDragStart(event) {
    event.dataTransfer.setData("text", this.props.cardId)
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
  }

  delete() {
    this.props.store.dispatch({
      type: "DELETE_CARD",
      cardId: this.card().id
    })
  }

  editTitle() {
    this.setState({ editMode: true }, () => this.titleInput.focus())
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

  render() {
    let title = ""

    if(this.state.editMode) {
      title = <textarea 
        ref= { (input) => this.titleInput = input }
        defaultValue={ this.card().title } onKeyDown={ this.handleKeyDown } />
    } else {
      title = <div onClick={ this.editTitle } > { this.card().title }</div>
    }

    return (
      <div>
        <div
          className="ListCard"
          draggable="true"
          onDragStart={ this.onDragStart } >
          <div className="ListCard__delete" onClick={ this.delete }>✕</div>
          <div className="ListCard__title"> { title } </div>
          <div style={{ clear: "both" }} />

          <Assignments cardId={ this.props.cardId } store={ this.props.store } />
          <div style={{ clear: "both" }} />
        </div>
        <DropTarget store={ this.props.store } listId={ this.card().listId } afterCardId={ this.card().id } />
      </div>
    )
  }
}
