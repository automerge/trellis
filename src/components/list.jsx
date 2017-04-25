import React from 'react'
import ListCard from './list_card'

export default class List extends React.Component {
  render() {
    let listCards = this.props.cards.map((card) => {
      return <ListCard title={ card.title }/>
    })

    return (
      <div className="List">
        <div className="List__title"> Icebox </div>
        { listCards }
        <div className="AddCard">
          <a href="#">Add a card...</a>
        </div>
      </div>
    )
  }
}
