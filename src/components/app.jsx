import React from 'react'
import Main from './main'
import Inspector from './inspector'
import Peers from './peers'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import Path from 'path'

import aMPL from 'ampl'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    window.app = this

    this.autoSave = this.autoSave.bind(this)

    this.store = new aMPL.Store((state, action) => {
      switch(action.type) {
        case "TOGGLE_BUTTON":
          return this.toggleButton(state, action)
        default:
          return state
      }
    })

    this.store.subscribe(this.autoSave)
    this.store.subscribe(() => this.setState({}))

    this.state = { savePath: null }
    
    ipcRenderer.on("new", (event) => {
      this.open()
    })

    ipcRenderer.on("open", (event, files) => {
      if(files && files.length > 0) {
        this.open(files[0])
        this.autoSave()
      }
    })

    ipcRenderer.on("merge", (event, files) => {
      if(files && files.length > 0) {
        let file = fs.readFileSync(files[0])

        this.store.dispatch({
          type: "MERGE_DOCUMENT",
          file: file
        })
      }
    })

    ipcRenderer.on("save", (event, savePath) => {
      if(savePath) {
        let name = Path.parse(savePath).name

        this.setState({ savePath: savePath }, () => {
          remote.getCurrentWindow().setTitle(name)
          localStorage.setItem("lastFileOpened", savePath)
          this.autoSave()
        })
      }
    })
  }

  componentDidMount() {
    let lastFileOpened = localStorage.getItem("lastFileOpened")

    if(lastFileOpened && fs.existsSync(lastFileOpened))
      this.open(lastFileOpened)
    else
      this.open()
  }

  open(path) {
    if(path) {
      this.setState({ savePath: path }, () => {
        let file = fs.readFileSync(path)
        let name = Path.parse(path).name

        this.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
        remote.getCurrentWindow().setTitle("Trellis - " + name)
        localStorage.setItem("lastFileOpened", path)
      })
    }
    else {
      this.setState({ savePath: null }, () => {
        this.store.dispatch({ type: "NEW_DOCUMENT" })
        remote.getCurrentWindow().setTitle("Trellis - Untitled")
      })
    }
  }

  toggleButton(state, action) {
    let newButtonState = action.button
    return aMPL.Tesseract.set(state, "button", newButtonState)
  }

  autoSave() {
    if(this.state.savePath) {
      console.log("Auto saving…")
      let exportFile = this.store.save()
      fs.writeFileSync(this.state.savePath, exportFile)
    }
  }

  render() {
    return (
      <div className="App">
        <Main store={ this.store } />
        <Inspector store={ this.store } />
        <Peers network={ this.store.network } />
      </div>
    )
  }
}
