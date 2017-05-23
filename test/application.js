const Application = require('spectron').Application
const assert      = require('assert')
const fs          = require('fs')

describe('application', function () {
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

  it('opens a new document', function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((cardTitle) => {
      assert.equal(cardTitle, "Hello world")
    })
  })

  it('opens a .trellis document', function() {
    let fixturePath = "./test/fixture.trellis"

    return this.app.webContents.send("open", fixturePath)
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((cardTitles) => {
      assert.deepEqual(cardTitles.splice(0, 3), [
        "Trellis MVP core featureset",
        "Team Summit",
        "Omniview design sketch"
      ])
    })

    .then(() => this.app.client.getText(".List__title"))
    .then((listTitles) => {
      assert.deepEqual(listTitles.splice(0,5), [
        "THIS WEEK",
        "DONE",
        "SOON",
        "LATER",
        "MILESTONE BLOCKERS"
      ])
    })
  })

  it("creates a new card", function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.click(".AddCard__link:nth-child(1)"))
    .then(() => this.app.client.setValue(".List:nth-child(1) .AddCard:nth-child(3) textarea", "Another Card"))
    .then(() => this.app.client.click(".List:nth-child(1) .AddCard:nth-child(3) button"))
    .then(() => this.app.client.getText(".List:nth-child(1) .ListCard:nth-child(3) .ListCard__title"))
    .then((title) => {
      assert.equal(title, "Another Card")
    })
  })

  it.skip("drags and drops", function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.getText(".ListCard"))
    .then((title) => {
      assert.equal(title, "DONE")
    })
    .then(() => this.app.client.dragAndDrop(".ListCard:nth-child(2)", ".List:nth-child(2)"))
    .then(() => this.app.client.getText(".List:nth-child(2) .ListCard__title"))
    .then((cardTitle) => {
      assert.equal(cardTitle, "Hello world")
    })
    .then(this.app.browserWindow.capturePage)
    .then((imageBuffer) => {
      fs.writeFileSync("./page.png", imageBuffer)
    })
  })
})
