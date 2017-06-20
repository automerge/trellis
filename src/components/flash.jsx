import React from 'react'

export default class Flash extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  show(message) {
    this.setState({ message: undefined })
    this.setState({ message: message })

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
