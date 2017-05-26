import ss from '../slack-signaler'
import webrtc from '../webrtc'
import Tesseract from 'tesseract'
import EventEmitter from 'events'

export default class Network extends EventEmitter {
  constructor(config={}) {
    super()

    this.token  = config.token
    this.doc_id = config.docId
    this.store  = config.store
    this.name   = config.name
    this.webrtc = webrtc

    if (this.token && this.doc_id) {
      let bot = ss.init({doc_id: this.doc_id, name: this.name, bot_token: this.token })

      webrtc.on('peer', (peer) => {
        console.log("NEW PEER:", peer.id, peer.name)
        window.PEERS.push(peer)

        peer.on('disconnect', () => {
          console.log("PEER: disconnected",peer.id)
          window.PEERS.splice(window.PEERS.indexOf(peer))
        })

        if (peer.self == false) {
          peer.on('connect', () => {
            peer.send({vectorClock: Tesseract.getVClock(this.store.getState())})
          })
        }

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
}
