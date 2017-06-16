import React from 'react'
import Assignments from './assignments'
import DropTarget from './drop_target'
import ReactDOM from 'react-dom'

export default class ListCard extends React.Component {
  constructor() {
    super()
    this.onDragStart   = this.onDragStart.bind(this)
    this.delete        = this.delete.bind(this)
    this.show          = this.show.bind(this)
  }

  onDragStart(event) {
    event.dataTransfer.setData("text", this.props.cardId)
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
  }

  delete(event) {
    event.stopPropagation()

    this.props.store.dispatch({
      type: "DELETE_CARD", cardId: this.card().id
    })
  }

  show() {
    this.props.showModal(this.card())
  }

  componentDidMount() {
    this.doHighlight()
  }

  componentDidUpdate() {
    this.doHighlight()
  }

  doHighlight() {
    if(this.highlightActive)
      return false

    if(this.props.highlightOptions && this.props.highlightOptions.cardId === this.props.cardId) {
      let node = ReactDOM.findDOMNode(this)
      this.highlightActive = true
      node.classList.add("highlighted")
      setTimeout(() => {
        node.classList.remove("highlighted")
        this.highlightActive = false
      }, 1000)

      return true
    }
  }

  render() {
    return (
      <div
        className="ListCard"
        draggable="true"
        onDragStart={ this.onDragStart }
        onClick={ this.show } >
        <div className="ListCard__delete" onClick={ this.delete }>✕</div>
        <div className="ListCard__title"> { this.card().title } </div>
        <div style={{ clear: "both" }} />

        <Assignments cardId={ this.props.cardId } store={ this.props.store } />
        <div style={{ clear: "both" }} />
      </div>
    )
  }
}
