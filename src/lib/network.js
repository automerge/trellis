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
    this.webrtc = webrtc

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
          if (m.deltas && m.deltas.length > 0) {
            this.store.dispatch({
              type: "APPLY_DELTAS",
              deltas: m.deltas
            })
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

        peer.send({vectorClock: Tesseract.getVClock(this.store.getState())})
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
