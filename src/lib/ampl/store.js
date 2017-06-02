import Tesseract from 'tesseract'
import { createStore } from 'redux'
import fs from 'fs'
import uuid from './uuid'
import aMPLNet from './amplnet'

export default class Store {
  constructor(reducer) {
    this.reducer   = reducer
    this.state     = this.tesseractInit()
    this.listeners = []
    this.network   = null
  }

  dispatch(action) {
    let state = this.state
    let newState

    switch(action.type) {
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
        newState = this.reducer(state, action)
    }

    this.state = newState

    if(action.type === "NEW_DOCUMENT" || action.type === "OPEN_DOCUMENT") {
      let network = new aMPLNet()
      network.connect({
        peerId: this.state._state.get("_id"),
        docId: this.state.docId,
        store: this
      })

      if(this.network) this.network.disconnect()
      this.network = network
    }

    this.network.broadcast(newState, action.type)
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

  getState() {
    return this.state
  }

  save() {
    return Tesseract.save(this.getState())
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
    return this.tesseractInit()
  }

  tesseractInit() {
    let tesseract = new Tesseract.init()
    tesseract = Tesseract.set(tesseract, "docId", uuid())

    return tesseract
  }
}
