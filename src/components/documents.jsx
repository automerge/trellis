import React from 'react'

export default class Documents extends React.Component {
  constructor(props) {
    super(props)
    this.openDocument = this.openDocument.bind(this)
    
    this.peerHandler = this.peerHandler.bind(this)
    this.state = { peers: {}  }
  }
  
  // The constructor is not necessarily called on
  // re-renders, so set our webrtc listeners here
  componentWillReceiveProps(nextProps) {
    if(!nextProps.network) return

    // Make sure to remove previous listener first
    this.props.network.peerStats.removeListener('peer', this.peerHandler)

    this.setState({
      peers: Object.assign({}, nextProps.network.peerStats.getStats())
    })

    nextProps.network.peerStats.on('peer', this.peerHandler)
  }
  
  peerHandler() {
    this.setState({
      peers: Object.assign({}, this.props.network.peerStats.getStats())
    })
  }

  openDocument(docId) {
    this.props.openDocument(docId)
  }

  render() {
    let peers = this.state.peers
    let documents = this.props.recentDocs.slice(-4).reverse()

    let userDocs = {}

    Object.entries(peers).forEach( ([peerId, stats]) => {
      if (stats.docId) {
        let docIndex = documents.findIndex( (i) => i.id == stats.docId )
        if (docIndex < 0) {
          console.log("Couldn't find ", stats.docId, "among", documents)
          let newDoc = {
            id: stats.docId,
            lastActive: Date.now()
          }
          documents.splice(1, 0, newDoc);
          this.props.recentDocs.splice(1, 0, newDoc);
          docIndex = 1
        }
        if (stats.docTitle) {
          documents[docIndex].title = stats.docTitle
        }

        if (stats.name) {
          if (!userDocs[stats.docId]) { userDocs[stats.docId] = []}
          if (!userDocs[stats.docId].includes(stats.name)) {
            userDocs[stats.docId].push(stats.name)
          } 
        }
      }
    })

    // show myself in the list
    if (!userDocs[this.props.myDocId]) { userDocs[this.props.myDocId] = []}
    if (!userDocs[this.props.myDocId].includes(this.props.myName)) {
      userDocs[this.props.myDocId].push(this.props.myName)
    }

    let documentsPartial = documents.map((doc) => {
      let key = "recentDocs[" + doc.id + "]"
      let users = (userDocs[doc.id]) ? userDocs[doc.id].join("・") : ''
      return <div key={key} className="document" onClick={() => this.openDocument(doc.id)}>
        <div className="docid">{doc.id}</div>
        <div className="title">{doc.title}</div>
        <div className="users">{users}</div>
      </div>
    })

    return <div className="Documents">
      <h2>Documents <img src="assets/images/documents.svg" /></h2>
      {documentsPartial}
    </div>
  }
}
