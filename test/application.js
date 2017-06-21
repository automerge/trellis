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

  it.skip('opens the previously opened document', function() {
    let fixturePath = "./test/fixture.trellis"

    return this.app.webContents.send("open", [fixturePath])
    .then(() => this.app.restart())
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((cardTitles) => {
      assert.deepEqual(cardTitles.splice(0, 3), [
        "Trellis MVP Core featureset",
        "Team Summit",
        "Omniview design sketch"
      ])
    })
  })

  it.skip('merges documents', function() {
    let forkAPath = "./test/merge-fork-a-copy.trellis"
    let forkBPath = "./test/merge-fork-b-copy.trellis"

    // copy fixtures into tmp dir so we don't overwrite them
    fs.createReadStream("./test/merge-fork-a.trellis").pipe(fs.createWriteStream(forkAPath))
    fs.createReadStream("./test/merge-fork-b.trellis").pipe(fs.createWriteStream(forkBPath))

    return this.app.webContents.send("open", [ forkAPath ])
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((cardTitles) => {
      assert.equal(cardTitles[1], "Card A")
    })
    .then(() => this.app.webContents.send("merge", [ forkBPath]))
    .then(() => {
    })
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((cardTitles) => {
      assert.equal(cardTitles[2], "Card B")
    })
    .then(() => {
      fs.unlinkSync(forkAPath)
      fs.unlinkSync(forkBPath)
    })
  })

  it.skip('opens a .trellis document', function() {
    let fixturePath = "./test/fixture.trellis"

    return this.app.webContents.send("open", [fixturePath])
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((cardTitles) => {
      assert.deepEqual(cardTitles.splice(0, 3), [
        "Trellis MVP Core featureset",
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

  it("edits card titles", function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.click(".ListCard__title"))
    .then(() => this.app.client.click(".Modal .InlineInput div"))
    .then(() => this.app.client.setValue(".InlineInput textarea", "New Title"))
    .then(() => this.app.client.keys(["Enter"]))
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((title) => assert.equal(title, "New Title") )
  })

  it("cancels edits on card titles", function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.click(".ListCard__title"))
    .then(() => this.app.client.click(".Modal .InlineInput div"))
    .then(() => this.app.client.setValue(".InlineInput textarea", "New Title"))
    .then(() => this.app.client.keys("Esc"))
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((title) => assert.equal(title, "Hello world") )
  })

  it("creates a new card", function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.click(".AddCard__link"))
    .then(() => this.app.client.setValue(".AddCard textarea", "Another Card"))
    .then(() => this.app.client.click(".AddCard button"))
    .then(() => this.app.client.getText(".ListCard__title"))
    .then((titles) => {
      assert.equal(titles[1], "Another Card")
    })
  })

  it("creates a new list", function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.click(".AddList__show"))
    .then(() => this.app.client.setValue(".AddList input[type='text']", "Another List"))
    .then(() => this.app.client.click(".AddList .AddList__save"))
    .then(() => this.app.client.getText(".List__title"))
    .then((titles) => {
      assert.equal(titles[3], "ANOTHER LIST")
    })
  })

  it("deletes a list", function() {
    return this.app.webContents.send("new")
    .then(() => this.app.client.getText(".List__title"))
    .then((titles) => {
      assert.deepEqual(titles, ["THIS WEEK", "DONE", "SOON"])
    })
    .then(() => this.app.client.click(".List:nth-child(1) .List__delete"))
    .then(() => this.app.client.getText(".List__title"))
    .then((titles) => {
      assert.deepEqual(titles, ["DONE", "SOON"])
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
