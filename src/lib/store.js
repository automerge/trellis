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
  }

  createCard(attributes) {
    let state  = this.getState()
    let nextId = Math.max.apply(null, state.cards.map((c) => c.id)) + 1
    let card   = Object.assign({}, attributes, { id: nextId })

    this.tesseract.root.cards.push(card)
  }

  updateCard(newCard) {
    let cards     = this.getState().cards
    let cardIndex = cards.findIndex((card) => card.id === newCard.id)

    cards.splice(cardIndex, 1, newCard)
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
