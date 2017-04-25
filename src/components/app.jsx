import React from 'react'
import List from './list'

export default class App extends React.Component {
  constructor() {
    super()
    this.icebox = []
    this.active = []
    this.done   = []

    this.icebox.push({ title: "Rewrite everything in Crystal" })
    this.icebox.push({ title: "Solve AGI" })
    this.active.push({ title: "Add more 'pop' to the landing page" })
    this.done.push(  { title: "Rewrite everything in Go" })
  }

  render() {
    let gravatarURL = "https://s.gravatar.com/avatar/df8958072ba78fba83c0b35dad49cdea?s=80"

    return (
      <div>
        <h1>Trellis</h1>
        <List cards={ this.icebox } />
        <List cards={ this.active } />
        <List cards={ this.done   } />

        <div style={{ clear: "both" }} />

        <div className="Card">
          <div className="Card__title">
            <h3> Add more "pop" to the landing page </h3>
          </div>

          <div className="Card__description">
            <b>Description</b> <a href="#">Edit</a>
            <p>The marketing team would like to add at least 10x more pop to the landing page.</p>
          </div>

          <div className="Members">
            <b>Members</b>
            <div className="Members__member">
              <img src={gravatarURL} />
            </div>
          </div>

          <div className="Comments">
            <b>Comments</b>
            <div>
              <textarea cols="80" />
              <button>Send</button>
            </div>
            <div className="Comment">
              <div className="Comment__avatar">
                <img src={gravatarURL} />
              </div>
              <div className="Comment__body">
                That's too much pop
              </div>
              <div className="Comment__timestamp">
                7 minutes ago
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
