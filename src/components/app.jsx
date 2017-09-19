import React from 'react'
import Board from './board/board'
import Inspector from './inspector/inspector'
import Network from './network'
import Documents from './documents'
import Changes from './changes'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import Path from 'path'
import MPL from 'mpl'

const SAVE_DIRECTORY = process.env.SAVE_DIR || Path.join(remote.app.getPath('documents'), "Trellis")
if(!fs.existsSync(SAVE_DIRECTORY)) fs.mkdirSync(SAVE_DIRECTORY)

const {dialog} = require('electron').remote

export default class App extends React.Component {
  constructor(props) {
    super(props)

    window.app    = this
    this.autoSave = this.autoSave.bind(this)
    this.open     = this.open.bind(this)
    this.store    = new Store()

    this.store.subscribe(() => {
      this.setState({}) // Force component to re-render
      this.autoSave()
    })

    ipcRenderer.on("new", (event) => {
      this.open()
      this.board.flash.show(`Opened new document (${ this.getDocUrl() })`)
    })

    ipcRenderer.on("forkDocument", () => {
      this.fork()
      this.board.flash.show(`Forked document (${ this.getDocUrl() })`)
    })

    ipcRenderer.on("openFromClipboard", (event, docUrl) => {
      let m = docUrl.match(/trellis:\/\/([a-z0-9-]+)/)
      if (m) {
        this.open(m[1])
        this.board.flash.show(`Opened document URL (${ m[1] }) from clipboard`)
      } else
        dialog.showErrorBox("Invalid document URL", "Should be trellis:// but your clipboard contains:\n\n" + docUrl)
    })

    ipcRenderer.on("shareToClipboard", (event) => {
      ipcRenderer.send("shareToClipboardResult", this.getDocUrl())
      this.board.flash.show(`Document URL (${ this.getDocUrl() }) copied to clipboard`)
    })
  }

  componentDidMount() {
    let lastDocOpened = this.getRecentDocsAsList().slice(-1)[0]

    if(lastDocOpened && lastDocOpened.id)
      this.open(lastDocOpened.id)
    else
      this.open()
  }

  getDocId() {
    return this.store.getState().docId
  }

  getDocUrl() {
    return "trellis://" + this.getDocId()
  }

  getDocTitle() {
    return this.store.getState().boardTitle
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

  getRecentDocs() {
    let raw = localStorage.getItem("recentDocs")
    if (!raw || raw == "" || raw == "undefined") return {}

    let recentDocs = JSON.parse(raw)

    if (recentDocs.constructor == Array) // handle data migration, used to be an array
      return {}

    return recentDocs
  }

  getRecentDocsAsList() {
    let unsorted = this.getRecentDocs()
    let sortedKeys = Object.keys(unsorted).sort((a, b) => unsorted[a].lastActive > unsorted[b].lastActive)
    return sortedKeys.map((key) => unsorted[key])
  }

  saveRecentDocs(recentDocs) {
    localStorage.setItem("recentDocs", JSON.stringify(recentDocs))
  }

  saveCurrentDocToRecentDocs() {
    let recentDocs = this.getRecentDocs()
    recentDocs[this.getDocId()] = { id: this.getDocId(), title: this.getDocTitle(), lastActive: Date.now() }
    this.saveRecentDocs(recentDocs)
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

    this.saveCurrentDocToRecentDocs()
    this.setState({}) // hack to force re-render

    this.setWindowTitle()
  }

  fork() {
    this.store.dispatch({ type: "FORK_DOCUMENT" })
    this.saveCurrentDocToRecentDocs()
    this.setState({}) // hack to force re-render
    this.setWindowTitle()
  }

  autoSave() {
    if(!this.store.localState.timeTravel) {
      let exportFile = this.store.save()
      let fileName   = this.store.getState().docId + ".trellis"
      let savePath   = Path.join(SAVE_DIRECTORY, fileName)

      fs.writeFileSync(savePath, exportFile)

      // save on every change so that we get lastActive and title updates
      this.saveCurrentDocToRecentDocs()

      this.setWindowTitle()
    }
  }

  render() {
    let prevChange, currentChange, highlightCard
    let history = this.store.getHistory()

    if(this.store.localState.timeTravel) {
      currentChange = this.store.localState.timeTravel.change
      prevChange    = this.store.localState.timeTravel.prevChange
    } else {
      let recentChanges = history.slice(-2)
      prevChange    = recentChanges[0]
      currentChange = recentChanges[1]
    }

    if (currentChange && currentChange.change) {
      let message = currentChange.change.message
      if (message && message.action)
        if (message.action.type == "CREATE_CARD")
          highlightCard = this.findCreatedCard(prevChange, currentChange)
        else if(message.action.type == "INSPECTOR_UPDATE") {
          if(message.action.table === "cards")
            highlightCard = this.store.getState().cards[message.action.row].id
        }
        else
          highlightCard = message.action.cardId
    }

    let cardIndex
    if(highlightCard)
      cardIndex = this.store.getState().cards.findIndex(c => c.id === highlightCard)

    return (
      <div className="App">
        <Board ref={ (node) => this.board = node } highlightOptions={{ cardId: highlightCard }} store={ this.store } />
        <Inspector store={ this.store } highlightOptions={{ tableName: "cards", row: cardIndex }} />
        <div className="Sidebar">
          <Network network={ this.store.network } store={ this.store } />
          <Documents recentDocs={ this.getRecentDocsAsList() } network={ this.store.network } openDocument={ this.open } myDocId={ this.getDocId() } myName={ MPL.config.name } />
          <Changes store={ this.store } history={ history } />
        </div>
      </div>
    )
  }
}
