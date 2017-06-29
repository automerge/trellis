import React from 'react'
import InlineInput from './inline_input'
import MPL from 'mpl'
import wifiName from 'wifi-name'

export default class Network extends React.Component {
  constructor(props) {
    super(props)

    let bonjourEnabled = localStorage.getItem("bonjourEnabled")
    if(bonjourEnabled)
      bonjourEnabled = JSON.parse(bonjourEnabled)

    if(bonjourEnabled)
      this.props.network.signaler.enableBonjour()
    else
      this.props.network.signaler.disableBonjour()

    this.state = { 
      peers: {}, 
      connected: true, 
      bonjourEnabled: bonjourEnabled, 
      introducerStatus: "disconnected", 
      wifi: undefined 
    }

    wifiName().then(name => {
      let state = this.state
      state['wifi'] = name
      this.setState(state)
    });

    this.toggleNetwork = this.toggleNetwork.bind(this)
    this.toggleBonjour = this.toggleBonjour.bind(this)
    this.peerHandler = this.peerHandler.bind(this)
    this.doIntroduction = this.doIntroduction.bind(this)
    this.updatePeerName = this.updatePeerName.bind(this)
    this.handleInput = this.handleInput.bind(this)
  }

  componentDidMount() {
    this.doIntroduction()
  }

  updatePeerName(value) {
    MPL.config.name = value
    localStorage.setItem("peerName", value)
    this.props.store.network.peergroup.setName(value)
  }

  doIntroduction() {
    let introducer = this.introductionInput.value
    localStorage.setItem("introducer", introducer)

    let [host, port] = introducer.split(':')
    this.setState({ introducerStatus: "connecting" }, () => {
      this.props.network.signaler.manualHello(host, port, (error) => {
        if(error) {
          console.log(error)
          this.setState({ introducerStatus: "error" })
        } else {
          this.setState({ introducerStatus: "connected" })
        }
      })
    })
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
      {
        this.props.network.connect()
        if (this.state.bonjourEnabled) this.props.network.signaler.enableBonjour()
        this.doIntroduction()
      }
      else
        this.props.network.disconnect()
  }

  toggleBonjour() {
    let newEnabled = !this.state.bonjourEnabled

    if(newEnabled)
      this.props.network.signaler.enableBonjour()
    else
      this.props.network.signaler.disableBonjour()

    localStorage.setItem("bonjourEnabled", JSON.stringify(newEnabled))
    this.setState({ bonjourEnabled: newEnabled })
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

    let bonjourEnabled = this.state.bonjourEnabled ? "on" : "off"
    let bonjourSwitchPath = "assets/images/switch-" + bonjourEnabled + ".svg"

    let bonjourLed = this.state.bonjourEnabled ? "connected" : "disconnected"

    let introducerDefault
    if(process.env.INTRODUCER !== undefined)
      introducerDefault = process.env.INTRODUCER
    else if(localStorage.introducer !== "" && localStorage.introducer !== undefined)
      introducerDefault = localStorage.introducer
    else
      introducerDefault = "localhost:4242"

    return <div className="Network">
      <h2>Network <img src="assets/images/peers.svg" /></h2>
      <img className="networkSwitch" src={switchPath} onClick={ this.toggleNetwork } />

      <div className="Signalers">
        <div className="Signaler__introduce__title">
          <div className={ "led-" + this.state.introducerStatus } />
          Introducer
        </div>
        <div className="Signaler__introduce__detail">
          <textarea 
            placeholder="ip:port" 
            onKeyDown={ this.handleInput } 
            ref={ (input) => this.introductionInput = input }
            defaultValue={ introducerDefault }
          />
        </div>
        <div className="Signaler__introduce__action">
          <button onClick={ this.doIntroduction }>Connect</button>
        </div>

        <div className="Signaler__bonjour__title">
          <div className={ "led-" + bonjourLed  } />
          Bonjour
        </div>
        <div className="Signaler__bonjour__detail">{this.state.wifi}</div>
        <div className="Signaler__bonjour__action">
          <img className="bonjourSwitch" src={bonjourSwitchPath} onClick={ this.toggleBonjour } />
        </div>
      </div>

      <table className="Peers">
        <thead><tr><th></th><th>Peer</th><th>ID</th><th>Sent</th><th>Received</th></tr></thead>
        <tbody>{ peersPartial }</tbody>
      </table>
    </div>
  }
}
