import Tesseract from 'tesseract'

export default class TesseractStorageAdapter {
  constructor(config={}) {
    this.tesseract = new Tesseract.Store()
    if(config.onLoad) {
      config.onLoad(this.getState())
    }
  }

  getState() {
    return this.tesseract.root.state
  }

  setState(state) {
    this.tesseract.root.state = state
  }
}
