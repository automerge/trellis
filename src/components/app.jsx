import React from 'react'
import List from './list'
import Card from './card'

export default class App extends React.Component {
  constructor() {
    super()

    let state = {
      icebox: [],
      active: [],
      done:   []
    }

    state.icebox.push({ title: "Rewrite everything in Crystal" })
    state.icebox.push({ title: "Solve AGI" })
    state.active.push({ title: "Add more 'pop' to the landing page" })
    state.done.push(  { title: "Rewrite everything in Go" })

    this.state = state
  }

  render() {
    return (
      <div>
        <h1>Trellis</h1>
        <List cards={ this.state.icebox } />
        <List cards={ this.state.active } />
        <List cards={ this.state.done   } />
      </div>
    )
  }
}
