import React          from 'react'
import AutomergeInfo  from '../automerge_info'
import InlineInput    from '../inline_input'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
    this.store = this.props.store
    this.updateTd = this.updateTd.bind(this)
    this.updateObject  = this.updateObject.bind(this)
  }

  componentDidUpdate() {
    if(this.highlightActive || !this.highlightTr)
      return false

    this.highlightActive = true
    this.highlightTr.classList.add("highlight")

    setTimeout(() => {
      this.highlightTr.classList.remove("highlight")
      this.highlightActive = false
    }, 1000)

    return true
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

  updateTd(table, row, column, value) {
    this.store.dispatch({
      type: "INSPECTOR_UPDATE",
      table: table,
      row: row,
      column: column,
      value: value
    })
  }

  updateObject(key, value) {
    this.store.dispatch({
      type: "INSPECTOR_UPDATE",
      key: key,
      value: value
    })
  }

  render() {
    let listCardsPartial = ""
    let listsPartial     = ""
    let state            = this.store.getState()
    let tables           = {}
    let objects          = {}

    // Break down state into objects and tables
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
          return <td key={ column }>
            <InlineInput
              onSubmit={ (value) => this.updateTd(tableName, index, column, value) }
              defaultValue={ JSON.stringify(data) }
            >
              { JSON.stringify(data) || " " }
            </InlineInput>
          </td>
        })

        if(this.props.highlightOptions
          && this.props.highlightOptions.tableName === tableName
          && this.props.highlightOptions.row === parseInt(index)) {
          return <tr key={ index } ref={ (tr) => this.highlightTr = tr }>{ dataPartial }</tr>
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
        <pre>
          <code>
            <InlineInput
              onSubmit={ (value) => this.updateObject(objectName, value) }
              defaultValue={ JSON.stringify(object, null, 2) }>
              { JSON.stringify(object, null, 2) }
            </InlineInput>
          </code>
        </pre>
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
