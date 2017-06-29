import React from 'react'
import ReactDOM from 'react-dom'
import Assignments from '../assignments/assignments'
import DropTarget from '../drop_target'

export default class ListCard extends React.Component {
  constructor(props) {
    super(props)
    this.onDragStart   = this.onDragStart.bind(this)
    this.show          = this.show.bind(this)
  }

  onDragStart(event) {
    event.dataTransfer.setData("text", this.props.card.id)
  }

  show() {
    this.props.showModal(this.props.card)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.card !== this.props.card) || (nextProps.commentsCount !== this.props.commentsCount)
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

    if(this.props.highlightOptions && this.props.highlightOptions.cardId === this.props.card.id) {
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
    if(this.props.commentsCount > 0)
      commentsPartial = <div className="ListCard__commentsCount">
        <img src="assets/images/comment.svg" />
        <div className="ListCard__commentsCount__count"> { this.props.commentsCount } </div>
      </div>

    return (
      <div
        className="ListCard clear"
        draggable="true"
        onDragStart={ this.onDragStart }
        onClick={ this.show } >
        <div className="ListCard__title"> { this.props.card.title } </div>
        <div style={{ clear: "both" }} />

        { commentsPartial }
        <Assignments readonly={ true } cardId={ this.props.card.id } store={ this.props.store } />
      </div>
    )
  }
}
