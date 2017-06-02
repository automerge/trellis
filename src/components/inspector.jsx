import React from 'react'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store
    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })
  }

  render() {
    return <div className="Inspector">
      <h2>DocInspector <img src="assets/images/microscope.svg" /></h2>
      
      <pre>
        <code>
          { JSON.stringify(this.store.getState(), null, 2) }
        </code>
      </pre>

    </div>
  }
}
