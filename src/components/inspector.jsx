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

  formatAssigned(map) {
    if(!map) return ""

    let formatted = {}
    Object.keys(map).forEach((key) => formatted[key] = map[key])
    return JSON.stringify(formatted)
  }

  render() {
    let listCardsPartial = ""
    let listsPartial     = ""
    let cards = this.store.getState().cards
    let lists = this.store.getState().lists

    if(cards) {
      listCardsPartial = this.store._map(cards, (card, index) => {
        let changed = this.store.didCardChange(card)
        let highlightClass = changed ? "changed" : ""

        return <tr key={index} className={highlightClass}>
          <td className="Inspector__cards__cardId">{this.formatUUID(card.id)}… </td>
          <td className="Inspector__cards__listId">{this.formatUUID(card.listId)}… </td>
          <td>{card.title}</td>
          <td className="Inspector__cards__assigned">{this.formatAssigned(card.assigned)}</td>
        </tr>
      })
    }

    if(lists) {
      listsPartial = this.store._map(lists, (list, index) => {
        return <tr key={index}>
          <td className="Inspector__lists__listId">{this.formatUUID(list.id)}… </td>
          <td>{list.title}</td>
        </tr>
      })
    }

    return <div className="Inspector">
      <h2>DocInspector <img src="assets/images/microscope.svg" /></h2>

      <div className="Inspector__container">
        <div className="Inspector__lists">
          <h3>Lists</h3>
          <table>
            <thead>
              <tr><th>id</th><th>title</th></tr>
            </thead>
            <tbody>{ listsPartial }</tbody>
          </table>
        </div>

        <div className="Inspector__cards">
          <h3>Cards</h3>
          <table>
            <thead>
              <tr><th>id</th><th>listId</th><th>title</th><th>assignments</th></tr>
            </thead>
            <tbody>{ listCardsPartial }</tbody>
          </table>
        </div>
      </div>
    </div>
  }
}
