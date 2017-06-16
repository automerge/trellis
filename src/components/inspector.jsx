import React from 'react'
import TesseractInfo from './tesseract_info'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
    this.store = this.props.store
  }

  detectSchema(table) {
    let columns = []

    Object.keys(table).forEach((index) => {
      let row = table[index]
      Object.keys(row).forEach((rowKey) => {
        if(!columns.includes(rowKey)) {
          columns.push(rowKey)
        }
      })
    })

    return columns
  }

  render() {
    let listCardsPartial = ""
    let listsPartial     = ""
    let state            = this.store.getState()
    let tables           = {}
    let objects          = {}

    let stateB, stateC

    stateB = {
      lists: [
        {
          id: 1,
          title: "This Week",
          cards: [
            { id: 1, title: "Card A" },
            { id: 2, title: "Card B" },
            { id: 3, title: "Card C" }
          ]
        },
        {
          id: 2,
          title: "Done",
          cards: [
            { id: 4, title: "Card D" },
          ]
        },
        {
          id: 3,
          title: "Soon",
          cards: []
        }
      ]
    }

    stateC = Object.assign({}, stateB)
    stateC.config = {
      user: {
        name: "Roshan",
        preferences: {
          background: "http://imgur.com/ajr7a",
          autoSave: true,
          connected: true,
          recentFiles: 20,
          network: {
            showPeers: true
          }
        }
      }
    }

    Object.keys(state).forEach((key) => {
      let value = state[key]
      if(Array.isArray(value)) {
        tables[key] = value
      } else {
        objects[key] = value
      }
    })

    let tablesPartial = Object.keys(tables).map((tableName) => {
      let table   = tables[tableName]
      let columns = this.detectSchema(table)
      let columnsPartial = columns.map((column) => {
        return <th key={ column }>{ column }</th>
      })

      let rowPartials = Object.keys(table).map((index) => {
        let row = table[index]
        let dataPartial = columns.map((column) => {
          let data = row[column]
          return <td key={ column }>{ JSON.stringify(data) }</td>
        })

        if(this.props.highlightOptions
          && this.props.highlightOptions.tableName === tableName
          && this.props.highlightOptions.row === parseInt(index)) {
          return <tr key={ index } className="highlight">{ dataPartial }</tr>
        } else {
          return <tr key={ index }>{ dataPartial }</tr>
        }
      })

      return <div key={ tableName }>
        <h3> { tableName } </h3>
        <table>
          <tbody>
            <tr>{ columnsPartial }</tr>
            { rowPartials }
          </tbody>
        </table>
      </div>
    })

    let objectsPartial = Object.keys(objects).map((objectName) => {
      let object = objects[objectName]

      return <div key={ objectName }>
        <h3> { objectName } </h3>
        <pre> <code> { JSON.stringify(object, null, 2) } </code> </pre>
      </div>
    })

    return <div className="Inspector">
      <h2>DocInspector <img src="assets/images/microscope.svg" /></h2>
      <div className="Inspector__container">
        { tablesPartial }
        { objectsPartial }
      </div>
    </div>
  }
}
