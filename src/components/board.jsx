import React from 'react'
import List from './list'
import AddList from './add_list'
import Card from './card'

export default class Board extends React.Component { constructor(props) {
    super(props)

    this.showModal  = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)

    this.state = { showModal: false, card: null }
  }

  showModal(card) {
    this.setState({ showModal: true, card: card })
  }

  closeModal() {
    this.setState({ showModal: false, card: null })
  }

  render() {
    let lists
    let modal = ""
    let state = this.props.store.getState()

    if(state.lists) {
      lists = this.props.store._map(state.lists, (list) => {
        return <List
          listId={ list.id }
          key={ list.id }
          store={ this.props.store }
          showModal={ this.showModal }
        />
      })
    } else {
      lists = []
    }

    if(this.state.showModal) {
      modal = <Card store={ this.props.store } cardId={ this.state.card.id } close={ this.closeModal } />
    }

    return (
      <div className="Board">
        <h1 className="Board__title">Trellis</h1>
        <div className="Board__lists">
          { lists }
          <AddList store={ this.props.store } />
          { modal }
        </div>
      </div>
    )
  }
}
