import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Connection from './connection'
import Store from '../lib/store'
import { Store as TesseractStore } from 'tesseract'
import { ipcRenderer } from 'electron'

const Tesseract = require("tesseract")
const fs        = require("fs")

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.store              = new Store()
    this.inspectorTesseract = new TesseractStore("inspector")

    this.store.link(this.inspectorTesseract)

    ipcRenderer.on("new", (event) => {
      let initialState    = require("../../initial_state.json")
      let newStore        = new Tesseract.Store()
      newStore.root.cards = initialState.cards
      newStore.root.lists = initialState.lists

      this.store.loadTesseract(newStore)
    })

    ipcRenderer.on("open", (event, files) => {
      let file      = fs.readFileSync(files[0])
      let newStore  = Tesseract.load(file)

      this.store.loadTesseract(newStore)
    })

    ipcRenderer.on("merge", (event, files) => {
      let file     = fs.readFileSync(files[0])
      let newStore = Tesseract.load(file)

      this.store.merge(newStore)
    })

    ipcRenderer.on("save", (event, path) => {
      let exportFile = this.store.tesseract.save()
      fs.writeFileSync(path, exportFile)
    })
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
