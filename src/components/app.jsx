import React from 'react'
import List from './list'
import Card from './card'

export default class App extends React.Component {
  constructor() {
    super()

    this.state = {}
    this.state.lists = [
      {
        id: 1,
        title: "icebox"
      },
      {
        id: 2,
        title: "active"
      },
      {
        id: 3,
        title: "done"
      }
    ]

    this.state.cards = [
      {
        id: 1,
        listId: 1,
        title: "Rewrite everything in Crystal"
      },
      {
        id: 2,
        listId: 1,
        title: "Solve AGI"
      },
      {
        id: 3,
        listId: 2,
        title: "Add more 'pop' to the landing page"
      },
      {
        id: 4,
        listId: 3,
        title: "Rewrite everything in Go"
      }
    ]
  }

  cardsForList(listId) {
    return this.state.cards.filter((card) => {
      return card.listId === listId
    })
  }

  render() {
    let lists = this.state.lists.map((list) => {
      return <List key={ list.id } cards={ this.cardsForList(list.id) } />
    })

    return (
      <div>
        <h1>Trellis</h1>
        { lists }
      </div>
    )
  }
}
