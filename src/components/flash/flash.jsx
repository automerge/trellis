import React from 'react'

export default class Flash extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  show(message) {
    // First clear out previous flash if it exists
    this.setState({ message: undefined })
    this.setState({ message: message })

    // The timing here must match up with whatever 
    // CSS animations are applied to .Flash
    setTimeout(() => {
      this.setState({ message: undefined })
    }, 6000)
  }

  render() {
    if(this.state.message)
      return <div className="Flash">{ this.state.message }</div>
    else
      return null
  }
}
