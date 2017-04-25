import React from 'react'

export default class App extends React.Component {
  render() {
    let gravatarURL = "https://s.gravatar.com/avatar/df8958072ba78fba83c0b35dad49cdea?s=80"

    return (
      <div>
        <h1>Trellis</h1>
        <div className="List">
          <div className="List__title"> Icebox </div>
          <div className="ListCard">
            <div className="ListCard__title"> Rewrite everything in Crystal </div>
            <div className="Members">
              <div className="Members__member">
                <img src={gravatarURL} />
              </div>
            </div>
          </div>
          <div className="ListCard">
            <div className="ListCard__title"> Synergize </div>
          </div>
          <div className="ListCard">
            <div className="ListCard__title"> Solve AGI </div>
          </div>
          <div className="AddCard">
            <a href="#">Add a card...</a>
          </div>
        </div>

        <div className="List">
          <div className="List__title"> Active </div>
          <div className="ListCard">
            <div className="ListCard__title"> Add more "pop" to the landing page </div>
          </div>
          <div className="AddCard">
            <a href="#">Add a card...</a>
          </div>
        </div>

        <div className="List">
          <div className="List__title"> Done </div>
          <div className="ListCard">
            <div className="ListCard__title"> Rewrite everything in Go </div>
          </div>
          <div className="AddCard">
            <a href="#">Add a card...</a>
          </div>
        </div>

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
