import React from 'react'
import ListCard from './list_card'

export default class List extends React.Component {
  constructor() {
    super()
    this.onDrop = this.onDrop.bind(this)
    this.showCardForm = this.showCardForm.bind(this)
    this.state = {
      showCardForm: false
    }
  }

  onDrop(event) {
    let cardId = parseInt(event.dataTransfer.getData("text"))
    this.props.moveCard(cardId, this.props.listId)
  }

  preventDefault(event) {
    event.preventDefault()
  }

  showCardForm() {
    this.setState({ showCardForm: true })
  }

  render() {
    let listCards = this.props.cards.map((card) => {
      return <ListCard cardId={ card.id } key={ card.id } title={ card.title }/>
    })

    let addCard
    if(this.state.showCardForm) {
      addCard = (
        <div>
          <textarea />
          <button>Add</button>
          <a href="#">X</a>
        </div>
      )
    } else {
      addCard = <a href="#" onClick={ this.showCardForm }>Add a card...</a>
    }

    return (
      <div className="List" onDrop={ this.onDrop } onDragOver={ this.preventDefault } >
        <div className="List__title">{ this.props.title }</div>
        { listCards }
        <div className="AddCard">
          { addCard }
        </div>
      </div>
    )
  }
}
