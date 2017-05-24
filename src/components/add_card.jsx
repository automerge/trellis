import React from 'react'

export default class AddCard extends React.Component {
  constructor() {
    super()

    this.showForm    = this.showForm.bind(this)
    this.clearForm   = this.clearForm.bind(this)
    this.createCard  = this.createCard.bind(this)
    this.updateTitle = this.updateTitle.bind(this)

    this.state = {
      title: "",
      showForm: false
    }
  }

  showForm() {
    this.setState({ showForm: true }, () => this.titleInput.focus() )
  }

  clearForm() {
    this.setState({ title: "", showForm: false })
  }

  createCard() {
    this.props.store.dispatch({
      type: "CREATE_CARD",
      attributes: {
        listId: this.props.listId,
        title: this.state.title
      }
    })

    this.clearForm()
  }

  updateTitle(event) {
    this.setState({ title: event.target.value })
  }

  render() {
    let addCard
    if(this.state.showForm) {
      addCard = (
        <div>
          <textarea
            ref={ (input) => this.titleInput = input }
            onChange= { this.updateTitle } />
          <button onClick={ this.createCard }>Add</button>
          <a onClick={ this.clearForm } href="#">X</a>
        </div>
      )
    } else {
      addCard = <div className="AddCard__link" onClick={ this.showForm }>Add a card...</div>
    }

    return (
      <div className="AddCard">
        { addCard }
      </div>
    )
  }
}
