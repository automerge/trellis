import React from 'react'

export default class Inspector extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="Inspector">
          <div>"lists": [</div>
            <div className="Inspector__record">&#123; "id": 1, "title": "icebox" &#125;,</div>
            <div className="Inspector__record">&#123; "id": 2, "title": "active" &#125;,</div>
            <div className="Inspector__record">&#123; "id": 3, "title": "done" &#125;</div>
          <div>]</div>
        </div>
  }
}
