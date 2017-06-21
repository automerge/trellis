import React from 'react'
import Assignments from './assignments'
import DropTarget from './drop_target'
import ReactDOM from 'react-dom'

export default class ListCard extends React.Component {
  constructor() {
    super()
    this.onDragStart   = this.onDragStart.bind(this)
    this.show          = this.show.bind(this)
  }

  onDragStart(event) {
    event.dataTransfer.setData("text", this.props.cardId)
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
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
    let commentsPartial
    let commentsCount = this.props.store.findCommentsByCard(this.props.cardId).length
    if(commentsCount > 0)
      commentsPartial = <div className="ListCard__commentsCount">
        <img src="assets/images/comment.svg" />
        <div className="ListCard__commentsCount__count"> { commentsCount } </div>
      </div>

    return (
      <div
        className="ListCard clear"
        draggable="true"
        onDragStart={ this.onDragStart }
        onClick={ this.show } >
        <div className="ListCard__title"> { this.card().title } </div>
        <div style={{ clear: "both" }} />

        { commentsPartial }
        <Assignments cardId={ this.props.cardId } store={ this.props.store } />
      </div>
    )
  }
}
