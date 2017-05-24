import React from 'react'
import Board from './board'
import Changes from './changes'
import Inspector from './inspector'
import Peers from './peers'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import path from 'path'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    window.app = this;

    this.autoSave = this.autoSave.bind(this)

    this.state = { savePath: null, store: new Store({seedData: true}) }
    this.state.store.subscribe(this.autoSave)
    
    ipcRenderer.on("new", (event) => {
      this.setState({ savePath: null }, () => {
        this.state.store.dispatch({ type: "NEW_DOCUMENT" })
        remote.getCurrentWindow().setTitle("Untitled")
      })
    })

    ipcRenderer.on("open", (event, files) => {
      if(files && files.length > 0) {
        let openPath  = files[0]
        let file      = fs.readFileSync(openPath)
        let name      = path.parse(openPath).name

        this.setState({ savePath: openPath }, () => {
          this.state.store.dispatch({ type: "OPEN_DOCUMENT", file: file })
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
    }) }

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
        <Peers webrtc={ this.props.webrtc } />
      </div>
    )
  }
}
