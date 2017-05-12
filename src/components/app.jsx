import React from 'react'
import Board from './board'
import Inspector from './inspector'
import Connection from './connection'
import Store from '../lib/store'
import { Store as TesseractStore } from 'tesseract'

const Tesseract = require("tesseract")
const dialog    = require("electron").remote.dialog
const fs        = require("fs")

class FileDialog extends React.Component {
  constructor(props) {
    super(props)
    this.open   = this.open.bind(this)
    this.save   = this.save.bind(this)
    this.merge  = this.merge.bind(this)
  }

  open() {
    dialog.showOpenDialog(function(files) {
      let file = fs.readFileSync(files[0])
      let newStore = Tesseract.load(file)
      this.props.store.loadTesseract(newStore)
    }.bind(this))
  }

  merge() {
    dialog.showOpenDialog(function(files) {
      let file = fs.readFileSync(files[0])
      let newStore = Tesseract.load(file)
      this.props.store.merge(newStore)
    }.bind(this))
  }

  save() {
    dialog.showSaveDialog(function(path) {
      let exportFile = this.props.store.tesseract.save()
      fs.writeFileSync(path, exportFile)
    }.bind(this))
  }

  render() {
    return (<div>
      <a href="#" onClick={ this.open }>Open</a>
      <a href="#" onClick={ this.save }>Save</a>
      <a href="#" onClick={ this.merge }>Merge</a>
    </div>)
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.store              = new Store()
    this.inspectorTesseract = new TesseractStore("inspector")

    this.store.link(this.inspectorTesseract)
  }

  render() {
    return (
      <div className="App">
        <FileDialog store={ this.store } />
        <Board store={ this.store } />
        <Connection connected={true} store={ this.store } tesseract={ this.inspectorTesseract } />
        <Inspector tesseract={ this.inspectorTesseract } />
      </div>
    )
  }
}
