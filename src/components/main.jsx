import React from 'react'

export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.store = this.props.store
    this.store.subscribe( (k) => this.setState({}))
    this.toggleButton = this.toggleButton.bind(this)
  }

  toggleButton() {
    var current = this.store.getState().button
    this.store.dispatch({type: "TOGGLE_BUTTON", button: !current})
  }

  render() {
    console.log("RENDERING MAIN")
    let buttonState = this.store.getState().button ? "on" : "off"
    let switchPath = "assets/images/switch-" + buttonState + ".svg"

    return <div className="Main">
      <h2>Push The Button</h2>
      <img className="networkSwitch" src={switchPath} onClick={ this.toggleButton } />
    </div>
  }
}
