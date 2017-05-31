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

      this.emit('change', action.type, newState)

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
    let card      = Object.assign({}, action.attributes, { id: uuid(), assigned: {} })
    let listCards = this.findCardsByList(action.attributes.listId)
    let order

    if(listCards.length > 0)
      order = (listCards[listCards.length - 1].order || 0) + 1
    else
      order = 0

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

  changes() {
    // Tesseract internals has a changes list like this:
    //
    // tesseract._state = { actor_id: [ action1, action2, action3 ] }
    //
    // So here's we'll flatten and filter to just actions we think are
    // interesting for display to the end user.

    let nestedActions = this.getState()._state.get('actions').toJS()

    let actions = []
    Object.keys(nestedActions).forEach((k) => {
      return actions = actions.concat(nestedActions[k])
    })

    let result = []

    let people = [ "orion", "adam", "pvh", "roshan", "martin" ]

    // For now, we can only differentiate "me" from "everyone else" in the
    // actions list. Get Orion or Martin to help tie together peer IDs, names,
    // and Tesseract changes.
    let myTesseractId = this.getState()._state.get('_id')

    // Hacky assumption: first target ID in the list is for cards allows us to
    // tell difference between cards and lists.
    let cardsId = undefined

    actions.forEach((action, index) => {
      let r = undefined

      if (!cardsId && action.action == "ins")
        cardsId = action.target

      let type = (cardsId == action.target) ? "card" : "list"
      let user = (action.by == myTesseractId) ? "You" : "Someone"

      if (action.action == "ins")
        r = { id: index, user: user, action: "created", type: type }

      if (action.action == "set" && action.key == "listId" &&
          result.length > 0 && result[result.length-1].action != "created")
        r = { id: index, user: user, action: "moved", type: "card" }

      if (action.action == "set" && people.includes(action.key))
        r = { id: index, user: user, action: "assigned", type: "card" }

      if (action.action == "del")
        r = { id: index, user: user, action: "deleted", type: type }

      if (r) result.push(r)
    })

    return result
  }
}
