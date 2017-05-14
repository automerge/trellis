import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Connection from './connection'
import Store from '../lib/store'
import Wrapper from '../lib/wrapper'
import { Store as TesseractStore } from 'tesseract'
import { ipcRenderer } from 'electron'

const Tesseract = require("tesseract")
const fs        = require("fs")

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      store: new Store(),
      inspectorStore: new Wrapper()
    }

    this.state.store.link(this.state.inspectorStore)

    ipcRenderer.on("new", (event) => {
      let initialState              = require("../../initial_state.json")
      let newTesseract              = new Tesseract.Store()
      newTesseract.root.cards       = initialState.cards
      newTesseract.root.lists       = initialState.lists

      this.reload(newTesseract)
    })

    ipcRenderer.on("open", (event, files) => {
      let file         = fs.readFileSync(files[0])
      let newTesseract = Tesseract.load(file)

      this.reload(newTesseract)
    })

    ipcRenderer.on("merge", (event, files) => {
      let file     = fs.readFileSync(files[0])
      let newStore = Tesseract.load(file)

      this.state.store.merge(newStore)
    })

    ipcRenderer.on("save", (event, path) => {
      let exportFile = this.state.store.tesseract.save()
      fs.writeFileSync(path, exportFile)
    })
  }

  reload(newTesseract) {
    this.state.store.loadTesseract(newTesseract)
    this.state.inspectorStore.loadTesseract(new Tesseract.Store())

    this.state.store.link(this.state.inspectorStore)

    this.setState({ store: this.state.store, inspectorStore: this.state.inspectorStore })
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.state.store } />
        <Connection connected={true} store={ this.state.store } inspectorStore={ this.state.inspectorStore } />
        <Inspector store={ this.state.inspectorStore } />
      </div>
    )
  }
}
