const Application = require('spectron').Application
const assert      = require('assert')

describe('file menu', function () {
  this.timeout(10000)

  beforeEach(function () {
    this.app = new Application({
      path: './node_modules/.bin/electron',
      args: ['.']
    })

    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('opens a new document', function () {
    return this.app.webContents.send("new")
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((cardTitles) => {
      assert.equal(cardTitles[0], "Hello world")
    })
  })
})
