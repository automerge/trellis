import React from 'react'
import Board from './board'
import Changes from './changes'
import Inspector from './inspector'
import Peers from './peers'
import Store from '../lib/store'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import path from 'path'
import ss from '../slack-signaler'
import webrtc from '../webrtc'
import Tesseract from 'tesseract'


export default class App extends React.Component {
  constructor(props) {
    super(props)

    window.PEERS = []

    this.doc_id = process.env.TRELLIS_DOC_ID
    this.token = process.env.SLACK_BOT_TOKEN

    if (this.token && this.doc_id) {
      let bot = ss.init({doc_id: this.doc_id, bot_token: this.token })

      webrtc.on('disconnect', (peer) => {
        console.log("PEER: disconnected",peer.id)
        window.PEERS.splice(window.PEERS.indexOf(peer))
      })

      webrtc.on('connect', (peer) => {
        console.log("PEER: connected", peer.id)
        window.PEERS.push(peer)
        peer.on('message', (m) => {
          if (m.deltas) {
            if (m.deltas.length > 0) {
              app.state.store.dispatch({type: "APPLY_DELTAS", deltas: m.deltas})
            }
          }
          if (m.vectorClock) {
            let deltas = Tesseract.getDeltasAfter(app.state.store.getState(), m.vectorClock)
            let reply = {
              vectorClock: Tesseract.getVClock(app.state.store.getState()), 
              deltas: deltas.slice(0, 5) // just send up to five deltas at a time
            }
            peer.send(reply)
          }
        })

        peer.send({vectorClock: Tesseract.getVClock(app.state.store.getState())})
      })
      webrtc.join(bot)
    } else {
      console.log("Network disabled")
      console.log("TRELLIS_DOC_ID:", this.doc_id)
      console.log("SLACK_BOT_TOKEN:", this.token)
    }

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
        <Peers docId={ this.doc_id } webrtc={ webrtc } />
      </div>
    )
  }
}
