import React from 'react'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'peers': {}, 'connected': false }
    this.toggleNetwork = this.toggleNetwork.bind(this)
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    this.setState({ peers: Object.assign({},nextProps.network.peers) })
    nextProps.network.on('peer',() => {
      this.setState({ peers: Object.assign({},nextProps.network.peers) })
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
    return uuid.toUpperCase().substring(0,2) + "…"
  }

  formatVectorClock(clock) {
    let heads = Object.keys(clock).map( (peer_id) => {
        return <th className="peerID"> { this.formatUUID(peer_id) } </th>
    })
    let tails = Object.keys(clock).map( (peer_id) => {
        return <td className="clockPosition"> { clock[peer_id] } </td>
    })
    return <div >
      <table className="vectorClock">
      <thead>
          <tr>{heads}</tr>
      </thead>
      <tbody>
        <tr>{tails}</tr>
      </tbody>
    </table>
    </div>
  }

  render() {
    let peers = this.state.peers
    let peersPartial = Object.keys(peers).map((id, index) => {
      let peer = peers[id]
      let name = peer.name
      let ledColor = peer.connected ? "green" : "yellow"
      let ledPath = "assets/images/LED-" + ledColor + ".svg"
      let key = "peer-" + id
      
      let clock = this.props.network.clocks[id];

      return <tr key={key}>
            <td key="1" className="LED"><img src={ledPath} /></td>
            <td key="2" className="user">{name}</td>
            <td key="3" className="activity">{index > 0 ? peer.messagesSent : ""}</td>
            <td key="4" className="activity">{index > 0 ? peer.messagesReceived : ""}</td>
            <td key="5" className="clock">{clock ? this.formatVectorClock(clock) : "no clock"}</td>
          </tr>
    })

    let connected = this.state.connected ? "on" : "off"
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
      <img className="networkSwitch" src={switchPath} onClick={ this.toggleNetwork } />
      
      <table>
        <thead><tr><th></th><th>Name</th><th>Sent</th><th>Received</th></tr></thead>
        <tbody>{ peersPartial }</tbody>
      </table>

      { docIdPartial }
    </div>
  }
}
