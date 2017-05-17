import Wrapper from './wrapper'
import uuid from './uuid'

export default class Store extends Wrapper {
  createCard(attributes) {
    let state  = this.getState()
    let nextId = uuid()
    let card   = Object.assign({}, attributes, { id: nextId })

    this.tesseract.root.cards.push(card)
  }

  updateCard(cardId, attributes) {
    let cards     = this.getState().cards
    let cardIndex = this._findIndex(cards, (card) => card.id === cardId)

    Object.assign(cards[cardIndex], attributes)
  }

  deleteCard(card) {
    let cards     = this.getState().cards
    let cardIndex = cards.findIndex((c) => c.id === card.id)

    cards.splice(cardIndex, 1)
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
      if(callback(object)) return index
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
