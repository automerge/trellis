export default class LocalStorageAdapter {
  constructor(config={}) {
    if(config.onLoad) {
      config.onLoad(this.getState())
    }
  }

  getState() {
    let serialized = localStorage.getItem("state")

    return JSON.parse(serialized)
  }

  setState(state) {
    let serialized = JSON.stringify(state)
    localStorage.setItem("state", serialized)
  }
}
