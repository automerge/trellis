import React from 'react'

export default class Documents extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let documents = [
      { docid: 'gray-istanbul-62', title: 'Sprint Planning', users: 'Alice・Bob' },
      { docid: 'cobalt-jakarta-40', title: 'Untitled', users: 'Carlos' },
      { docid: 'emerald-tokyo-57', title: 'Avengers Recruiting', users: '' },
      { docid: 'cobalt-delhi-85', title: 'Sprint Planning Fork', users: '' },
    ]

    let documentsPartial = documents.map((doc) => {
      return <div key={doc.docid} className="document">
        <div className="docid">{doc.docid}</div>
        <div className="title">{doc.title}</div>
        <div className="users">{doc.users}</div>
      </div>
    })

    return <div className="Documents">
      <h2>Documents <img src="assets/images/documents.svg" /></h2>
      {documentsPartial}
    </div>
  }
}
