import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Store from '../lib/store'
import Wrapper from '../lib/wrapper'
import Tesseract from 'tesseract'
import { ipcRenderer } from 'electron'
import fs from 'fs'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { store: new Store() }

    ipcRenderer.on("new", (event) => {
      this.reload({seedData: true})
    })

    ipcRenderer.on("open", (event, files) => {
      this.reload(files[0])
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
