import Tesseract from 'tesseract'
import seedData from './seed_data'
import { createStore } from 'redux'
import fs from 'fs'
import uuid from './uuid'

export default class Wrapper {
  constructor(config) {
    this.reloadTesseract(config)
  }

  reloadTesseract(config) {
    let tesseract

    if(!config) {
      tesseract = new Tesseract.init()
    } else if(typeof config === "string") {
      let file = fs.readFileSync(config)
      tesseract = Tesseract.load(file)
    } else if(config.seedData) {
      let data = seedData()

      tesseract = new Tesseract.init()
      tesseract = Tesseract.set(tesseract, "cards", data.cards)
      tesseract = Tesseract.set(tesseract, "lists", data.lists)
    }

    this.tesseract = tesseract

    this.redux = createStore((state = tesseract, action) => {
      switch(action.type) {
        case "CREATE_CARD":
          return this.createCard(state, action)
        case "MOVE_CARD":
          return this.moveCard(state, action)
        default:
          return state
      }
    })

    this.subscribe = this.redux.subscribe
    this.getState  = this.redux.getState
    this.dispatch  = this.redux.dispatch
  }

  moveCard(state, action) {
    let cards     = state.cards
    let cardId    = action.cardId
    let cardIndex = this._findIndex(cards, (card) => card.id === cardId)

    return Tesseract.set(cards[cardIndex], "listId", action.listId)
  }

  createCard(state, action) {
    let nextId = uuid()
    let card   = Object.assign({}, action.attributes, { id: nextId })

    return Tesseract.insert(state.cards, state.cards.length, card)
  }

  link(store) {
    this.tesseract.link(store.tesseract)
  }
}
