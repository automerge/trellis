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

    console.log("IN REACT - SETUP WEBRTC SIGNALS")
    webrtc.on('peer', (peer) => {
      let peers = this.state.peers
      peers[peer.id] = { connected: false, name: peer.name, lastActivity: Date.now() }
      this.setState({ peers: peers })

      peer.on('connect', () => {
        let peers = this.state.peers
        peers[peer.id] = { connected: true, name: peer.name, lastActivity: Date.now() }
        this.setState({ peers: peers })
      })
      peer.on('disconnect', () => {
        let peers = this.state.peers
        peers[peer.id] = { connected: false }
        this.setState({ peers: peers, name: peer.name })
      })
      peer.on('message', (message) => {
        let peers = this.state.peers
        if (message.deltas && message.deltas.length > 0) {
          peers[peer.id] = { connected: true, name: peer.name, lastActivity: Date.now() }
          this.setState({ peers: peers })
        }
      })
    })
  }

  formatUUID(uuid) {
    return uuid.toUpperCase().substring(0,4)
  }

  render() {
    let peers = this.state.peers
    let peersPartial = Object.keys(peers).map((id) => {
      let peer = peers[id]
      let name = peer.name
      console.log("PEER NAME",peer,name)
      let ledColor = peer.connected ? "green" : "yellow"
      let ledPath = "assets/images/LED-" + ledColor + ".svg"

      let activity = ""
      if (peer.lastActivity) {
        let t = new Date(peer.lastActivity)
        activity = t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds()
      }


            //<td className="user">{this.formatUUID(id)}…</td>

      return <tr>
            <td className="LED"><img src={ledPath} /></td>
            <td className="user">{name}</td>
            <td className="activity">{activity}</td>
          </tr>
    })

    let connected = this.props.network && this.props.network.connected() ? "on" : "off"
    let switchPath = "assets/images/switch-" + connected + ".svg"

    let docIdPartial = '';
    if (this.props.network && this.props.network.doc_id) {
      docIdPartial = <div className="docID">
        <span className="label">DocID</span>
        <span className="ID">{ this.props.network.doc_id }</span>
      </div>
    }

    return <div className="Peers">
      <h2>Peers <img src="assets/images/peers.svg" /></h2>
      <img className="networkSwitch" src={switchPath} />
      
      <table><tbody>{ peersPartial }</tbody></table>

      { docIdPartial }
    </div>
  }
}
