import React from 'react'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
    this.updateListId = this.updateListId.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
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

  updateTitle(event) {
    let cardId  = parseInt(event.target.name.replace(/[^0-9]/g, ''))
    let card    = this.props.store.findCard(cardId)

    let newTitle = event.target.value
    card.title = newTitle
    this.props.store.updateCard(card)
  }

  render() {
    let listCardsPartial = this.props.store.getState().cards.map((card) => {
      let key= card.id
      let name1 = 'cardListId[' + card.id + ']'
      let name2 = 'cardTitle[' + card.id + ']'
      return <tr key={key}>
        <td>{card.id}</td>
        <td><input type="text" className="number" name={name1} value={card.listId} onChange={this.updateListId} /></td>
        <td><input type="text" className="string" name={name2} value={card.title} onChange={this.updateTitle} /></td>
      </tr>
    })

    return <div className="Inspector">
      <h3>Cards</h3>
      <form>
      <table>
        <thead><tr><th>id</th><th>list</th><th>title</th></tr></thead>
        <tbody>{ listCardsPartial }</tbody>
      </table>
      </form>
    </div>
  }
}
