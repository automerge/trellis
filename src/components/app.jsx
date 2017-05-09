import React from 'react'
import List from './list'
import Inspector from './inspector'
import Connection from './connection'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    let store  = this.props.store
    this.state = store.getState()
    store.subscribe(() => { this.setState(store.getState()) })
  }

  render() {
    let lists
    let state = this.props.store.getState()

    if(state.lists) {
      lists = state.lists.map((list) => {
        return <List
          listId={ list.id }
          key={ list.id }
          store={ this.props.store }
        />
      })
    } else {
      lists = []
    }

    return (
      <div className="App">
        <div className="App__board">
          <h1 className="App__title">Trellis</h1>
          <div className="App__lists">
            { lists }
          </div>
        </div>

        <Inspector store={ this.props.store } />

        <Connection connected={true} />
      </div>
    )
  }
}
