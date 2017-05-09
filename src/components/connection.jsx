import React from 'react'

export default class Connection extends React.Component {
  constructor(props) {
    super(props)
    this.state = { connected: props.connected }
    this.toggleConnection = this.toggleConnection.bind(this)
  }

  toggleConnection() {
    this.setState({ connected: !this.state.connected })
    console.log("connected is now", this.state.connected)
  }

  render() {
    let icon = this.state.connected ? "connected" : "disconnected"
    let imgsrc = "assets/images/" + icon + ".svg";
    return <div className="Connection" onClick={this.toggleConnection}>
      <img src={imgsrc} alt={icon} />
    </div>
  }
}
