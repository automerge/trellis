import React from 'react'
import InlineInput from './inline_input'
import MPL from 'mpl'
import wifiName from 'wifi-name'

export default class Network extends React.Component {
  constructor(props) {
    super(props)

    this.state = { 
      peers: {}, 
      connected: true, 
      wifi: undefined 
    }

    this.toggleNetwork = this.toggleNetwork.bind(this)
    this.peerHandler = this.peerHandler.bind(this)
    this.updatePeerName = this.updatePeerName.bind(this)
    this.handleInput = this.handleInput.bind(this)
  }

  componentDidMount() {
  }

  updatePeerName(value) {
    MPL.config.name = value
    localStorage.setItem("peerName", value)
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

  }

  peerHandler() {
    this.setState({
      peers: Object.assign({}, {})
    })
  }

  toggleNetwork() {
    let newConnected = !this.state.connected

    this.setState({ peers: this.state.peers, connected: newConnected })

    if (this.props.network)
      if (newConnected)
      {
        this.props.network.connect()
      }
      else
        this.props.network.disconnect()
  }

  formatUUID(uuid) {
    return uuid.toLowerCase().substring(0,4)
  }

  handleInput(event) {
    if(event.key === "Enter") {
      event.preventDefault()
      this.doIntroduction()
    }
  }

  render() {
    let peers = this.state.peers
    let peersPartial = Object.keys(peers).map((id, index) => {
      let peer = peers[id]
      let name = peer.name
      let ledStatus = peer.connected ? "connected" : "connecting"

      let ledKlass = "led " + ledStatus
      let key = "peer-" + id

      let namePartial
      if(peer.self)
        namePartial = <InlineInput onSubmit={ this.updatePeerName } defaultValue={ name }>{ name }</InlineInput>
      else
        namePartial = name

      return <tr key={key}>
            <td><div className={"led-" + ledStatus} /></td>
            <td className="user">{ namePartial }</td>
            <td className="id">{this.formatUUID(id)}</td>
            <td className="sent">{index > 0 ? peer.messagesSent : ""}</td>
            <td className="received">{index > 0 ? peer.messagesReceived : ""}</td>
          </tr>
    })

    let connected = this.state.connected ? "on" : "off"
    let switchPath = "assets/images/switch-" + connected + ".svg"

    return <div className="Network">
      <h2>Network <img src="assets/images/peers.svg" /></h2>
      <img className="networkSwitch" src={switchPath} onClick={ this.toggleNetwork } />

      <table className="Peers">
        <thead><tr><th></th><th>Peer</th><th>ID</th><th>Sent</th><th>Received</th></tr></thead>
        <tbody>{ peersPartial }</tbody>
      </table>
    </div>
  }
}
