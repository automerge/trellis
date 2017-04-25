import React from 'react'
import List from './list'
import Card from './card'

export default class App extends React.Component {
  constructor() {
    super()

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
        list_id: 1,
        title: "Rewrite everything in Crystal"
      },
      {
        id: 2,
        list_id: 1,
        title: "Solve AGI"
      },
      {
        id: 3,
        list_id: 2,
        title: "Add more 'pop' to the landing page"
      },
      {
        id: 4
        list_id: 3,
        title: "Rewrite everything in Go"
      }
    ]
  }

  render() {
    return (
      <div>
        <h1>Trellis</h1>
        <List key="icebox" cards={ this.state.icebox } />
        <List key="active" cards={ this.state.active } />
        <List cards={ this.state.done   } />
      </div>
    )
  }
}
