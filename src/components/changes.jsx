import React from 'react'

export default class Changes extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="Changes">
      <h2>Changes</h2>
      <ul>
        <li>Roshan created card "Team Summit"</li>
        <li>Roshan updated card "Team Summit" assignments</li>
        <li>Adam created card "Omniview Design"</li> 
        <li>Adam updated card "Omniview Design" listId</li> 
      </ul>
    </div>
  }
}
