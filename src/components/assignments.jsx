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
    let person = event.target.name
    let assigned = this.assigned()

    if (assigned[person])
      delete assigned[person]
    else
      assigned[person] = "true"

    this.props.store.updateCard(this.props.cardId, { assigned: assigned })
  }

  people() {
    return [ 'adam', 'orion', 'pvh', 'roshan', 'martin' ]
  }

  render() {
    let assignments = this.people().map((person) => {
      let fname = "assets/images/avatars/" + person + ".png"
      let klass = this.assigned()[person] ? "Assignments__active" : "Assignments__inactive"
      return <img key={person} name={person} src={fname} className={klass} onClick={ this.toggle } />
    })
    return (
      <div className="Assignments">{assignments}</div>
    )
  }
}
