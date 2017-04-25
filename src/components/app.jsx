import React from 'react'

export default class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Trellis</h1>
        <div class="List">
          <div class="List__title"> Icebox </div>
          <div class="Card">
            <div class="Card__title"> Rewrite everything in Crystal </div>
          </div>
          <div class="Card">
            <div class="Card__title"> Synergize </div>
          </div>
          <div class="Card">
            <div class="Card__title"> Solve AGI </div>
          </div>
        </div>

        <div class="List">
          <div class="List__title"> Active </div>
          <div class="Card">
            <div class="Card__title"> Add more "pop" to the landing page </div>
          </div>
        </div>

        <div class="List">
          <div class="List__title"> Done </div>
          <div class="Card">
            <div class="Card__title"> Rewrite everything in Go </div>
          </div>
        </div>
      </div>
    )
  }
}
