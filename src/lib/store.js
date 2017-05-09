import { createStore } from 'redux'
import { Store as TesseractStore } from 'tesseract'

export default class Store {
  constructor() {
    this.tesseract            = new TesseractStore("trellis")
    this.tesseract.root.state = require("../../initial_state.json")
    this.tesseract.subscribe(() => { console.log(this.tesseract.root.state.cards) })

    this.reduxStore = createStore((state = this.tesseract.root.state,  action) => {
      switch(action.type) {
        case 'UPDATE_CARD':
          return this._transform(state, this._updateCardDelta(state, action))
        case 'CREATE_CARD':
          return this._transform(state, this._createCardDelta(state, action))
        case 'DELETE_CARD':
          return this._transform(state, this._deleteCardDelta(state, action))
        case 'SET_STATE':
          return action.state
        default:
          return state
      }
    })

    this.subscribe = this.reduxStore.subscribe
    this.getState  = this.reduxStore.getState
  }

  // Persists to Tesseract and returns new state
  _transform(state, delta) {
    Object.assign(this.tesseract.root.state, delta)
    return Object.assign({}, state, delta)
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
