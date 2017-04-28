import PouchDB from 'pouchdb'

export default class PouchAdapter {
  constructor(config={}) {
    let remoteConfig = {
      auth: {
        username: process.env.CLOUDANT_USERNAME,
        password: process.env.CLOUDANT_PASSWORD
      }
    }

    this.db            = new PouchDB('trellis')
    this.remote        = new PouchDB('https://45bits.cloudant.com/trellis/', remoteConfig)
    this.docId         = "state"
    this.doc           = {}
    this.onLoad        = config.onLoad
    this.onChange      = config.onChange

    // Get or initialize a 'state' document in PouchDB
    this.db.get(this.docId).then((doc) => {
      this.doc = doc

      if(this.onLoad) this.onLoad(this.doc.state)
    }).catch((error) => {
      if(error.status === 404) {
        this.db.put({ _id: this.docId }).then((result) => {
          this.doc._rev = result.rev

          if(this.onLoad) this.onLoad(null)
        })
      } else {
        console.log(error)
      }
    })

    // Set up replication subscriptions
    let options = { live: true }
    PouchDB.replicate(this.db, this.remote, options)
      .on("error", console.log)

    PouchDB.replicate(this.remote, this.db, options)
      .on("change", (info) => {
        console.log("Remote change")

        this.db.get(this.doc._id).then((doc) => {
          this.doc = doc

          if(this.onChange) this.onChange(doc.state)
        })
      })
      .on("error", console.log)
  }

  setState(state) {
    this.doc.state = state

    this.db.put(this.doc, (err, result) => {
      if(err) console.log(err)
      this.doc._rev = result.rev
    })
  }

  resetState() {
    this.db.get(this.docId).then((doc) => {
      if(doc) {
        this.db.remove(doc).then((result) => {
          console.log("Cleared State")
        })
      }
    })
  }
}
