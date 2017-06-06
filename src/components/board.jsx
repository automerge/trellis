import React from 'react'
import List from './list'
import AddList from './add_list'

export default class Board extends React.Component {
  render() {
    let lists
    let state = this.props.store.getState()

    if(state.lists) {
      lists = this.props.store._map(state.lists, (list) => {
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
      <div className="Board">
        <h1 className="Board__title">Trellis</h1>
        <div className="Board__lists">
          { lists }
          <AddList store={ this.props.store } />
        </div>
      </div>
    )
  }
}
