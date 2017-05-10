import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Connection from './connection'
import Store from '../lib/store'
import { Store as TesseractStore } from 'tesseract'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.store = new Store()

    this.inspectorTesseract            = new TesseractStore("inspector")
//    this.inspectorTesseract.root.cards = require("../../initial_state.json").cards
//    this.inspectorTesseract.root.lists = require("../../initial_state.json").lists

    this.store.link(this.inspectorTesseract)

    this.inspectorTesseract.root.cards[0].title = "Change made from inspector"
    this.inspectorTesseract.root.cards[1].title = "Another change"
    this.inspectorTesseract.root.cards[0].title = "3rd change"
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.store } />
        <Inspector tesseract={ this.inspectorTesseract } />
        <Connection connected={true} />
      </div>
    )
  }
}
