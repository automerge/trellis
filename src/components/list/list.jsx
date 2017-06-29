import React from 'react'
import ListCard from '../list_card/list_card'
import AddCard from '../add_card/add_card'
import DropTarget from '../drop_target'

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
      let commentsCount = this.props.store.findCommentsByCard(card.id).length

      return <DropTarget key={ card.id } listId={ this.props.listId } store={ this.props.store } afterCardId={ card.id }>
        <ListCard
          highlightOptions={ this.props.highlightOptions }
          showModal={ this.props.showModal }
          store={ this.props.store }
          card={ card }
          commentsCount= { commentsCount }
          key={ card.id } />
      </DropTarget>
    })

    return (
      <div className="List">
        <a className="List__delete" onClick={ this.delete }>✕</a>
        <DropTarget listId={ this.props.listId } store={ this.props.store } >
          <div className="List__title">{ this.list().title }</div>
        </DropTarget>
        { listCardsPartial }
        <AddCard listId={ this.props.listId } store={ this.props.store }/>
      </div>
    )
  }
}
