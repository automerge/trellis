import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Peers from './peers'
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

  // Clumsy diff to find the ID of the card created by CREATE_CARD
  findCreatedCard(prevChange, currentChange) {
    let oldCards = prevChange.snapshot.cards
    let newCards = currentChange.snapshot.cards
    if (!oldCards || !newCards) return

    for (var i = 0; i < newCards.length; i++) {
      var card1 = newCards[i]
      var found = false
      for (var j = 0; j < oldCards.length; j++) {
        var card2 = oldCards[j]
        if (card1.id == card2.id)
          found = true
      }
      if (!found)
        return card1.id
    }
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
    if(!this.store.localState.timeTravel) {
      let exportFile = this.store.save()
      let fileName   = this.store.getState().docId + ".trellis"
      let savePath   = Path.join(SAVE_DIRECTORY, fileName)

      fs.writeFileSync(savePath, exportFile)
      localStorage.setItem("lastDocOpened", this.getDocId())
      this.setWindowTitle()
    }
  }

  render() {
    let highlightCard = undefined
    let recentChanges = this.store.getHistory().slice(-2)
    let prevChange = recentChanges[0]
    let currentChange = recentChanges[1]
    if (currentChange && currentChange.changeset) {
      let message = currentChange.changeset.message
      if (message && message.action)
        if (message.action.type == "CREATE_CARD")
          highlightCard = this.findCreatedCard(prevChange, currentChange)
        else
          highlightCard = message.action.cardId
    }

    let cardIndex
    if(highlightCard)
      cardIndex = this.store._findIndex(this.store.getState().cards, (c) => c.id === highlightCard )

    return (
      <div className="App">
        <Board highlightOptions={{ cardId: highlightCard }} store={ this.store } />
        <Inspector store={ this.store } highlightOptions={{ tableName: "cards", row: cardIndex }} />
        <div className="sidebar">
          <Peers network={ this.store.network } />
          <Changes store={ this.store } />
        </div>
      </div>
    )
  }
}
