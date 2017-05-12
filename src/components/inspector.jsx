import React from 'react'
import TesseractInfo from './tesseract_info'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
    this.updateListId = this.updateListId.bind(this)
    this.updateTitle = this.updateTitle.bind(this)

    this.tesseract = this.props.tesseract

    this.state = this.tesseract.getState()
    this.tesseract.subscribe((x) => { this.setState(this.tesseract.getState()) })
  }

  updateListId(event) {
    let index = parseInt(event.target.name.replace(/[^0-9]/g, ''))
    let newListId = parseInt(event.target.value)

    if (newListId >= 1 && newListId <= 3) {
      this.tesseract.root.cards[index].listId = newListId
      this.setState(this.tesseract.getState())
    }
  }

  updateTitle(event) {
    let index = parseInt(event.target.name.replace(/[^0-9]/g, ''))
    let newTitle = event.target.value

    this.tesseract.root.cards[index].title = newTitle
    this.setState(this.tesseract.getState())
  }

  render() {
    let listCardsPartial = ""

    if(this.tesseract.root.cards) {
      listCardsPartial = this.tesseract.root.cards.map((card, index) => {
        let name1 = 'cardListId[' + index + ']'
        let name2 = 'cardTitle[' + index + ']'
        return <tr key={index}>
          <td>{card.id}</td>
          <td><input type="text" className="number" name={name1} value={card.listId} onChange={this.updateListId} /></td>
          <td><input type="text" className="string" name={name2} value={card.title} onChange={this.updateTitle} /></td>
        </tr>
      })
    }

    return <div className="Inspector">
      <h2>Inspector</h2>
      <h3>Cards</h3>
      <form>
      <table>
        <thead><tr><th>id</th><th>list</th><th>title</th></tr></thead>
        <tbody>{ listCardsPartial }</tbody>
      </table>
      </form>

      <TesseractInfo tesseract={this.tesseract} />
    </div>
  }
}
