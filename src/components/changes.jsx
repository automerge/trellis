import React from 'react'

export default class Changes extends React.Component {
  constructor(props) {
    super(props)

    let store  = this.props.store
    this.state = store.getState()
    store.subscribe(() => { this.setState(store.getState()) })
  }

  render() {
    let peerActions = this.props.store.getState()._state.toJS().actions

    let flattened = []

    Object.keys(peerActions).forEach((peer) => {
      peerActions[peer].forEach((a, index) => {
        flattened.push(a)
      })
    })

    flattened = flattened.slice(-20)

    let peerPartial = flattened.map((a, index) => {
      let key = a.by + "--" + index
      return <li key={key}>{a.action} {a.key} {a.value}</li>
    })

    return <div className="Changes">
      <h2>Changes</h2>
      <ul>
        { peerPartial }
      </ul>
    </div>
  }
}
