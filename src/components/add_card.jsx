import React from 'react'

export default class AddCard extends React.Component {
  constructor() {
    super()

    this.showForm    = this.showForm.bind(this)
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

  createCard() {
    this.props.store.createCard({
      listId: this.props.listId,
      title: this.state.title
    })

    // clear the form
    this.setState({ title: "", showForm: false })
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
          <a href="#">X</a>
        </div>
      )
    } else {
      addCard = <a href="#" onClick={ this.showCardForm }>Add a card...</a>
    }

    return (
      <div className="AddCard">
        { addCard }
      </div>
    )
  }
}
