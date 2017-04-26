import React from 'react'
import List from './list'
import Card from './card'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    let store  = this.props.store
    this.state = store.getState()
    store.subscribe(() => { this.setState(store.getState()) })
  }

  render() {
    let lists = this.state.lists.map((list) => {
      return <List
        title={ list.title }
        listId={ list.id }
        key={ list.id }
        store={ this.props.store }
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
