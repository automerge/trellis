import React from 'react'

export default class Changes extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store
    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })
  }

  render() {
    let changes = this.store.getHistory().slice(-10)

    let changesPartial = changes.map((change, index) => {
      let key = "change-" + index

      let edgeImg = ""
      if (index < changes.length-1)
        edgeImg = <img className="changeEdge" src="assets/images/change-edge.svg" />

      let changeMessage = this.store.displayChange(change.changeset.message)

      return <li key={key}>
        <img className="changeNode" src="assets/images/change-node.svg" />
        {edgeImg}{changeMessage}
      </li>
    })

    return <div className="Changes">
      <h2>Changes <img src="assets/images/delta.svg" /></h2>
      <ul>{changesPartial}</ul>
    </div>
  }
}
