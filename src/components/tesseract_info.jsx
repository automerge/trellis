import React from 'react'

export default class AutomergeInfo extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let t = this.props.Automerge
    let peers = Object.keys(t.peers).map((peer) => { return peer })
    let peer_actions = Object.keys(t.peer_actions).map((pa) => {
      return pa + "(" + t.peer_actions[pa].length + ") "
    })

    return (
      <div className="Automerge__info">
        <ul>
          <li>me: {t._id}</li>
          <li>peers: {peers}</li>
          <li>actions: {peer_actions}</li>
        </ul>
      </div>
    )
  }
}
