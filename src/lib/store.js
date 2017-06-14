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

  displayChange(meta) {
    if (!meta.author || !meta.action) return ""

    switch(meta.action.type) {
      case "CREATE_CARD":
        return meta.author + " created a card"
      case "MOVE_CARD":
        return meta.author + " moved a card"
      case "UPDATE_CARD_TITLE":
        return meta.author + " renamed a card"
      case "UPDATE_CARD_DESCRIPTION":
        return meta.author + " changed card description"
      case "DELETE_CARD":
        return meta.author + " deleted a card"
      case "UPDATE_ASSIGNMENTS":
        return meta.author + " assigned a card"
      case "CREATE_LIST":
        return meta.author + " created a list"
      case "DELETE_LIST":
        return meta.author + " deleted a list"
      default:
        return meta.author + " " + meta.action.type
    }
  }

  meta(action) {
    return {
      author: process.env.NAME,
      action: action
    }
  }

  randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateDocId() {
    const colors = [ 'cobalt', 'emerald', 'burgundy', 'gray', 'orange', 'violet', 'silver', 'saffron', 'crimson', 'cyan' ]
    const cities = [ 'shanghai', 'karachi', 'bejing', 'delhi', 'lagos', 'tianjin', 'istanbul', 'tokyo', 'guangzhou', 'mumbai', 'moscow', 'shenzhen', 'jakarta', 'cairo' ]

    let color = colors[this.randRange(0, colors.length-1)]
    let city = cities[this.randRange(0, cities.length-1)]
    let number = Math.round(Math.random()*100)

    return color + "-" + city + "-" + number
  }

  // Overwriting aMPL.Store#newDocument to load our own seed data
  newDocument(state, action) {
    let newState = Tesseract.init()

    return Tesseract.changeset(newState, (doc) => {
      let data = seedData()

      doc.cards = data.cards
      doc.lists = data.lists
      doc.docId = this.generateDocId()
    })
  }

  createList(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
      let attributes = Object.assign({}, action.attributes, { id: uuid() })
      doc.lists.push(attributes)
    })
  }

  deleteList(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
      let listIndex = this._findIndex(state.lists, (l) => l.id === action.listId)
      let listCards = this.findCardsByList(action.listId)

      Object.keys(listCards).forEach((key) => {
        let card = listCards[key]
        let index = this._findIndex(doc.cards, (c) => c.id === card.id)
        delete doc.cards[index]
      })

      delete doc.lists[listIndex]
    })
  }

  updateCardTitle(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
      let cardIndex = this._findIndex(state.cards, (c) => c.id === action.cardId)
      doc.cards[cardIndex].title = action.newTitle
    })
  }

  updateCardDescription(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
      let cardIndex = this._findIndex(state.cards, (c) => c.id === action.cardId)
      doc.cards[cardIndex].description = action.newDescription
    })
  }

  updateAssignments(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
      let cardIndex = this._findIndex(state.cards, (c) => c.id === action.cardId)
      doc.cards[cardIndex].assigned[action.person] = action.isAssigned
    })
  }

  deleteCard(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
      let cards     = state.cards
      let cardIndex = this._findIndex(cards, (c) => c.id === action.cardId)

      delete doc.cards[cardIndex]
    })
  }

  moveCard(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
      // Move card to next list
      let cards     = state.cards
      let cardId    = action.cardId
      let cardIndex = this._findIndex(cards, (card) => card.id === cardId)

      doc.cards[cardIndex].listId = action.listId

      // Update order of every following card
      if(action.afterCardId) {
        let listCards   = this.findCardsByList(action.listId)
        let insertIndex = this._findIndex(listCards, (card) => card.id === action.afterCardId)
        let order       = (listCards[insertIndex].order || 0) + 1

        doc.cards[cardIndex].order = order

        for(let index = insertIndex + 1; index <= listCards.length - 1; index++) {
          let globalIndex = this._findIndex(state.cards, (card) => card.id === listCards[index].id)

          if(globalIndex != cardIndex) {
            order = order + 1
            doc.cards[globalIndex].order = order
          }
        }
      } else {
        let listCards = this.findCardsByList(action.listId)
        let order     = 0

        doc.cards[cardIndex].order = order

        for(let index = 0; index < listCards.length; index++) {
          let globalIndex = this._findIndex(state.cards, (card) => card.id === listCards[index].id)

          if(globalIndex != cardIndex) {
            order = order + 1
            doc.cards[globalIndex].order = order
          }
        }
      }
    })
  }

  createCard(state, action) {
    return Tesseract.changeset(state, this.meta(action), (doc) => {
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
