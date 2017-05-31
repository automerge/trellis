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
    this.clocks = {}
    window.PEERS = []

    this.store.on('change', (state) => {
      window.PEERS.forEach((peer) => {
        this.updatePeer(peer, state, this.clocks[peer.id])
      })
    })

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
/*
            console.log("BEFORE DISPATCH")
            console.log("m.deltas", m.deltas)
            console.log("m.vectorClock", m.vectorClock)
            console.log("Tesseract.getVClock(store.getState()", Tesseract.getVClock(store.getState()))
            console.log("Tesseract.getDeltasAfter(store.getState(), m.vectorClock", Tesseract.getDeltasAfter(store.getState(), m.vectorClock))
*/

            this.store.dispatch({
              type: "APPLY_DELTAS",
              deltas: m.deltas
            })

/*
            console.log("AFTER DISPATCH")
            console.log("m.deltas", m.deltas)
            console.log("m.vectorClock", m.vectorClock)
            console.log("Tesseract.getVClock(store.getState()", Tesseract.getVClock(store.getState()))
            console.log("Tesseract.getDeltasAfter(store.getState(), m.vectorClock", Tesseract.getDeltasAfter(store.getState(), m.vectorClock))
*/
            peer.send({vectorClock: Tesseract.getVClock(this.store.getState())})
          }

          if (m.vectorClock) {
            console.log("GOT VECTOR CLOCK")
            this.clocks[peer.id] = m.vectorClock
            this.updatePeer(peer,this.store.getState(), m.vectorClock)
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

  updatePeer(peer, state, clock) {
    if (peer == undefined) return
    if (clock == undefined) return
    let deltas = Tesseract.getDeltasAfter(state, clock)
    if (deltas.length > 0) {
      console.log("SENDING DELTAS:", deltas.length)
      peer.send({deltas: deltas})
    }
  }

  connect() {
    console.log("connect to network - Orion, write me!")
  }

  // FIXME
  //    - close peerGroup connection so we stop receiving messages
  //    - stop any subscriptions to the store
  //    - stop any modifications/dispatches to the store
  //    - reset window.PEERS
  disconnect() {
    console.log("disconnect from network - Orion, write me!")
  }
}
