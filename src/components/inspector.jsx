import React from 'react'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let listCardsPartial = this.props.store.getState().cards.map((card) => {
      return <tr><td>{card.id}</td><td>{card.listId}</td><td>{card.title}</td></tr>
    })

    return <div className="Inspector">
      <h3>Cards</h3>
      <table>
        <tr><th>id</th><th>listId</th><th>title</th></tr>
        { listCardsPartial }
      </table>
    </div>
  }
}
