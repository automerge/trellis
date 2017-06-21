import React from 'react'

export default class Comment extends React.Component {
  constructor() {
    super()
    this.createComment = this.createComment.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  handleKeyDown(event) {
    if(!event.shiftKey && event.key === "Enter")
      this.createComment()
  }

  comments() {
    return this.props.store.findCommentsByCard(this.props.cardId)
  }

  createComment() {
    this.props.store.dispatch({
      type: "CREATE_COMMENT",
      cardId: this.props.cardId,
      body: this.newComment.value
    })

    this.newComment.value = null
  }

  formatTimestamp(timestamp) {
    let duration = (new Date(timestamp) - new Date()) / 1000

    let secondsInAMinute = 60
    let secondsInAnHour  = 3600
    let secondsInADay    = 86400

    if(duration < secondsInAMinute) {
      return "just now"
    } else if(duration < secondsInAnHour) {
      let minutes = Math.floor(duration / secondsInAMinute)
      return this.pluralize(minutes, "minute ago", "minutes ago")
    } else if(duration < secondsInADay) {
      let hours = Math.floor(duration / secondsInAnHour)
      return this.pluralize(hours, "hour ago", "hours ago")
    } else {
      let days = Math.floor(duration / secondsInADay)
      return this.pluralize(days, "day ago", "days ago")
    }
  }

  pluralize(number, singular, plural) {
    if(number === 1)
      return `${number} ${singular}`
    else
      return `${number} ${plural}`
  }

  render() {
    let commentsPartial = this.comments().map((comment) => {
      return <div className="Comment" key={ comment.id }>
        <div className="Comment__author"> { comment.author } </div>
        <div className="Comment__body"> { comment.body } </div>
        <div className="Comment__timestamp"> { this.formatTimestamp(comment.createdAt) } </div>
      </div>
    })

    return <div className="Comments">
      <label>Comments</label>
      <div className="clear">
        <textarea onKeyDown={ this.handleKeyDown } ref={ (input) => this.newComment = input } />
        <button onClick={ this.createComment }>Add comment</button>
      </div>
      { commentsPartial }
    </div>
  }
}
