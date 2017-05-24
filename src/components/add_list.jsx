import React from 'react'

export default class AddList extends React.Component {
  constructor() {
    super()

    this.showForm    = this.showForm.bind(this)
    this.clearForm   = this.clearForm.bind(this)
    this.createList  = this.createList.bind(this)
    this.updateTitle = this.updateTitle.bind(this)

    this.state = {
      title: "",
      showForm: false
    }
  }

  showForm() {
    this.setState({ showForm: true })
  }

  clearForm() {
    this.setState({ title: "", showForm: false })
  }

  updateTitle(event) {
    this.setState({ title: event.target.value })
  }

  createList() {
    this.props.store.dispatch({
      type: "CREATE_LIST",
      attributes: {
        title: this.state.title
      }
    })
  }

  render() {
    let partial

    if(this.state.showForm) {
      partial = 
      <div>
        <input type="text" placeholder="Add a list…" onChange={ this.updateTitle } /> 
        <button onClick={ this.createList }>Save</button>
        <a onClick={ this.clearForm }>X</a>
      </div>
    } else {
      partial = <a onClick={ this.showForm }> Add a list… </a>
    }

    return (
      <div className="AddList">
        { partial }
      </div>
    )
  }
}

