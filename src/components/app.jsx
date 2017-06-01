import React from 'react'
import Main from './main'
import Inspector from './inspector'
import Peers from './peers'
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

    this.store = new Store()
    this.store.subscribe(this.autoSave)

    this.state = { savePath: null, network: false }
    
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
    console.log("APP OPEN",path)
    if(this.state.network)
       this.state.network.disconnect()

    if(path) {
      let file = fs.readFileSync(path)
      let name = Path.parse(path).name

      this.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
      remote.getCurrentWindow().setTitle("Trellis - " + name)
      localStorage.setItem("lastFileOpened", path)
    }
    else {
      this.store.dispatch({ type: "NEW_DOCUMENT" })
      remote.getCurrentWindow().setTitle("Trellis - Untitled")
    }

    let network = new aMPLNet()
    network.connect({
      peerId: this.store.getState().peerId,
      docId: this.store.getState().docId,
      store: this.store
    })
    this.setState({ network: network })
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
        <Peers network={ this.state.network } />
      </div>
    )
  }
}
