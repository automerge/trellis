import React from 'react'
import Clocks from './clocks'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'peers': {}, 'connected': true }
    this.toggleNetwork = this.toggleNetwork.bind(this)
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    this.setState({
      peers: Object.assign({},nextProps.network.peers)
    })

    nextProps.network.on('peer',() => {
      this.setState({
        peers: Object.assign({},nextProps.network.peers)
      })
    })
  }

  toggleNetwork() {
    let newConnected = !this.state.connected

    this.setState({ peers: this.state.peers, connected: newConnected })

    if (this.props.network)
      if (newConnected)
        this.props.network.connect()
      else
        this.props.network.disconnect()
  }

  formatUUID(uuid) {
    return uuid.toLowerCase().substring(0,4)
  }

  render() {
    let peers = this.state.peers
    let peersPartial = Object.keys(peers).map((id, index) => {
      let peer = peers[id]
      let name = peer.name
      let ledColor = peer.connected ? "green" : "yellow"
      let ledPath = "assets/images/LED-" + ledColor + ".svg"
      let key = "peer-" + id
      
      return <tr key={key}>
            <td className="led"><img src={ledPath} /></td>
            <td className="user">{name}</td>
            <td className="id">{this.formatUUID(id)}</td>
            <td className="sent">{index > 0 ? peer.messagesSent : ""}</td>
            <td className="received">{index > 0 ? peer.messagesReceived : ""}</td>
          </tr>
    })

    let connected = this.state.connected ? "on" : "off"
    let switchPath = "assets/images/switch-" + connected + ".svg"

    let docId = (this.props.network && this.props.network.doc_id) ? this.props.network.doc_id : "-"

    return <div className="Peers">
      <h2>Peers <img src="assets/images/peers.svg" /></h2>
      <img className="networkSwitch" src={switchPath} onClick={ this.toggleNetwork } />
      
      <table>
        <thead><tr><th></th><th>Name</th><th>ID</th><th>Sent</th><th>Received</th></tr></thead>
        <tbody>{ peersPartial }</tbody>
      </table>

      <div className="docID">
        <span className="label">DocID</span>
        <span className="ID">{ docId }</span>
      </div>

      <Clocks network={ this.props.network } />
    </div>
  }
}
