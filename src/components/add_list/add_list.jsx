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
    this.setState({ showForm: true }, () => this.titleInput.focus())
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

    this.clearForm()
  }

  render() {
    let partial

    if(this.state.showForm) {
      partial =
      <div>
        <input
          ref={ (input) => this.titleInput = input }
          type="text" placeholder="Add a list…" onChange={ this.updateTitle } />
        <div>
          <a className="AddList__save" onClick={ this.createList }>Save</a>
          <a className="AddList__clearForm" onClick={ this.clearForm }>X</a>
        </div>
      </div>
    } else {
      partial = <a className="AddList__show" onClick={ this.showForm }> Add a list… </a>
    }

    return (
      <div className="AddList">
        { partial }
      </div>
    )
  }
}
