import PouchDB from 'pouchdb'

export default class PouchAdapter {
  constructor() {
    this.db            = new PouchDB('trellis')
    this.remoteCouch   = false
    this.docId         = "state"
    this.doc           = null

    this.db.get(this.docId).then((doc) => {
      this.doc = doc

      if(this.onLoad) {
        this.onLoad(this.doc.state)
      }
    }).catch((error) => {
      if(error.status === 404) {
        let doc = {
          _id: this.docId,
          state: require("../initial_state.json")
        }

        this.db.put(doc).then((result) => {
          this.doc      = doc
          this.doc._rev = result.rev

          if(this.onLoad) {
            this.onLoad(this.doc.state)
          }
        })
      } else {
        console.log(error)
      }
    })
  }

  setState(state) {
    this.doc.state = state

    this.db.put(this.doc, (err, result) => {
      if(err) console.log(err)
      this.doc._rev = result.rev
    })
  }

  clear() {
    this.db.get(this.docId).then((doc) => {
      if(doc) {
        this.db.remove(doc).then((result) => {
          console.log("Cleared State")
        })
      }
    })
  }
}
