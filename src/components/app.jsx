import React from 'react'
import List from './list'
import Card from './card'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.moveCard = this.moveCard.bind(this)
    this.state    = this.props.store.getState()
  }

  cardsForList(listId) {
    return this.state.cards.filter((card) => {
      return card.listId === listId
    })
  }

  moveCard(cardId, listId) {
    let cards     = this.state.cards
    let cardIndex = cards.findIndex((card) => {
      return card.id === cardId
    })

    cards[cardIndex].listId = listId

    this.State({ cards: cards })

  }

  render() {
    let lists = this.state.lists.map((list) => {
      return <List
        title={ list.title }
        listId={ list.id }
        key={ list.id }
        moveCard={ this.moveCard }
        cards={ this.cardsForList(list.id) }
      />
    })

    return (
      <div>
        <h1>Trellis</h1>
        { lists }
      </div>
    )
  }
}
