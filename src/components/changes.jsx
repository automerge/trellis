import React from 'react'

export default class Changes extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store
    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })
  }

  render() {
    return <div className="Changes">
      <h2>Changes <img src="assets/images/delta.svg" /></h2>
    </div>
  }
}
