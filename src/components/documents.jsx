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

    this.setState({
      peers: Object.assign({}, {})
    })
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
    console.log("no render")
    return <div className="Documents">
      <h2>Documents <img src="assets/images/documents.svg" /></h2>
      
    </div>
  }
}
