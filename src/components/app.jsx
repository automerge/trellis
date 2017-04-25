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
      </div>
    )
  }
}
