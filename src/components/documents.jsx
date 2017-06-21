import React from 'react'

export default class Documents extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="Documents">
      <h2>Documents <img src="assets/images/documents.svg" /></h2>
      <div className="document">
        <div className="docid">gray-istanbul-62</div>
        <div className="title">Sprint Planning</div>
        <div className="users">Alice ・ Bob</div>
      </div>
    </div>
  }
}
