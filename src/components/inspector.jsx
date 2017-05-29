import React from 'react'
import TesseractInfo from './tesseract_info'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store

    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })

    this.stateHistory = []
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

  componentWillUpdate(nextProps, nextState) {
    this.stateHistory.push(nextState)
  }

  hashesAreEqual(a, b) {
    let keys = Object.keys(a).concat(Object.keys(b))
    return keys.every((key) => a[key] == b[key])
  }

  didCardChange(card) {
    if (this.stateHistory.length < 2) return

    let oldCards = this.stateHistory[this.stateHistory.length-2].cards
    if (!oldCards) return

    let oldCard = undefined
    for (var i = 0; i < oldCards.length; i++) {
      if (oldCards[i].id == card.id)
        oldCard = oldCards[i]
    }

    if (!oldCard)
      return true // it didn't exist before so assume it was just created

    if (card.listId != oldCard.listId ||
        card.title != oldCard.title ||
        !this.hashesAreEqual(card.assigned, oldCard.assigned))
      return true

    return false
  }

  render() {
    let listCardsPartial = ""
    let listsPartial     = ""
    let cards = this.store.getState().cards
    let lists = this.store.getState().lists

    if(cards) {
      listCardsPartial = this.store._map(cards, (card, index) => {
        let changed = this.didCardChange(card)
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
