import Tesseract from 'tesseract'
import { createStore } from 'redux'
import fs from 'fs'
import uuid from './uuid'
import seedData from './seed_data'
import EventEmitter from 'events'


export default class Store extends EventEmitter {
  constructor() {
    super()
    let tesseract = new Tesseract.init()

    this.redux = createStore((state = tesseract, action) => {
      let newState;
      console.log("ACTION: ", action.type)
       
      switch(action.type) {
        case "CREATE_CARD":
          newState = this.createCard(state, action)
          break; 
        case "MOVE_CARD":
          newState = this.moveCard(state, action)
          break;
        case "UPDATE_CARD_TITLE":
          newState = this.updateCardTitle(state, action)
          break;
        case "DELETE_CARD":
          newState = this.deleteCard(state, action)
          break;
        case "UPDATE_ASSIGNMENTS":
          newState = this.updateAssignments(state, action)
          break;
        case "CREATE_LIST":
          newState = this.createList(state, action)
          break;
        case "DELETE_LIST":
          newState = this.deleteList(state, action)
          break;          
        case "NEW_DOCUMENT":
          newState = this.newDocument(state, action)
          break;
        case "OPEN_DOCUMENT":
          newState = this.openDocument(state, action)
          break;
        case "MERGE_DOCUMENT":
          newState = this.mergeDocument(state, action)
          break;
        case "APPLY_DELTAS":
          newState = this.applyDeltas(state, action)
          break;
        default:
          newState = state

      }

      if (action.type != "APPLY_DELTAS") {
        this.emit('change', newState)
      }

      return newState;
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

  deleteList(state, action) {
    let listIndex = this._findIndex(state.lists, (l) => l.id === action.listId)
    let listCards = this.findCardsByList(action.listId)
    let listCardIndexes = this._map(listCards, (lc) => {
      return this._findIndex(state.cards, (c) => c.id === lc.id)
    })

    listCardIndexes.forEach((index) => {
      state = Tesseract.remove(state.cards, index)
    })

    return Tesseract.remove(state.lists, listIndex)
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

  applyDeltas(state, action) {
    return Tesseract.applyDeltas(state, action.deltas)
  }

  newDocument(state, action) {
    let data      = seedData()
    let tesseract = new Tesseract.init()

    tesseract = Tesseract.set(tesseract, "docId", uuid())
    tesseract = Tesseract.set(tesseract, "cards", data.cards)
    tesseract = Tesseract.set(tesseract, "lists", data.lists)

    return tesseract
  }

  deleteCard(state, action) {
    let cards     = state.cards
    let cardIndex = this._findIndex(cards, (c) => c.id === action.cardId)

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

  changes() {
    return [
      { id: 1, user: "Adam", action: "create"  },
      { id: 2, user: "Peter", action: "move"  },
      { id: 3, user: "Peter", action: "assign"  }
    ]
  }
}
