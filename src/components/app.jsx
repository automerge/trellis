import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Peers from './peers'
import Clocks from './clocks'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import Path from 'path'
import aMPLNet from '../lib/amplnet'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    window.app   = this

    this.autoSave = this.autoSave.bind(this)

    this.state = { savePath: null, store: new Store() }
    this.state.store.subscribe(this.autoSave)

    ipcRenderer.on("new", (event) => {
      this.open()
    })

    ipcRenderer.on("open", (event, files) => {
      if(files && files.length > 0) {
        let openPath  = files[0]

        this.open(openPath)
        this.autoSave()
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
      this.setState({ savePath: path }, () => {
        let file = fs.readFileSync(path)
        let name = Path.parse(path).name

        this.state.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
        remote.getCurrentWindow().setTitle(name)
        localStorage.setItem("lastFileOpened", path)
        this.initNetwork()
      })
    }
    else {
      this.setState({ savePath: null }, () => {
        this.state.store.dispatch({ type: "NEW_DOCUMENT" })
        remote.getCurrentWindow().setTitle("Untitled")
        this.initNetwork()
      })
    }

  }

  initNetwork() {
    let network = new aMPLNet()
    network.connect({
      peerId: this.state.store.getState()._store_id, // TODO will change to _actor_id
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
        <Inspector store={ this.state.store } />
        <div className="sidebar">
          <Peers network={ this.state.network } />
          <Clocks network={ this.state.network } />
        </div>
      </div>
    )
  }
}
