import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Connection from './connection'
import Store from '../lib/store'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.store = new Store()
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.store } />
        <Inspector store={ this.store } />
        <Connection connected={true} />
      </div>
    )
  }
}
