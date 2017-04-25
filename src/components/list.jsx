import React from 'react'
import ListCard from './list_card'

export default class List extends React.Component {
  constructor() {
    super()
    this.onDrop = this.onDrop.bind(this)
  }

  onDrop(event) {
    let cardId = parseInt(event.dataTransfer.getData("text"))
    this.props.moveCard(cardId, this.props.listId)
  }

  preventDefault(event) {
    event.preventDefault()
  }

  render() {
    let listCards = this.props.cards.map((card) => {
      return <ListCard cardId={ card.id } key={ card.id } title={ card.title }/>
    })

    return (
      <div className="List" onDrop={ this.onDrop } onDragOver={ this.preventDefault } >
        <div className="List__title">{ this.props.title }</div>
        { listCards }
        <div className="AddCard">
          <a href="#">Add a card...</a>
        </div>
      </div>
    )
  }
}
