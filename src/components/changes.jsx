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
        return <div><span className="author">{meta.author}</span> created card <span className="list">{meta.action.attributes.title}</span></div>
      case "MOVE_CARD":
        var prevCard = this.store.findCardFromState(meta.action.cardId, prevChange.snapshot)
        var newCard = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        var prevList = this.store.findListFromState(prevCard.listId, prevChange.snapshot)
        var newList = this.store.findListFromState(newCard.listId, change.snapshot)
        return <div>
          <span className="author">{meta.author}</span> moved <span className="card">{newCard.title}</span> from&nbsp;
          <span className="list">{prevList.title}</span> &rarr; <span className="list">{newList.title}</span>
        </div>
      case "UPDATE_CARD_TITLE":
        var newCard = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        return <div><span className="author">{meta.author}</span> renamed card to <span className="card">{newCard.title}</span></div>
      case "UPDATE_CARD_DESCRIPTION":
        var card = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        return <div><span className="author">{meta.author}</span> changed description of <span className="card">{card.title}</span></div>
      case "DELETE_CARD":
        var card = this.store.findCardFromState(meta.action.cardId, prevChange.snapshot)
        return <div><span className="author">{meta.author}</span> deleted <span className="card">{card.title}</span></div>
      case "UPDATE_ASSIGNMENTS":
        var prevCard = this.store.findCardFromState(meta.action.cardId, prevChange.snapshot)
        var newCard = this.store.findCardFromState(meta.action.cardId, change.snapshot)
        if (Object.keys(newCard.assigned) > Object.keys(prevCard.assigned))
          return <div><span className="author">{meta.author}</span> assigned <span className="card">{newCard.title}</span></div>
        else
          return <div><span className="author">{meta.author}</span> unassigned <span className="card">{newCard.title}</span></div>
      case "CREATE_LIST":
        return <div><span className="author">{meta.author}</span> created list <span className="list">{meta.action.attributes.title}</span></div>
      case "DELETE_LIST":
        var list = this.store.findListFromState(meta.action.listId, prevChange.snapshot)
        return <div><span className="author">{meta.author}</span> deleted list <span className="list">{list.title}</span></div>
      default:
        return <div><span className="author">{meta.author}</span> {meta.action.type}</div>
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
