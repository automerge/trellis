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
    this.setState({ showForm: true })
  }

  clearForm() {
    this.setState({ title: "", showForm: false })
  }

  createCard() {
    this.props.store.createCard({
      listId: this.props.listId,
      title: this.state.title
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
          <textarea onChange= { this.updateTitle } />
          <button onClick={ this.createCard }>Add</button>
          <a onClick={ this.clearForm } href="#">X</a>
        </div>
      )
    } else {
      addCard = <a href="#" onClick={ this.showForm }>Add a card...</a>
    }

    return (
      <div className="AddCard">
        { addCard }
      </div>
    )
  }
}
