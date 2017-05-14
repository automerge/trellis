import Wrapper from './wrapper'

export default class Store extends Wrapper {
  createCard(attributes) {
    let state  = this.getState()
    let nextId = Math.max.apply(null, state.cards.map((c) => c.id)) + 1
    let card   = Object.assign({}, attributes, { id: nextId })

    this.tesseract.root.cards.push(card)
  }

  updateCard(cardId, attributes) {
    let cards     = this.getState().cards
    let cardIndex = cards.findIndex((card) => card.id === cardId)

    Object.assign(cards[cardIndex], attributes)
  }

  deleteCard(card) {
    let cards     = this.getState().cards
    let cardIndex = cards.findIndex((c) => c.id === card.id)

    cards.splice(cardIndex, 1)
  }

  findCard(cardId) {
    let state = this.getState()

    return state.cards.find((card) => {
      return cardId === card.id
    })
  }

  findCardsByList(listId) {
    return this.getState().cards.filter((card) => {
      return card.listId === listId
    })
  }

  findList(listId) {
    let state = this.getState()

    return state.lists.find((list) => {
      return listId === list.id
    })
  }
}
