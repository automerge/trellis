import React from 'react'

export default class Documents extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let documents = this.props.recentDocs.slice(-4).reverse()

    let documentsPartial = documents.map((doc) => {
      let key = "recentDocs[" + doc.id + "]"
      return <div key={key} className="document">
        <div className="docid">{doc.id}</div>
        <div className="title">{doc.title}</div>
        <div className="users">Alice · Bob</div>
      </div>
    })

    return <div className="Documents">
      <h2>Documents <img src="assets/images/documents.svg" /></h2>
      {documentsPartial}
    </div>
  }
}
