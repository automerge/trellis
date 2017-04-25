import React from 'react'
import List from './list'
import Card from './card'

export default class App extends React.Component {
  constructor() {
    super()
    this.icebox = []
    this.active = []
    this.done   = []

    this.icebox.push({ title: "Rewrite everything in Crystal" })
    this.icebox.push({ title: "Solve AGI" })
    this.active.push({ title: "Add more 'pop' to the landing page" })
    this.done.push(  { title: "Rewrite everything in Go" })
  }

  render() {
    return (
      <div>
        <h1>Trellis</h1>
        <List cards={ this.icebox } />
        <List cards={ this.active } />
        <List cards={ this.done   } />
      </div>
    )
  }
}
