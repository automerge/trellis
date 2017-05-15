import React from 'react'

export default class Connection extends React.Component {
  constructor(props) {
    super(props)
    this.state = { connected: props.connected }
    this.toggleConnection = this.toggleConnection.bind(this)
  }

  toggleConnection() {
    if(this.state.connected) {
      this.props.store.pause()
      this.props.inspectorStore.pause()
      this.setState({connected: false}, () => { console.log("Disconnected") })
    } else {
      this.props.store.unpause()
      this.props.inspectorStore.unpause()
      this.setState({connected: true}, () => { console.log("Connected") })
    }
  }

  render() {
    let icon = this.state.connected ? "connected" : "disconnected"
    let imgsrc = "assets/images/" + icon + ".svg";
    return <div className="Connection" onClick={this.toggleConnection}>
      <img src={imgsrc} alt={icon} />
    </div>
  }
}
