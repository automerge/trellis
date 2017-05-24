import Tesseract from 'tesseract'
import { createStore } from 'redux'
import fs from 'fs'
import uuid from './uuid'

export default class Store {
  constructor(config) {
    let tesseract = new Tesseract.init()

    tesseract = Tesseract.set(tesseract, "cards", [])
    tesseract = Tesseract.set(tesseract, "lists", [])

    this.redux = createStore((state = tesseract, action) => {
      switch(action.type) {
        case "CREATE_CARD":
          return this.createCard(state, action)
        case "MOVE_CARD":
          return this.moveCard(state, action)
        case "UPDATE_CARD_TITLE":
          return this.updateCardTitle(state, action)
        case "DELETE_CARD":
          return this.deleteCard(state, action)
        case "UPDATE_ASSIGNMENTS":
          return this.updateAssignments(state, action)
        case "CREATE_LIST":
          return this.createList(state, action)
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

  save() {
    return Tesseract.save(this.getState())
  }

  createList(state, action) {
    let attributes = Object.assign({}, action.attributes, { id: uuid() })
    return Tesseract.insert(state.lists, state.lists.length, attributes)
  }

  updateCardTitle(state, action) {
    let cardIndex = this._findIndex(state.cards, (c) => c.id === action.cardId)
    return Tesseract.set(state.cards[cardIndex], "title", action.newTitle)
  }

  updateAssignments(state, action) {
    let cardIndex = this._findIndex(state.cards, (c) => c.id === action.cardId)

    return Tesseract.set(state.cards[cardIndex].assigned, action.person, action.isAssigned)
  }

  openDocument(state, action) {
    let tesseract = Tesseract.load(action.file)
    return tesseract
  }

  mergeDocument(state, action) {
    let otherTesseract = Tesseract.load(action.file)
    return Tesseract.merge(state, otherTesseract)
  }

  newDocument(state, action) {
    let tesseract = new Tesseract.init()

    tesseract = Tesseract.set(tesseract, "cards", [])
    tesseract = Tesseract.set(tesseract, "lists", [])

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
    let card = Object.assign({}, action.attributes, { id: uuid(), assigned: {} })

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
