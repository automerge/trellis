import React from 'react'
import Board from './board'
import Changes from './changes'
import Inspector from './inspector'
import Peers from './peers'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import path from 'path'
import Network from '../lib/network'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    window.app   = this
    window.PEERS = []

    this.autoSave = this.autoSave.bind(this)

    this.state = { savePath: null, store: new Store() }
    this.state.store.subscribe(this.autoSave)

    ipcRenderer.on("new", (event) => {
      this.setState({ savePath: null }, () => {
        this.open()
        remote.getCurrentWindow().setTitle("Untitled")
      })
    })

    ipcRenderer.on("open", (event, files) => {
      if(files && files.length > 0) {
        let openPath  = files[0]
        let file      = fs.readFileSync(openPath)
        let name      = path.parse(openPath).name

        this.setState({ savePath: openPath }, () => {
          this.open(file)
          remote.getCurrentWindow().setTitle(name)
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
        let name = path.parse(savePath).name

        this.setState({ savePath: savePath }, () => {
          remote.getCurrentWindow().setTitle(name)
          this.autoSave()
        })
      }
    })
  }

  componentDidMount() {
    this.open()
  }

  open(file) {
    if(this.state.network)
      this.state.network.stop()

    if(file)
      this.state.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
    else
      this.state.store.dispatch({ type: "NEW_DOCUMENT" })

    this.setState({
      network: new Network({
        docId: this.state.store.getState().docId,
        store: this.state.store
      })
    })
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
        <Changes />
        <Inspector store={ this.state.store } />
        <Peers network={ this.state.network } />
      </div>
    )
  }
}
