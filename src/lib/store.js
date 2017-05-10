import { Store as TesseractStore } from 'tesseract'

export default class Store {
  constructor() {
    this.tesseract            = new TesseractStore("trellis")
    this.tesseract.root.cards = require("../../initial_state.json").cards
    this.tesseract.root.lists = require("../../initial_state.json").lists
    this.tesseract.subscribe(() => { console.log(this.getState()) })

    this.subscribe = this.tesseract.subscribe
    this.getState  = this.tesseract.getState
    this.link      = this.tesseract.link
    this.pause     = this.tesseract.pause
    this.unpause   = this.tesseract.unpause
  }

  createCard(attributes) {
    let state  = this.getState()
    let ids    = Object.keys(state.cards).map((e) => parseInt(e))
    let nextId = Math.max.apply(null, ids) + 1
    let card   = Object.assign({}, attributes, { id: nextId })

    this.tesseract.root.cards[nextId] = card
  }

  updateCard(id, attributes) {
    let card = this.getState().cards[id]
    Object.assign(card, attributes)
  }

  deleteCard(cardId) {
    delete this.tesseract.root.cards[cardId]
  }

  findCard(cardId) {
    return this.getState().cards[cardId]
  }

  findCardsByList(listId) {
    let cards = []

    for(let id in this.getState().cards) {
      let card = this.getState().cards[id]
      if(card.listId === listId) cards.push(Object.assign({}, card, {id: id}))
    }

    return cards
  }

  findList(listId) {
    return this.getState().lists[listId]
  }
}
