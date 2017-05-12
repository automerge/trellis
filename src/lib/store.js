import { Store as TesseractStore } from 'tesseract'
const remote  = require('electron').remote
const app     = remote.getGlobal("app")
const fs      = require("fs")

export default class Store {
  constructor() {
    this.listeners = []
    this.subscribe = this.subscribe.bind(this)

    this.loadTesseract(new TesseractStore())
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

  loadTesseract(newTesseract) {
    this.tesseract = newTesseract

    this.getState  = this.tesseract.getState
    this.link      = this.tesseract.link
    this.pause     = this.tesseract.pause
    this.unpause   = this.tesseract.unpause
    this.merge     = this.tesseract.merge

    this.tesseract.subscribe(() => {
      this.listeners.forEach((listener) => listener())
    })

    this.listeners.forEach((l) => { l() })
  }

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
