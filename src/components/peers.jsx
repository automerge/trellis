import React from 'react'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'peers': {} }
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    let webrtc = nextProps.network.webrtc

    webrtc.on('connect', (peer) => {
      let peers = this.state.peers
      peers[peer.id] = { connected: true, lastActivity: Date.now() }
      this.setState({ peers: peers })
    })

    webrtc.on('disconnect', (peer) => {
      let peers = this.state.peers
      peers[peer.id] = { connected: false }
      this.setState({ peers: peers })
    })

    webrtc.on('message', (peer, message) => {
      let peers = this.state.peers
      if (message.deltas && message.deltas.length > 0) {
        peers[peer.id] = { connected: true, lastActivity: Date.now() }
        this.setState({ peers: peers })
      }
    })
  }

  formatUUID(uuid) {
    return uuid.toUpperCase().substring(0,4)
  }

  render() {
    if(!this.props.network) return <div></div>

    let peers = this.state.peers
    let peersPartial = Object.keys(peers).map((id) => {
      let peer = peers[id]
      let ledColor = peer.connected ? "green" : "yellow"
      let ledPath = "assets/images/LED-" + ledColor + ".svg"

      let activity = ""
      if (peer.lastActivity) {
        let t = new Date(peer.lastActivity)
        activity = t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds()
      }

      return <tr>
            <td className="LED"><img src={ledPath} /></td>
            <td className="user">{this.formatUUID(id)}…</td>
            <td className="activity">{activity}</td>
          </tr>
    })

    return <div className="Peers">
      <h2>Peers <img src="assets/images/peers.svg" /></h2>
      <table><tbody>{ peersPartial }</tbody></table>

      <div className="docID">
        <span className="label">DocID</span>
        <span className="ID">{ this.props.network.doc_id }</span>
      </div>
    </div>
  }
}
