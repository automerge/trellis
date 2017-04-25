import React from 'react'
import ListCard from './list_card'

export default class List extends React.Component {
  onDrop(event) {
    let cardTitle = event.dataTransfer.getData("text")
    console.log(cardTitle)
  }

  preventDefault(event) {
    event.preventDefault()
  }

  render() {
    let listCards = this.props.cards.map((card) => {
      return <ListCard key={ card.title } title={ card.title }/>
    })

    return (
      <div className="List" onDrop={ this.onDrop } onDragOver={ this.preventDefault } >
        <div className="List__title"> Icebox </div>
        { listCards }
        <div className="AddCard">
          <a href="#">Add a card...</a>
        </div>
      </div>
    )
  }
}
