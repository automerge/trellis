import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Peers from './peers'
import Clocks from './clocks'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import Path from 'path'

const SAVE_DIRECTORY = Path.join(remote.app.getPath('documents'), "Trellis")
if(!fs.existsSync(SAVE_DIRECTORY)) fs.mkdirSync(SAVE_DIRECTORY)

const {dialog} = require('electron').remote

export default class App extends React.Component {
  constructor(props) {
    super(props)

    window.app    = this
    this.autoSave = this.autoSave.bind(this)
    this.state    = { savePath: null }
    this.store    = new Store()

    this.store.subscribe(() => {
      this.setState({}) // Force component to re-render
      this.autoSave()
    })

    ipcRenderer.on("new", (event) => { this.open() })

    ipcRenderer.on("openFromClipboard", (event, docId) => {
      if (this.isValidDocId(docId))
        this.open(docId)
      else
        dialog.showErrorBox("Invalid DocID", "Your clipboard contains:\n\n" + docId)
    })

    ipcRenderer.on("shareToClipboard", (event) => {
      ipcRenderer.send("shareToClipboardResult", this.getDocId())
    })
  }

  componentDidMount() {
    let lastDocOpened = localStorage.getItem("lastDocOpened")

    if(lastDocOpened)
      this.open(lastDocOpened)
    else
      this.open()
  }

  getDocId() {
    return this.store.getState().docId
  }

  setWindowTitle() {
    remote.getCurrentWindow().setTitle(this.getDocId())
  }

  open(docId) {
    let fileName = docId + ".trellis"
    let savePath = Path.join(SAVE_DIRECTORY, fileName)

    if(!docId) {
      this.store.dispatch({ type: "NEW_DOCUMENT" })
    } else if(fs.existsSync(savePath)) {
      let file = fs.readFileSync(savePath)
      this.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
    } else {
      this.store.dispatch({ type: "OPEN_DOCUMENT", docId: docId })
    }

    localStorage.setItem("lastDocOpened", this.getDocId())
    this.setWindowTitle()
  }

  isValidDocId(docId) {
    return (docId.match(/^[0-9a-fA-F-]+$/) && docId.length > 4)
  }

  autoSave() {
    let exportFile = this.store.save()
    let fileName   = this.store.getState().docId + ".trellis"
    let savePath   = Path.join(SAVE_DIRECTORY, fileName)

    console.log("Auto saving…")
    fs.writeFileSync(savePath, exportFile)
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.store } />
        <Inspector store={ this.store } />
        <div className="sidebar">
          <div className="DocID">
            <span className="label">DocID</span>
            <span className="ID">{ this.getDocId() }</span>
          </div>
          <Peers network={ this.store.network } />
          <Clocks network={ this.store.network } />
        </div>
      </div>
    )
  }
}
