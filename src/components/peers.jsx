import React from 'react'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)

    this.state = { 'peers': {} }

    this.props.webrtc.on('connect', (peer) => {
      let peers = this.state.peers
      peers[peer.id] = { connected: true }
      this.setState({ peers: peers })
    })

    this.props.webrtc.on('disconnect', (peer) => {
      let peers = this.state.peers
      peers[peer.id] = { connected: false }
      this.setState({ peers: peers })
    })
  }

  formatUUID(uuid) {
    return uuid.toUpperCase().substring(0,4)
  }

  render() {
    let peers = this.state.peers
    let peersPartial = Object.keys(peers).map((id) => {
      let peer = peers[id]
      let ledColor = peer.connected ? "green" : "yellow"
      let ledPath = "assets/images/LED-" + ledColor + ".svg"
      return <tr>
            <td className="LED"><img src={ledPath} /></td>
            <td className="user">{this.formatUUID(id)}…</td>
          </tr>
    })

    return <div className="Peers">
      <h2>Peers <img src="assets/images/peers.svg" /></h2>
      <table><tbody>{ peersPartial }</tbody></table>

      <div className="docID">
        <span className="label">DocID</span>
        <span className="ID">{ this.props.docId }</span>
      </div>
    </div>
  }
}
