import Tesseract from 'tesseract'
import seedData from './seed_data'
import { createStore } from 'redux'
import fs from 'fs'
import uuid from './uuid'

export default class Store {
  constructor(config) {
    this.reloadTesseract(config)
  }

  reloadTesseract(config) {
    let tesseract

    if(typeof config === "string") {
      let file = fs.readFileSync(config)
      tesseract = Tesseract.load(file)
    } else {
      tesseract = new Tesseract.init()
    }

    this.tesseract = tesseract

    this.redux = createStore((state = tesseract, action) => {
      switch(action.type) {
        case "CREATE_CARD":
          return this.createCard(state, action)
        case "MOVE_CARD":
          return this.moveCard(state, action)
        case "DELETE_CARD":
          return this.deleteCard(state, action)
        case "NEW_DOCUMENT":
          return this.newDocument(state, action)
        case "OPEN_DOCUMENT":
          return this.openDocument(state, action)
        case "MERGE_DOCUMENT":
          return this.mergeDocument(state, action)
        default:
          return state
      }
    })

    this.subscribe = this.redux.subscribe
    this.getState  = this.redux.getState
    this.dispatch  = this.redux.dispatch
  }

  openDocument(state, action) {
    let tesseract = Tesseract.load(action.file)
    return tesseract
  }

  mergeDocument(state, action) {
    debugger
    let otherTesseract = Tesseract.load(action.file)
    return Tesseract.merge(state, otherTesseract)
  }

  newDocument(state, action) {
    let data      = seedData()
    let tesseract = new Tesseract.init()

    tesseract = Tesseract.set(tesseract, "cards", data.cards)
    tesseract = Tesseract.set(tesseract, "lists", data.lists)

    return tesseract
  }

  deleteCard(state, action) {
    let cards     = state.cards
    let cardIndex = this._findIndex(cards, (c) => c.id === action.id)

    return Tesseract.remove(cards, cardIndex)
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

  findCard(cardId) {
    let state = this.getState()

    return this._find(state.cards, (card) => {
      return cardId === card.id
    })
  }

  _filter(array, callback) {
    let indices  = Object.keys(array)
    let filtered = []

    for(let index in indices) {
      let object = array[index]
      if(callback(object)) filtered.push(object)
    }

    return filtered
  }

  _find(array, callback) {
    let indices = Object.keys(array)

    for(let index in indices) {
      let object = array[index]
      if(callback(object)) return object
    }
  }

  _findIndex(array, callback) {
    let indices = Object.keys(array)

    for(let index in indices) {
      let object = array[index]
      if(callback(object)) return parseInt(index)
    }
  }

  _map(array, callback) {
    let indices = Object.keys(array)
    let output  = []

    for(let index in indices) {
      output[index] = callback(array[index], index)
    }

    return output
  }

  findCardsByList(listId) {
    return this._filter(this.getState().cards, (card) => {
      return card.listId === listId
    })
  }

  findList(listId) {
    let state = this.getState()

    return this._find(state.lists, (list) => {
      return listId === list.id
    })
  }
}
