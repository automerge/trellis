import { createStore } from 'redux'

export default class Store {
  constructor() {
    let initialState    = {}
    let serializedState = localStorage.getItem("state")

    // Load initial state from local storage or json file
    if(serializedState) {
      initialState = JSON.parse(serializedState)
    } else {
      initialState = require("../initial_state.json")
    }

    this.reduxStore = createStore((state = initialState, action) => {
      switch(action.type) {
        case 'UPDATE_CARD':
          return this.updateCardTransform(state, action)
        case 'CREATE_CARD':
          return this.createCardTransform(state, action)
        default:
          return state
      }
    })

    this.subscribe = this.reduxStore.subscribe
    this.getState  = this.reduxStore.getState

    this.subscribe(() => {
      localStorage.setItem("state", JSON.stringify(this.getState()))
    })
  }

  createCard(attributes) {
    this.reduxStore.dispatch({
      type: 'CREATE_CARD',
      attributes: attributes
    })
  }

  createCardTransform(state, action) {
    let nextId = Math.max.apply(null, state.cards.map((c) => c.id)) + 1
    let card   = Object.assign({}, action.attributes, { id: nextId })
    let cards  = [...state.cards, card]

    return Object.assign({}, state, { cards: cards })
  }

  updateCard(card) {
    this.reduxStore.dispatch({
      type: 'UPDATE_CARD',
      card: card
    })
  }

  updateCardTransform(state, action) {
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
