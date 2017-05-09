import React from 'react'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="Inspector">{ JSON.stringify(this.props.store.getState()) }</div>
  }
}
