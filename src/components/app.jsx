import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Connection from './connection'
import Store from '../lib/store'
import { Store as TesseractStore } from 'tesseract'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.store              = new Store()
    this.inspectorTesseract = new TesseractStore("inspector")

    this.store.link(this.inspectorTesseract)
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.store } />
        <Connection connected={true} store={ this.store } tesseract={ this.inspectorTesseract } />
        <Inspector tesseract={ this.inspectorTesseract } />
      </div>
    )
  }
}
