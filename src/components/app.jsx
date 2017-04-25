import React from 'react'

export default class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Trellis</h1>
        <div className="List">
          <div className="List__title"> Icebox </div>
          <div className="Card">
            <div className="Card__title"> Rewrite everything in Crystal </div>
          </div>
          <div className="Card">
            <div className="Card__title"> Synergize </div>
          </div>
          <div className="Card">
            <div className="Card__title"> Solve AGI </div>
          </div>
        </div>

        <div className="List">
          <div className="List__title"> Active </div>
          <div className="Card">
            <div className="Card__title"> Add more "pop" to the landing page </div>
          </div>
        </div>

        <div className="List">
          <div className="List__title"> Done </div>
          <div className="Card">
            <div className="Card__title"> Rewrite everything in Go </div>
          </div>
        </div>
      </div>
    )
  }
}
