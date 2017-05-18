import React from 'react'
import TesseractInfo from './tesseract_info'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store

    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })
  }

  formatUUID(uuid) {
    return uuid.toUpperCase().substring(0,4)
  }

  render() {
    let listCardsPartial = ""
    let cards = this.store.getState().cards

    if(cards) {
      listCardsPartial = this.store._map(cards, (card, index) => {
        let name1 = 'cardListId[' + index + ']'
        let name2 = 'cardTitle[' + index + ']'
        return <tr key={index}>
          <td>{this.formatUUID(card.id)}… </td>
          <td>{this.formatUUID(card.listId)}… </td>
          <td>{card.title}</td>
        </tr>
      })
    }

    return <div className="Inspector">
      <h2>Inspector</h2>
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
