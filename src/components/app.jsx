import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Connection from './connection'

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.props.store } />
        <Inspector store={ this.props.store } />
        <Connection connected={true} />
      </div>
    )
  }
}
