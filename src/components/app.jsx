import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Store from '../lib/store'
import Tesseract from 'tesseract'
import { ipcRenderer } from 'electron'
import fs from 'fs'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.autoSave = this.autoSave.bind(this)

    this.state = { savePath: null, store: new Store({seedData: true}) }

    ipcRenderer.on("new", (event) => {
      this.setState({ savePath: null }, () => {
        this.state.store.dispatch({ type: "NEW_DOCUMENT" })
      })
    })

    ipcRenderer.on("open", (event, path) => {
      let file = fs.readFileSync(path)

      this.state.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
      this.setState({ savePath: path }, this.autoSave)
    })

    ipcRenderer.on("merge", (event, files) => {
      let file = fs.readFileSync(files[0])

      this.state.store.dispatch({
        type: "MERGE_DOCUMENT",
        file: file
      })
    })

    ipcRenderer.on("save", (event, path) => {
      this.setState({ savePath: path }, this.autoSave)
    })
  }

  autoSave() {
    if(!!this.state.savePath) {
      console.log("Auto saving..")
      let exportFile = Tesseract.save(this.state.store.getState())
      fs.writeFileSync(this.state.savePath, exportFile)
    }

    setTimeout(this.autoSave, 5000)
  }

  reload(config) {
    this.state.store.reloadTesseract(config)
    this.setState({ store: this.state.store })
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.state.store } />
        <Inspector store={ this.state.store } />
      </div>
    )
  }
}
