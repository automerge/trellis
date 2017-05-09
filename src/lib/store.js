import { Store as TesseractStore } from 'tesseract'

function createStore(initialState, reducer) {
  let store      = {}
  store.state    = initialState
  store.reducer  = reducer
  store.handlers = []

  store.getState  = function()       { return this.state }.bind(store)

  store.subscribe = function(handler) {
    this.handlers.push(handler)
  }.bind(store)

  store.dispatch  = function(action) {
    // Always mutate the same state object (e.g. Tesseract)
    // Reducer should now return object deltas instead of
    // new state object.
    Object.assign(this.state, this.reducer(this.state, action))
    this.handlers.forEach((handler) => { handler(this.state) })
  }.bind(store)

  return store
}

export default class Store {
  constructor() {
    this.tesseract            = new TesseractStore("trellis")
    this.tesseract.root.state = require("../../initial_state.json")

    this.reduxStore = createStore(this.tesseract.root.state, (state,  action) => {
      switch(action.type) {
        case 'UPDATE_CARD':
          return this._updateCardDelta(state, action)
        case 'CREATE_CARD':
          return this._createCardDelta(state, action)
        case 'DELETE_CARD':
          return this._deleteCardDelta(state, action)
        case 'SET_STATE':
          return action.state
        default:
          return state
      }
    })

    this.subscribe = this.reduxStore.subscribe
    this.getState  = this.reduxStore.getState
  }

  createCard(attributes) {
    this.reduxStore.dispatch({
      type: 'CREATE_CARD',
      attributes: attributes
    })
  }

  _createCardDelta(state, action) {
    let nextId = Math.max.apply(null, state.cards.map((c) => c.id)) + 1
    let card   = Object.assign({}, action.attributes, { id: nextId })
    let cards  = [...state.cards, card]

    return { cards: cards }
  }

  updateCard(card) {
    this.reduxStore.dispatch({
      type: 'UPDATE_CARD',
      card: card
    })
  }

  _updateCardDelta(state, action) {
    let newCard = action.card
    let cards   = state.cards

    let cardIndex = cards.findIndex((card) => {
      return card.id === newCard.id
    })

    cards[cardIndex] = newCard

    return { cards: cards }
  }

  deleteCard(card) {
    this.reduxStore.dispatch({
      type: 'DELETE_CARD',
      card: card
    })
  }

  _deleteCardDelta(state, action) {
    let deleteCard = action.card
    let cards = state.cards

    let cardIndex = cards.findIndex((card) => {
      return card.id === deleteCard.id
    })

    cards = cards.slice(0, cardIndex).concat(cards.slice(cardIndex+1, cards.length))

    return { cards: cards }
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
