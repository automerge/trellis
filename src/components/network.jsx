import React from 'react'
import InlineInput from './inline_input'
import aMPL from 'ampl'

export default class Network extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'peers': {}, 'connected': true }
    this.toggleNetwork = this.toggleNetwork.bind(this)
    this.peerHandler = this.peerHandler.bind(this)
    this.doIntroduction = this.doIntroduction.bind(this)
    this.updatePeerName = this.updatePeerName.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.introducer = localStorage.getItem("introducer")

    if(this.introducer)
      this.doIntroduction(this.introducer)
  }

  updatePeerName(value) {
    aMPL.config.name = value
    localStorage.setItem("peerName", value)

    // Force network reconnect
    this.props.store.dispatch({
      type: "OPEN_DOCUMENT",
      file: this.props.store.save()
    })
  }

  doIntroduction(value) {
    let introducer   = value || this.introductionInput.value
    let [host, port] = introducer.split(':')

    console.log("Introducer detected: ", host, port)
    this.props.network.signaler.manualHello(host, port)
    localStorage.setItem("introducer", introducer)
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    this.props.network.peerStats.removeListener('peer', this.peerHandler)

    console.log("NEXT PROPS",nextProps)
    this.setState({
      peers: Object.assign({}, nextProps.network.peerStats.getStats())
    })

    nextProps.network.peerStats.on('peer', this.peerHandler)
  }

  peerHandler() {
    this.setState({
      peers: Object.assign({}, this.props.network.peerStats.getStats())
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
      let ledColor = peer.connected ? "green" : "yellow"
      let ledPath = "assets/images/LED-" + ledColor + ".svg"
      let key = "peer-" + id

      let namePartial
      if(peer.self) {
        namePartial = <InlineInput onSubmit={ this.updatePeerName } defaultValue={ name }>{ name }</InlineInput>
      }
      else
        namePartial = name

      return <tr key={key}>
            <td className="led"><img src={ledPath} /></td>
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
      <table>
        <thead><tr><th></th><th>Name</th><th>ID</th><th>Sent</th><th>Received</th></tr></thead>
        <tbody>{ peersPartial }</tbody>
      </table>
      <img className="networkSwitch" src={switchPath} onClick={ this.toggleNetwork } />
      <div className="Network__introduce">
        <textarea 
          placeholder="ip:port" 
          onKeyDown={ this.handleInput } 
          ref={ (input) => this.introductionInput = input }
          defaultValue={ this.introducer }
        />
        <button onClick={ () => this.doIntroduction() }>Introduce</button>
      </div>
    </div>
  }
}
