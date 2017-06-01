import Tesseract from 'tesseract'
import { createStore } from 'redux'
import fs from 'fs'
import uuid from './uuid'
import EventEmitter from 'events'

export default class Store extends EventEmitter {
  constructor() {
    super()
    let tesseract = new Tesseract.init()

    this.redux = createStore((state = tesseract, action) => {
      let newState;
      console.log("ACTION: ", action.type)
       
      switch(action.type) {
        case "TOGGLE_BUTTON":
          newState = this.toggleButton(state, action)
          break; 
        // I wonder if we can do away with this or move it to aMPLNet?
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

  toggleButton(state, action) {
    let newButtonState = action.button
    return Tesseract.set(state, "button", newButtonState)
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
    let tesseract = new Tesseract.init()
    tesseract = Tesseract.set(tesseract, "docId", uuid())
    return tesseract
  }
}
