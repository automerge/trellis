import React from 'react'
import Board from './board'
import Changes from './changes'
import Inspector from './inspector'
import Peers from './peers'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import Path from 'path'
import Network from '../lib/network'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    window.app   = this

    this.autoSave = this.autoSave.bind(this)

    this.state = { savePath: null, store: new Store() }
    this.state.store.subscribe(this.autoSave)

    ipcRenderer.on("new", (event) => {
      this.setState({ savePath: null }, () => {
        this.open()
      })
    })

    ipcRenderer.on("open", (event, files) => {
      if(files && files.length > 0) {
        let openPath  = files[0]

        this.setState({ savePath: openPath }, () => {
          this.open(openPath)
          this.autoSave()
        })
      }
    })

    ipcRenderer.on("merge", (event, files) => {
      if(files && files.length > 0) {
        let file = fs.readFileSync(files[0])

        this.state.store.dispatch({
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
    console.log("APP OPEN",path)
    if(this.state.network)
       this.state.network.disconnect()

    if(path) {
      let file = fs.readFileSync(path)
      let name = Path.parse(path).name

      this.state.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
      remote.getCurrentWindow().setTitle(name)
      localStorage.setItem("lastFileOpened", path)
    }
    else {
      this.state.store.dispatch({ type: "NEW_DOCUMENT" })
      remote.getCurrentWindow().setTitle("Untitled")
    }

    let network = new Network()
    network.connect({
      peerId: this.state.store.getState().peerId,
      docId: this.state.store.getState().docId,
      store: this.state.store
    })
    this.setState({ network: network })
  }

  autoSave() {
    if(this.state.savePath) {
      console.log("Auto saving…")
      let exportFile = this.state.store.save()
      fs.writeFileSync(this.state.savePath, exportFile)
    }
  }

  render() {
    return (
      <div className="App">
        <Board store={ this.state.store } />
        <Changes store ={ this.state.store } />
        <Inspector store={ this.state.store } />
        <Peers network={ this.state.network } />
      </div>
    )
  }
}
