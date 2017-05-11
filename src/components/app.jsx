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

    this.store.subscribe(() => {
      let state = this.store.getState()

      Object.entries(state.cards).forEach((entry) => {
        let id   = entry[0]
        let card = entry[1]

        if(Object.keys(card._conflicts).length > 0) {
          console.log("conflicts: ", card._conflicts)
        }
      })
    })
  }


  render() {
    return (
      <div className="App">
        <Board store={ this.store } />
        <Inspector tesseract={ this.inspectorTesseract } />
        <Connection connected={true} store={ this.store } tesseract={ this.inspectorTesseract } />
      </div>
    )
  }
}
