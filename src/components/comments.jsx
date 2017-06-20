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
        { comment.author }:
        { comment.body }
      </div>
    })

    return <div className="Comments">
      { commentsPartial }
      <input type="text" ref={ (input) => this.newComment = input } />
      <button onClick={ this.createComment }>Submit</button>
    </div>
  }
}
