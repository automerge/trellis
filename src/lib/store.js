import { Store as TesseractStore } from 'tesseract'
const remote  = require('electron').remote
const app     = remote.getGlobal("app")
const fs      = require("fs")

export default class Store {
  constructor() {
    let initialState = JSON.parse(localStorage.getItem("trellis"))
    if(!initialState) initialState = require("../../initial_state.json")

    this.tesseract            = new TesseractStore("trellis")
    this.tesseract.root.cards = initialState.cards
    this.tesseract.root.lists = initialState.lists

    this.subscribe = this.tesseract.subscribe
    this.getState  = this.tesseract.getState
    this.link      = this.tesseract.link
    this.pause     = this.tesseract.pause
    this.unpause   = this.tesseract.unpause

    this.subscribe(() => {
      let state = JSON.stringify(this.getState())
      localStorage.setItem("trellis", state)

      let exportFile = this.tesseract.export()
      fs.writeFileSync(app.getPath("desktop") + "/trellis.tesseract", exportFile)
    })
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
