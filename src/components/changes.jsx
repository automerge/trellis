import React from 'react'

export default class Changes extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store
    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })
  }

  render() {
    let changes = this.store.changes()
    changes = changes.slice(-20)

    let changesPartial = changes.map((change) => {
      let key = "change-" + change.id
      return <li key={key}>{change.user} {change.action} a {change.type}</li>
    })

    return <div className="Changes">
      <h2>Changes <img src="assets/images/delta.svg" /></h2>
      <ul>{changesPartial}</ul>
    </div>
  }
}
