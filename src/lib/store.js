import fs from 'fs'
import uuid from './uuid'
import seedData from './seed_data'
import MPL from 'mpl'

const Automerge = MPL.Automerge

export default class Store extends MPL.Store {
  constructor() {
    // Peer name needs to be set before we initialize the
    // MPL Store where the network is also initialized
    let peerName = process.env.NAME || localStorage.getItem("peerName")
    if(peerName)
      MPL.config.name = peerName
    else {
      let names = [ "Amelia", "Marco", "Isabella",
                    "Meriweather", "Valentina", "Yuri" ]

      MPL.config.name = names[Math.floor(Math.random() * names.length)]
    }

    super((state, action) => {
      switch(action.type) {
        case "UPDATE_BOARD_TITLE":
          return this.updateBoardTitle(state, action)
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
        // To make time travel work, we set our state outside of MPL
        // and override .dispatch and .getState to ignore actions
        // and return our time travel state.
        case "TIME_TRAVEL":
          this.localState.timeTravel = {
            index: action.index,
            change: action.change,
            prevChange: action.prevChange
          }
          return state
        case "STOP_TIME_TRAVEL":
          this.localState.timeTravel = undefined
          return state
        case "INSPECTOR_UPDATE":
          return this.inspectorUpdate(state, action)
        case "CREATE_COMMENT":
          return this.createComment(state, action)
        default:
          return state
      }
    })

    this.localState = {}
  }

  createComment(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      if(!Array.isArray(doc.comments))
        doc.comments = []

      doc.comments.push({
        id: uuid(),
        cardId: action.cardId,
        body: action.body,
        author: MPL.config.name ,
        createdAt: new Date().toJSON()
      })
    })
  }

  // Ignore all actions if we are time traveling, unless we are
  // stopping time travel or receiving inbound deltas from the network
  dispatch(action) {
    if(action.type != "STOP_TIME_TRAVEL"
        && action.type != "TIME_TRAVEL"
        && action.type != "APPLY_DELTAS"
        && this.localState.timeTravel) {
      console.log("Ignoring action because we are time traveling.")
    } else {
      MPL.Store.prototype.dispatch.call(this, action)
    }
  }

  // If we are time traveling, return our snapshot of the
  // time travel state instead of the current state.
  getState() {
    if(this.localState.timeTravel && this.localState.timeTravel.change) {
      return this.localState.timeTravel.change.snapshot
    } else {
      return MPL.Store.prototype.getState.call(this)
    }
  }

  meta(action) {
    return {
      author: MPL.config.name || "Unknown",
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

  capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
  }

  humanize(docId) {
    let m = docId.match(/^([a-z]+)-([a-z]+)-([0-9])/)
    return this.capitalize(m[1]) + " " + this.capitalize(m[2])
  }

  inspectorUpdate(state, action) {
    try {
      return Automerge.change(state, this.meta(action), (doc) => {
        if(action.table && action.row && action.column && action.value)
          doc[action.table][action.row][action.column] = JSON.parse(action.value)
        else if(action.key && action.value) {
          doc[action.key] = JSON.parse(action.value)
        }
      })
    } catch(e) {
      console.log(e)
      return state
    }
  }

  // Overwriting MPL.Store#newDocument to load our own seed data
  newDocument(state, action) {
    let newState = Automerge.init()

    return Automerge.change(newState, this.meta(action), (doc) => {
      let data = seedData()

      doc.cards = data.cards
      doc.lists = data.lists
      doc.docId = this.generateDocId()
      doc.boardTitle = this.humanize(doc.docId)
    })
  }

  // Overwriting MPL.Store#forkDocument to load our own seed data
  forkDocument(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      doc.docId = this.generateDocId()
    })
  }

  updateBoardTitle(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      doc.boardTitle = action.value
    })
  }

  createList(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      let attributes = Object.assign({}, action.attributes, { id: uuid() })
      doc.lists.push(attributes)
    })
  }

  deleteList(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      let listIndex = state.lists.findIndex(l => l.id === action.listId)
      let listCards = this.findCardsByList(action.listId)

      Object.keys(listCards).forEach((key) => {
        let card = listCards[key]
        let index = doc.cards.findIndex(c => c.id === card.id)
        delete doc.cards[index]
      })

      delete doc.lists[listIndex]
    })
  }

  updateCardTitle(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      let cardIndex = state.cards.findIndex(c => c.id === action.cardId)
      doc.cards[cardIndex].title = action.newTitle
    })
  }

  updateCardDescription(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      let cardIndex = state.cards.findIndex(c => c.id === action.cardId)
      doc.cards[cardIndex].description = action.newDescription
    })
  }

  updateAssignments(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      let cardIndex = state.cards.findIndex(c => c.id === action.cardId)
      doc.cards[cardIndex].assigned[action.person] = action.isAssigned
    })
  }

  deleteCard(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      let cards     = state.cards
      let cardIndex = cards.findIndex(c => c.id === action.cardId)

      delete doc.cards[cardIndex]
    })
  }

  moveCard(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
      // Move card to next list
      let cards     = state.cards
      let cardId    = action.cardId
      let cardIndex = cards.findIndex(card => card.id === cardId)

      doc.cards[cardIndex].listId = action.listId

      // Update order of every following card
      if(action.afterCardId) {
        let listCards   = this.findCardsByList(action.listId)
        let insertIndex = listCards.findIndex(card => card.id === action.afterCardId)
        let order       = (listCards[insertIndex].order || 0) + 1

        doc.cards[cardIndex].order = order

        for(let index = insertIndex + 1; index <= listCards.length - 1; index++) {
          let globalIndex = state.cards.findIndex(card => card.id === listCards[index].id)

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
          let globalIndex = state.cards.findIndex(card => card.id === listCards[index].id)

          if(globalIndex != cardIndex) {
            order = order + 1
            doc.cards[globalIndex].order = order
          }
        }
      }
    })
  }

  createCard(state, action) {
    return Automerge.change(state, this.meta(action), (doc) => {
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
    return this.findCardFromState(cardId, this.getState())
  }

  findCardFromState(cardId, state) {
    return state.cards.find(card => cardId === card.id)
  }

  findCardsByList(listId) {
    let filtered = this.getState().cards.filter(card => card.listId === listId)

    let sorted = filtered.sort((a, b) => {
      let orderA = a.order || 0
      let orderB = b.order || 0

      return orderA - orderB
    })

    return sorted
  }

  findCommentsByCard(cardId) {
    if(!Array.isArray(this.getState().comments))
      return []

    let filtered = this.getState().comments.filter(comment => comment.cardId === cardId)

    let sorted = filtered.sort((a, b) => {
      let timestampA = Date.parse(a.createdAt || 0)
      let timestampB = Date.parse(b.createdAt || 0)

      return timestampB - timestampA
    })

    return sorted
  }

  findComment(commentId) {
    return this.findCommentFromState(commentId, this.getState())
  }

  findCommentFromState(commentId, state) {
    return state.comments.find(comment => commentId === comment.id )
  }

  findList(listId) {
    return this.findListFromState(listId, this.getState())
  }

  findListFromState(listId, state) {
    return state.lists.find(list => listId === list.id)
  }
}
