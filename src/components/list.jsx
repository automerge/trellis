import React from 'react'
import ListCard from './list_card'
import AddCard from './add_card'
import DropTarget from './drop_target'

export default class List extends React.Component {
  constructor(props) {
    super(props)
    this.delete = this.delete.bind(this)
  }

  list() {
    return this.props.store.findList(this.props.listId)
  }

  delete() {
    this.props.store.dispatch({
      type: "DELETE_LIST",
      listId: this.props.listId
    })
  }

  render() {
    let listCards    = this.props.store.findCardsByList(this.props.listId)
    let listCardsPartial = listCards.map((card) => {
      return <ListCard store={ this.props.store } cardId={ card.id } key={ card.id } />
    })

    return (
      <div className="List">
        <a className="List__delete" onClick={ this.delete }>✕</a>
        <div className="List__title">{ this.list().title }</div>
        <DropTarget listId={ this.props.listId } store={ this.props.store } />
        { listCardsPartial }
        <AddCard listId={ this.props.listId } store={ this.props.store }/>
      </div>
    )
  }
}
