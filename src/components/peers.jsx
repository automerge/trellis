import React from 'react'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'peers': {}, 'connected': true }
    this.toggleNetwork = this.toggleNetwork.bind(this)
    this.peerHandler = this.peerHandler.bind(this)
    this.doIntroduction = this.doIntroduction.bind(this)

  }

  doIntroduction() {
    let introducer   = this.introductionInput.value
    let [host, port] = introducer.split(':')

    console.log("Introducer detected: ", host, port)
    this.props.network.signaler.manualHello(host, port)

    this.introductionInput.value = ""
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    this.props.network.removeListener('peer', this.peerHandler)

    this.setState({
      peers: Object.assign({}, nextProps.network.peerStats)
    })

    nextProps.network.on('peer', this.peerHandler)
  }

  peerHandler() {
    this.setState({
      peers: Object.assign({}, this.props.network.peerStats)
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

    return <div className="Peers">
      <h2>Peers <img src="assets/images/peers.svg" /></h2>
      <table>
        <thead><tr><th></th><th>Name</th><th>ID</th><th>Sent</th><th>Received</th></tr></thead>
        <tbody>{ peersPartial }</tbody>
      </table>
      <img className="networkSwitch" src={switchPath} onClick={ this.toggleNetwork } />
      <div className="Peers__introduce">
        <textarea placeholder="ip:port" ref={ (input) => this.introductionInput = input }/>
        <button onClick={ this.doIntroduction}>Introduce</button>
      </div>
    </div>
  }
}
