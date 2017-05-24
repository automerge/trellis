import React from 'react'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)

    this.state = { 'peers': [] }

    this.props.webrtc.on('connect', (peer) => {
      let peers = this.state.peers
      peers.push(peer)
      this.setState({ peers: peers })
    })
    this.props.webrtc.on('disconnect', (peer) => {
      let peers = this.state.peers
      peers.splice(peers.indexOf(peer))
      this.setState({ peers: peers })
    })
  }

  render() {
    let peers = this.state.peers
    let peersPartial = peers.map((peer) => {
      return <tr>
            <td className="LED"><img src="assets/images/LED-green.svg" /></td>
            <td className="user">{peer.id}</td>
            <td className="device">iMac</td>
            <td className="ip">204.1.73.21</td>
            <td className="lastChange">3 seconds ago</td>
          </tr>
    })

    return <div className="Peers">
      <h2>Peers <img src="assets/images/peers.svg" /></h2>
      <table><tbody>{ peersPartial }</tbody></table>

      <div className="docID">
        <span className="label">DocID</span>
        <span className="ID">63fa5277-8012-4ba1-a70f-407a5a45bea9</span>
      </div>
    </div>
  }
}
