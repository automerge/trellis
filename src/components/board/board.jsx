import React        from 'react'
import List         from '../list/list'
import AddList      from '../add_list/add_list'
import Card         from '../card/card'
import InlineInput  from '../inline_input'
import Flash        from '../flash/flash'

export default class Board extends React.Component { constructor(props) {
    super(props)

    this.showModal  = this.showModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.updateBoardTitle = this.updateBoardTitle.bind(this)

    this.state = { showModal: false, card: null }

    window.onkeydown = (event) => {
      if(event.key === "Escape")
        this.closeModal()
    }
  }

  showModal(card) {
    this.setState({ showModal: true, card: card })
  }

  closeModal() {
    this.setState({ showModal: false, card: null })
  }

  updateBoardTitle(value) {
    this.props.store.dispatch({
      type: "UPDATE_BOARD_TITLE",
      value: value
    })
  }

  render() {
    let lists
    let modal = ""
    let state = this.props.store.getState()

    if(state.lists) {
      lists = state.lists.map((list) => {
        return <List
          listId={ list.id }
          key={ list.id }
          store={ this.props.store }
          showModal={ this.showModal }
          highlightOptions={ this.props.highlightOptions }
        />
      })
    } else {
      lists = []
    }

    if(this.state.showModal) {
      modal = <div className="Modal" onClick={ this.closeModal }>
        <Card close={ this.closeModal } store={ this.props.store } cardId={ this.state.card.id } close={ this.closeModal } />
      </div>
    }

    return (
      <div className="Board">
        <Flash ref={ (node) => this.flash = node } message={ this.props.flashMessage } />
        <div className="Board__title">
          <InlineInput onSubmit={ this.updateBoardTitle } defaultValue={ state.boardTitle || "Board Title" }>
            { state.boardTitle || "Board Title" }
          </InlineInput>
        </div>
        <div className="Board__lists">
          { lists }
          <AddList store={ this.props.store } />
        </div>
        { modal }
      </div>
    )
  }
}
