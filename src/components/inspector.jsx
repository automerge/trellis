import React from 'react'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
    this.updateListId = this.updateListId.bind(this)
  }

  updateListId(event) {
    let cardId  = parseInt(event.target.name.replace(/[^0-9]/g, ''))
    let card    = this.props.store.findCard(cardId)

    let newListId = parseInt(event.target.value)
    if (newListId >= 1 && newListId <= 3) {
      card.listId = newListId
      this.props.store.updateCard(card)
    }
  }

  render() {
    let listCardsPartial = this.props.store.getState().cards.map((card) => {
      let name = 'cardId[' + card.id + ']'
      return <tr>
        <td>{card.id}</td>
        <td><input type="text" name={name} value={card.listId} onChange={this.updateListId} /></td>
        <td>{card.title}</td>
      </tr>
    })

    return <div className="Inspector">
      <h3>Cards</h3>
      <form>
      <table>
        <thead><tr><th>id</th><th>listId</th><th>title</th></tr></thead>
        <tbody>{ listCardsPartial }</tbody>
      </table>
      </form>
    </div>
  }
}
