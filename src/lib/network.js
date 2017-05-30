import ss from '../slack-signaler'
import webrtc from '../webrtc'
import Tesseract from 'tesseract'
import EventEmitter from 'events'

export default class Network extends EventEmitter {
  constructor(config={}) {
    super()

    this.token  = process.env.SLACK_BOT_TOKEN
    this.name   = process.env.NAME
    this.doc_id = config.docId
    this.store  = config.store
    this.webrtc = webrtc
    this.peers  = {}
    window.PEERS = []

    if (this.token && this.doc_id) {
      let bot = ss.init({doc_id: this.doc_id, name: this.name, bot_token: this.token })


      webrtc.on('peer', (peer) => {
        window.PEERS.push(peer)
        console.log("NEW PEER:", peer.id, peer.name)
        this.peers[peer.id] = { connected: false, name: peer.name, lastActivity: Date.now() }
        this.emit('peer')

        peer.on('disconnect', () => {
          window.PEERS.splice(window.PEERS.indexOf(peer))
          console.log("PEER: disconnected",peer.id)
          this.peers[peer.id].connected = false
          this.emit('peer')
        })

          console.log("Setting up connect handler")
        peer.on('connect', () => {
          this.peers[peer.id].connected = true
          this.peers[peer.id].lastActivity = true
          this.emit('peer')
          if (peer.self == false) {
            peer.send({vectorClock: Tesseract.getVClock(this.store.getState())})
          }
        })

        peer.on('message', (m) => {
          let store = this.store

          if (m.deltas && m.deltas.length > 0) {
            console.log("BEFORE DISPATCH")
            console.log("m.deltas", m.deltas)
            console.log("m.vectorClock", m.vectorClock)
            console.log("Tesseract.getVClock(store.getState()", Tesseract.getVClock(store.getState()))
            console.log("Tesseract.getDeltasAfter(store.getState(), m.vectorClock", Tesseract.getDeltasAfter(store.getState(), m.vectorClock))

            this.store.dispatch({
              type: "APPLY_DELTAS",
              deltas: m.deltas
            })

            console.log("AFTER DISPATCH")
            console.log("m.deltas", m.deltas)
            console.log("m.vectorClock", m.vectorClock)
            console.log("Tesseract.getVClock(store.getState()", Tesseract.getVClock(store.getState()))
            console.log("Tesseract.getDeltasAfter(store.getState(), m.vectorClock", Tesseract.getDeltasAfter(store.getState(), m.vectorClock))

          }

          if (m.vectorClock) {
            let deltas = Tesseract.getDeltasAfter(this.store.getState(), m.vectorClock)
            let reply = {
              vectorClock: Tesseract.getVClock(this.store.getState()),
              deltas: deltas.slice(0, 5) // just send up to five deltas at a time
            }

            peer.send(reply)
          }
          this.peers[peer.id].lastActivity = true
          this.emit('peer')
        })

      })

      webrtc.join(bot)
    } else {
      console.log("Network disabled")
      console.log("TRELLIS_DOC_ID:", this.doc_id)
      console.log("SLACK_BOT_TOKEN:", this.token)
    }
  }

  connected() {
    return (this.token && this.doc_id);
  }

  // FIXME
  //    - close peerGroup connection so we stop receiving messages
  //    - stop any subscriptions to the store
  //    - stop any modifications/dispatches to the store
  //    - reset window.PEERS
  stop() {
  }
}
