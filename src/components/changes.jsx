import React from 'react'

export default class Changes extends React.Component {
  constructor(props) {
    super(props)

    this.store = this.props.store
    this.state = this.store.getState()
    this.store.subscribe((x) => { this.setState(this.store.getState()) })
  }

  displayChange(change, prevChange) {
    let meta = change.changeset.message
    if (!meta || !meta.author || !meta.action) return ""

    switch(meta.action.type) {
      case "CREATE_CARD":
        return meta.author + " created a card"
      case "MOVE_CARD":
        var prevCard = this.store.findCardFromState(meta.action.cardId, prevChange.snapshot)
        var newCard = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        var prevList = this.store.findListFromState(prevCard.listId, prevChange.snapshot)
        var newList = this.store.findListFromState(newCard.listId, change.snapshot)
        return meta.author + " moved “" + newCard.title + "”" + " from “" + prevList.title + "”" + " to “" + newList.title + "”"
      case "UPDATE_CARD_TITLE":
        var newCard = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        return meta.author + " renamed card to “" + newCard.title + "”"
      case "UPDATE_CARD_DESCRIPTION":
        var newCard = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        return meta.author + " changed description of “" + newCard.title + "”"
      case "DELETE_CARD":
        var card = this.store.findCardFromState(meta.action.cardId, prevChange.snapshot)
        return meta.author + " deleted “" + card.title + "”"
      case "UPDATE_ASSIGNMENTS":
        var prevCard = this.store.findCardFromState(meta.action.cardId, prevChange.snapshot)
        var newCard = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        if (Object.keys(newCard.assigned) > Object.keys(prevCard.assigned))
          return meta.author + " assigned “" + newCard.title + "”"
        else
          return meta.author + " unassigned “" + newCard.title + "”"
      case "CREATE_LIST":
        return meta.author + " created a list"
      case "DELETE_LIST":
        var list = this.store.findListFromState(meta.action.listId, prevChange.snapshot)
        return meta.author + " deleted list “" + list.title + "”"
      default:
        return meta.author + " " + meta.action.type
    }
  }

  render() {
    const changesToShow = 10
    let changes = this.store.getHistory().slice((changesToShow+1) * -1)
    let prevChange = changes[0]
    changes = changes.slice(changesToShow * -1)

    let changesPartial = changes.map((change, index) => {
      let key = "change-" + index

      let edgeImg = ""
      if (index < changes.length-1)
        edgeImg = <div className="changeEdge" />

      let changeMessage = this.displayChange(change, prevChange)
      prevChange = change

      let klass = ""
      let icon = "change-node"
      if (index == changes.length-1) {
        klass = "highlight"
        icon = "change-highlight"
      }

      let iconPath = "assets/images/" + icon + ".svg"

      return <li key={key} className={klass}>
        <img className="changeNode" src={iconPath} />
        {edgeImg}{changeMessage}
      </li>
    })

    return <div className="Changes">
      <h2>Changes <img src="assets/images/delta.svg" /></h2>
      <ul>{changesPartial}</ul>
    </div>
  }
}
