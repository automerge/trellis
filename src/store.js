import { createStore } from 'redux'

export default class Store {
  constructor() {
    let initialState = require("../initial_state.json") 

    this.reduxStore = createStore((state = initialState, action) => {
      switch(action.type) {
        case 'UPDATE_CARD':
          return this._updateCard(state, action)
        default:
          return state
      }
    })

    this.subscribe = this.reduxStore.subscribe
  }

  getState() {
    return this.reduxStore.getState()
  }

  updateCard(card) {
    this.reduxStore.dispatch({
      type: 'UPDATE_CARD',
      card: card
    })
  }

  _updateCard(state, action) {
    let newCard = action.card
    let cards   = state.cards

    let cardIndex = cards.findIndex((card) => {
      return card.id === newCard.id
    })

    cards[cardIndex] = newCard

    return Object.assign({}, state, { cards: cards })
  }

  findCard(cardId) {
    let state = this.getState()

    return state.cards.find((card) => {
      return cardId === card.id
    })
  }
}
