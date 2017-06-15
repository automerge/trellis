import React from 'react'

export default class Changes extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store
    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })
  }

  render() {
    const changesToShow = 10
    let changes = this.store.getHistory().slice(changesToShow * -1)

    let changesPartial = changes.map((change, index) => {
      let key = "change-" + index

      let edgeImg = ""
      if (index < changes.length-1)
        edgeImg = <img className="changeEdge" src="assets/images/change-edge.svg" />

      let changeMessage = this.store.displayChange(change.changeset.message)

      let klass = ""
      let icon = "change-node"
      if (index == changes.length-1) {
        klass = "highlight"
        icon = "change-highlight"
      }

      let iconPath = "assets/images/" + icon + ".svg"

      return <li key={key} className={klass}>
        <img className="changeNode" src={iconPath} />
        {edgeImg}{changeMessage}
      </li>
    })

    return <div className="Changes">
      <h2>Changes <img src="assets/images/delta.svg" /></h2>
      <ul>{changesPartial}</ul>
    </div>
  }
}
