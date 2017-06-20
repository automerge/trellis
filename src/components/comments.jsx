import React from 'react'

export default class Comment extends React.Component {
  constructor() {
    super()
    this.createComment = this.createComment.bind(this)
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

  render() {
    let commentsPartial = this.comments().map((comment) => {
      return <div className="Comment" key={ comment.id }>
        <div className="Comment__author"> { comment.author } </div>
        <div className="Comment__body"> { comment.body } </div>
        <div className="Comment__timestamp"> { comment.createdAt } </div>
      </div>
    })

    return <div className="Comments">
      <label>Comments</label>
      <div className="clear">
        <textarea ref={ (input) => this.newComment = input } />
        <button onClick={ this.createComment }>Add comment</button>
      </div>
      { commentsPartial }
    </div>
  }
}
