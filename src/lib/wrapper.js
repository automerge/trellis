import Tesseract from 'tesseract'
import seedData from './seed_data'
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
      let data = seedData()

      tesseract = new Tesseract.Store()
      tesseract.root.cards = data.cards
      tesseract.root.lists = data.lists
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
