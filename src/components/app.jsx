import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Peers from './peers'
import Clocks from './clocks'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import Path from 'path'

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

    ipcRenderer.on("new", (event) => {
      this.open()
    })

    ipcRenderer.on("open", (event, files) => {
      if(files && files.length > 0) {
        this.open(files[0])
      }
    })

    ipcRenderer.on("merge", (event, files) => {
      if(files && files.length > 0) {
        let file = fs.readFileSync(files[0])

        this.store.dispatch({
          type: "MERGE_DOCUMENT", file: file
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

    ipcRenderer.on("openFromClipboard", (event, docId) => {
      if (this.isValidDocId(docId))
        this.openDocId(docId)
      else
        dialog.showErrorBox("Invalid DocID", "Your clipboard contains:\n\n" + docId)
    })

    ipcRenderer.on("shareToClipboard", (event) => {
      let docId = this.store.getState().docId
      console.log("sending docid", docId)
      ipcRenderer.send("shareToClipboardResult", docId)
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
        remote.getCurrentWindow().setTitle(name)
        localStorage.setItem("lastFileOpened", path)
      })
    }
    else {
      this.setState({ savePath: null }, () => {
        this.store.dispatch({ type: "NEW_DOCUMENT" })
        remote.getCurrentWindow().setTitle("Untitled")
      })
    }
  }

  openDocId(docId) {
    dialog.showErrorBox("TODO: write the function to open by docid", "Your clipboard contains:\n\n" + docId)
  }

  isValidDocId(docId) {
    return (docId.match(/^[0-9a-fA-F-]+$/) && docId.length > 4)
  }

  autoSave() {
    console.log("Auto saving…")
    let exportFile    = this.store.save()
    let saveDirectory = Path.join(remote.app.getPath('documents'), "Trellis")
    let fileName      = this.store.getState().docId + ".trellis"

    if(!fs.existsSync(saveDirectory)) fs.mkdirSync(saveDirectory)

    let savePath = Path.join(saveDirectory, fileName)
    fs.writeFileSync(savePath, exportFile)
  }

  render() {
    let docId = (this.store.network && this.store.network.doc_id) ? this.store.network.doc_id : "-"

    return (
      <div className="App">
        <Board store={ this.store } />
        <Inspector store={ this.store } />
        <div className="sidebar">
          <div className="DocID">
            <span className="label">DocID</span>
            <span className="ID">{ docId }</span>
          </div>
          <Peers network={ this.store.network } />
          <Clocks network={ this.store.network } />
        </div>
      </div>
    )
  }
}
