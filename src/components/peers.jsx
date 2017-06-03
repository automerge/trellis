import React from 'react'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'peers': {}, 'connected': true, 'clocks': {} }
    this.toggleNetwork = this.toggleNetwork.bind(this)
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    this.setState({
      peers: Object.assign({},nextProps.network.peers),
      clocks: Object.assign({},nextProps.network.clocks)
    })

    nextProps.network.on('peer',() => {
      this.setState({
        peers: Object.assign({},nextProps.network.peers),
        clocks: Object.assign({},nextProps.network.clocks)
      })
    })
  }

  toggleNetwork() {
    let newConnected = !this.state.connected

    this.setState({ peers: this.state.peers, connected: newConnected, clocks: this.state.clocks })

    if (this.props.network)
      if (newConnected)
        this.props.network.connect()
      else
        this.props.network.disconnect()
  }

  formatUUID(uuid) {
    return uuid.toLowerCase().substring(0,4)
  }

  formatVectorClock(id, clock, allKnownWriters) {
    let key = "vclock-" + id

    if (!clock)
      return <tr key={key}></tr>

    let tails = allKnownWriters.map( (peer_id, index) => {
      let key = "peer-vclock-td-" + index + "-" + peer_id
      return <td className="clockPosition" key={key}> { clock[peer_id] } </td>
    })
    return <tr key={key}><th>{this.formatUUID(id)}</th>{tails}</tr>
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

    let allKnownWriters = []
    Object.keys(peers).forEach((peerId) => {
      let clock = this.state.clocks[peerId]
      if (clock) {
        let thisPeerWriters = Object.keys(clock)
        allKnownWriters = allKnownWriters.concat(thisPeerWriters)
      }
    })
    allKnownWriters = Array.from(new Set(allKnownWriters))

    let clockHeaders = allKnownWriters.map((peerId, index) => {
      let key = "peer-vclock-th-" + index + "-" + peerId
      return <th className="peerID" key={key}>{ this.formatUUID(peerId) }</th>
    })

    let clockRows = Object.keys(peers).map((id, index) => {
      return this.formatVectorClock(id, this.state.clocks[id], allKnownWriters)
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

      <div className="Clocks">
        <h2>Clocks <img src="assets/images/clock.svg" /></h2>
        <table>
          <thead><tr><th></th>{clockHeaders}</tr></thead>
          <tbody>{clockRows}</tbody>
        </table>
      </div>
    </div>
  }
}
