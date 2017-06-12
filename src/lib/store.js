import fs from 'fs'
import uuid from './uuid'
import seedData from './seed_data'
import aMPL from 'ampl'

const Tesseract = aMPL.Tesseract

export default class Store extends aMPL.Store {
  constructor() {
    super((state, action) => {
      switch(action.type) {
        case "CREATE_CARD":
          return this.createCard(state, action)
        case "MOVE_CARD":
          return this.moveCard(state, action)
        case "UPDATE_CARD_TITLE":
          return this.updateCardTitle(state, action)
        case "UPDATE_CARD_DESCRIPTION":
          return this.updateCardDescription(state, action)
        case "DELETE_CARD":
          return this.deleteCard(state, action)
        case "UPDATE_ASSIGNMENTS":
          return this.updateAssignments(state, action)
        case "CREATE_LIST":
          return this.createList(state, action)
        case "DELETE_LIST":
          return this.deleteList(state, action)
        default:
          return state
      }
    })
  }

  // Overwriting aMPL.Store#newDocument to load our own seed data
  newDocument(state, action) {
    let newState = Tesseract.init()

    return Tesseract.changeset(newState, (doc) => {
      let data = seedData()

      doc.cards = data.cards
      doc.lists = data.lists
      doc.docId = uuid()
    })
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

  updateCardDescription(state, action) {
    let cardIndex = this._findIndex(state.cards, (c) => c.id === action.cardId)
    return Tesseract.set(state.cards[cardIndex], "description", action.newDescription)
  }

  updateAssignments(state, action) {
    let cardIndex = this._findIndex(state.cards, (c) => c.id === action.cardId)

    return Tesseract.set(state.cards[cardIndex].assigned, action.person, action.isAssigned)
  }

  deleteCard(state, action) {
    let cards     = state.cards
    let cardIndex = this._findIndex(cards, (c) => c.id === action.cardId)

    return Tesseract.remove(cards, cardIndex)
  }

  moveCard(state, action) {
    // Move card to next list
    let cards     = state.cards
    let cardId    = action.cardId
    let cardIndex = this._findIndex(cards, (card) => card.id === cardId)
    let nextState = Tesseract.set(cards[cardIndex], "listId", action.listId)

    // Update order of every following card
    if(action.afterCardId) {
      let listCards   = this.findCardsByList(action.listId)
      let insertIndex = this._findIndex(listCards, (card) => card.id === action.afterCardId)
      let order       = (listCards[insertIndex].order || 0) + 1

      nextState = Tesseract.set(nextState.cards[cardIndex], "order", order)

      for(let index = insertIndex + 1; index <= listCards.length - 1; index++) {
        let globalIndex = this._findIndex(state.cards, (card) => card.id === listCards[index].id)

        if(globalIndex != cardIndex) {
          order = order + 1
          nextState = Tesseract.set(nextState.cards[globalIndex], "order", order)
        }
      }
    } else {
      let listCards = this.findCardsByList(action.listId)
      let order     = 0

      nextState = Tesseract.set(nextState.cards[cardIndex], "order", order)

      for(let index = 0; index < listCards.length; index++) {
        let globalIndex = this._findIndex(state.cards, (card) => card.id === listCards[index].id)

        if(globalIndex != cardIndex) {
          order = order + 1
          nextState = Tesseract.set(nextState.cards[globalIndex], "order", order)
        }
      }
    }

    return nextState
  }

  createCard(state, action) {
    return Tesseract.changeset(state, (doc) => {
      let listCards = this.findCardsByList(action.attributes.listId)
      let order

      if(listCards.length > 0)
        order = (listCards[listCards.length - 1].order || 0) + 1
      else
        order = 0

      let card = Object.assign({}, action.attributes, { order: order, id: uuid(), assigned: {} })
      doc.cards.push(card)
    })
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
    let filtered = this._filter(this.getState().cards, (card) => {
      return card.listId === listId
    })

    let sorted = this._sort(filtered, (a, b) => {
      let orderA = a.order || 0
      let orderB = b.order || 0

      return orderA - orderB
    })

    return sorted
  }

  _sort(cards, compare) {
    let array  = this._map(cards, (card) => { return { id: card.id, order: card.order } })
    let sorted = array.sort(compare)
    let output = sorted.map((card) => this.findCard(card.id))

    return output
  }

  findList(listId) {
    let state = this.getState()

    return this._find(state.lists, (list) => {
      return listId === list.id
    })
  }
}
