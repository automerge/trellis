import React from 'react'

export default class Assignments extends React.Component {
  constructor() {
    super()
    this.toggle = this.toggle.bind(this)
  }

  card() {
    return this.props.store.findCard(this.props.cardId)
  }

  assigned() {
    let a = this.card().assigned
    return a ? a : {}
  }

  toggle(event) {
    if(this.props.readonly)
      return

    event.stopPropagation()

    let person     = event.target.name
    let isAssigned = !this.assigned()[person]

    this.props.store.dispatch({
      type: "UPDATE_ASSIGNMENTS",
      cardId: this.props.cardId,
      person: person,
      isAssigned: isAssigned
    })
  }

  // Hardcoded names used for demo and prototyping
  people() {
    if (process.env.AVENGERS)
      return [ 'nick', 'natasha' ]
    else
      return [ 'adam', 'orion', 'pvh', 'roshan', 'martin' ]
  }

  render() {
    let people = this.people()
    if (this.props.readonly)
      people = people.filter((person) => this.assigned()[person])

    let assignments = people.map((person) => {
      let fname = "assets/images/avatars/" + person + ".png"
      let klass = this.assigned()[person] ? "Assignments__active" : "Assignments__inactive"
      return <img key={person} name={person} src={fname} className={klass} onClick={ this.toggle } />
    })
    return (
      <div className="Assignments clear">
        { assignments}
      </div>
    )
  }
}
