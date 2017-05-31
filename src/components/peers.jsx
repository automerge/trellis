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

    this.setState({ peers: Object.assign({},nextProps.network.peers) })
    nextProps.network.on('peer',() => {
      this.setState({ peers: Object.assign({},nextProps.network.peers) })
    })
  }

  render() {
    let peers = this.state.peers
    let peersPartial = Object.keys(peers).map((id) => {
      let peer = peers[id]
      let name = peer.name
      let ledColor = peer.connected ? "green" : "yellow"
      let ledPath = "assets/images/LED-" + ledColor + ".svg"

      let activity = ""
      if (peer.lastActivity) {
        let t = new Date(peer.lastActivity)
        activity = t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds()
      }

      let key = "peer-" + peer

      return <tr key={key}>
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
