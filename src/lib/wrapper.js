import Tesseract from 'tesseract'
import seedData from './seed_data'
import { createStore } from 'redux'
import fs from 'fs'

export default class Wrapper {
  constructor(config) {
    this.reloadTesseract(config)
  }

  reloadTesseract(config) {
    let tesseract

    if(!config) {
      tesseract = new Tesseract.init()
    } else if(typeof config === "string") {
      let file = fs.readFileSync(config)
      tesseract = Tesseract.load(file)
    } else if(config.seedData) {
      let data = seedData()

      tesseract = new Tesseract.init()
      tesseract = Tesseract.set(tesseract, "cards", data.cards)
      tesseract = Tesseract.set(tesseract, "lists", data.lists)
    }

    this.tesseract = tesseract

    this.redux = createStore((state = tesseract, action) => {
      return state
    })

    this.subscribe = this.redux.subscribe
    this.getState  = this.redux.getState
  }

  link(store) {
    this.tesseract.link(store.tesseract)
  }
}
