import Tesseract from 'tesseract'

export default class Wrapper {
  constructor(tesseract = new Tesseract.Store()) {
    this.listeners = []
    this.subscribe = this.subscribe.bind(this)

    this.loadTesseract(tesseract)
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

  loadTesseract(newTesseract) {
    this.tesseract = newTesseract

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
