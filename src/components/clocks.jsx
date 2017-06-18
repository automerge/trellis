import React from 'react'

export default class Clocks extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'peers': {}, 'clocks': {} }
    this.peerHandler = this.peerHandler.bind(this)
  }

  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    this.props.network.removeListener('peer', this.peerHandler)

    this.setState({
      peers: Object.assign({},nextProps.network.peerStats),
      clocks: Object.assign({},nextProps.network.clocks)
    })

    nextProps.network.on('peer', this.peerHandler)
  }

  peerHandler() {
    this.setState({
      peers: Object.assign({}, this.props.network.peerStats),
      clocks: Object.assign({}, this.props.network.clocks)
    })
  }

  formatUUID(uuid) {
    return uuid.toLowerCase().substring(0,4)
  }

  renderPeerNameOrId(peerId) {
    let peer = this.state.peers[peerId]
    if (peer && peer.name)
      return peer.name

    return this.formatUUID(peerId)
  }

  formatVectorClock(id, clock, allKnownActors) {
    let key = "vclock-" + id

    if (!clock)
      return <tr key={key}></tr>

    let tails = allKnownActors.map( (peer_id, index) => {
      let key = "peer-vclock-td-" + index + "-" + peer_id
      let value = clock[peer_id]
      let klass = "clockPosition"
      if (id == peer_id)
        klass += " canonical"
      return <td className={klass} key={key}>{ value ? value : "-" }</td>
    })
    return <tr key={key}><th>{this.renderPeerNameOrId(id)}</th>{tails}</tr>
  }

  render() {
    let peers = this.state.peers
    let peerIds = Object.keys(peers)

    let allKnownActors = []
    peerIds.forEach((peerId) => {
      let clock = this.state.clocks[peerId]
      if (clock) {
        let thisPeerActors = Object.keys(clock)
        allKnownActors = allKnownActors.concat(thisPeerActors)
      }
    })
    allKnownActors = Array.from(new Set(allKnownActors))

    let allKnownActorsExceptPeers = allKnownActors.filter((actorId) => !peerIds.includes(actorId))

    // connected peers first
    allKnownActors = peerIds.concat(allKnownActorsExceptPeers)

    allKnownActors = allKnownActors.slice(0, 6)  // avoid making it too wide

    let clocksTable = <div></div>

    if (allKnownActors.length > 1) {
      let clockHeaders = allKnownActors.map((peerId, index) => {
        let key = "peer-vclock-th-" + index + "-" + peerId
        return <th className="peerID" key={key}>{ this.renderPeerNameOrId(peerId) }</th>
      })

      let clockRows = peerIds.map((id) => {
        return this.formatVectorClock(id, this.state.clocks[id], allKnownActors)
      })

      clocksTable = <table>
          <thead><tr><th></th>{clockHeaders}</tr></thead>
          <tbody>{clockRows}</tbody>
        </table>
    }

    return <div className="Clocks">
      <h2>Clocks <img src="assets/images/clock.svg" /></h2>
      {clocksTable}
    </div>
  }
}
