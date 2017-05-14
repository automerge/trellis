import Tesseract from 'tesseract'
import fs from 'fs'

export default class Wrapper {
  constructor(config) {
    this.listeners = []
    this.subscribe = this.subscribe.bind(this)

    this.reloadTesseract(config)
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

  reloadTesseract(config) {
    let tesseract

    if(!config) {
      tesseract = new Tesseract.Store()
    } else if(typeof config === "string") {
      let file = fs.readFileSync(config)
      tesseract = Tesseract.load(file)
    } else if(config.seedData) {
      let seedData = require("../../initial_state.json")
      tesseract = new Tesseract.Store()
      tesseract.root.cards = seedData.cards
      tesseract.root.lists = seedData.lists
    }

    this.tesseract = tesseract
    this.root      = this.tesseract.root
    this.getState  = this.tesseract.getState
    this.pause     = this.tesseract.pause
    this.unpause   = this.tesseract.unpause
    this.merge     = this.tesseract.merge

    this.tesseract.subscribe(() => {
      this.listeners.forEach((listener) => listener())
    })

    this.listeners.forEach((l) => { l() })
  }

  link(store) {
    this.tesseract.link(store.tesseract)
  }
}
