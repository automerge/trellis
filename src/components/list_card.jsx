import React from 'react'

export default class ListCard extends React.Component {
  render() {
    return (
      <div className="ListCard">
        <div className="ListCard__title"> { this.props.title }</div>
      </div>
    )
  }
}
