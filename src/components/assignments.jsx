import React from 'react'

export default class Assignments extends React.Component {
  constructor() {
    super()
    this.state = { assigned: new Set() }
    this.toggle = this.toggle.bind(this)
  }

  toggle(event) {
    let person = event.target.name
    let assigned = this.state.assigned
    if (assigned.has(person))
      assigned.delete(person)
    else
      assigned.add(person)

    this.setState({ assigned: assigned })
  }

  people() {
    return [ 'adam', 'orion', 'pvh', 'roshan', 'martin' ]
  }

  render() {
    let assignments = this.people().map((person) => {
      let fname = "assets/images/avatars/" + person + ".png"
      let klass = this.state.assigned.has(person) ? "Assignments__active" : "Assignments__inactive"
      return <img key={person} name={person} src={fname} className={klass} onClick={ this.toggle } />
    })
    return (
      <div className="Assignments">{assignments}</div>
    )
  }
}
