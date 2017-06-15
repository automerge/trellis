import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Peers from './peers'
import Clocks from './clocks'
import Changes from './changes'
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
    this.store    = new Store()
    this.state    = { highlightOptions: null }

    this.store.subscribe(() => {
      this.setState({}) // Force component to re-render
      this.autoSave()
    })

    ipcRenderer.on("new", (event) => { this.open() })

    ipcRenderer.on("forkDocument", () => {
      this.store.dispatch({ type: "FORK_DOCUMENT" })
      this.setWindowTitle()
    })

    ipcRenderer.on("openFromClipboard", (event, docUrl) => {
      let m = docUrl.match(/trellis:\/\/([a-z0-9-]+)/)
      if (m)
        this.open(m[1])
      else
        dialog.showErrorBox("Invalid document URL", "Should be trellis:// but your clipboard contains:\n\n" + docUrl)
    })

    ipcRenderer.on("shareToClipboard", (event) => {
      ipcRenderer.send("shareToClipboardResult", this.getDocUrl())
    })
  }

  // Ex. this.highlight({ cardId: this.store.getState().cards[0].id })
  highlight(options) {
    this.setState({ highlightOptions: options })
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

  getDocUrl() {
    return "trellis://" + this.getDocId()
  }

  setWindowTitle() {
    remote.getCurrentWindow().setTitle(this.getDocUrl())
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

  autoSave() {
    let exportFile = this.store.save()
    let fileName   = this.store.getState().docId + ".trellis"
    let savePath   = Path.join(SAVE_DIRECTORY, fileName)

    fs.writeFileSync(savePath, exportFile)
  }

  render() {
    let highlightCard = undefined
    let lastChange = this.store.getHistory().slice(-1)[0]
    if (lastChange && lastChange.changeset) {
      let message = lastChange.changeset.message
      if (message && message.action)
       highlightCard = message.action.cardId
    }

    return (
      <div className="App">
        <Board highlightOptions={ { cardId: highlightCard } } store={ this.store } />
        <Inspector store={ this.store } highlightCard={ highlightCard } />
        <div className="sidebar">
          <Peers network={ this.store.network } />
          <Clocks network={ this.store.network } />
          <Changes store={ this.store } highlight={ this.highlight } />
        </div>
      </div>
    )
  }
}
