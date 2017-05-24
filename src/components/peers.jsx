import React from 'react'

export default class Peers extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="Peers">
      <h2>Peers <img src="assets/images/peers.svg" /></h2>
      <table>
        <tbody>
          <tr>
            <td className="LED"><img src="assets/images/LED-green.svg" /></td>
            <td className="user">Adam</td>
            <td className="device">iMac</td>
            <td className="ip">204.1.73.21</td>
            <td className="lastChange">3 seconds ago</td>
          </tr>
          <tr>
            <td className="LED"><img src="assets/images/LED-yellow.svg" /></td>
            <td className="user">Adam</td>
            <td className="device">Surface</td>
            <td className="ip">204.1.73.9</td>
            <td className="lastChange">20 minutes ago</td>
          </tr>
        </tbody>
      </table>

      <div className="docID">
        <span className="label">DocID</span>
        <span className="ID">63fa5277-8012-4ba1-a70f-407a5a45bea9</span>
      </div>
    </div>
  }
}
