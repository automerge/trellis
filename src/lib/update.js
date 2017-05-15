const log  = require("electron-log")

const update = ({ updater, dialog }) => {
  let platform = "osx"
  let version  = require("../../package.json").version

  updater.logger = log
  updater.logger.transports.file.level = 'info'

  updater.setFeedURL('http://trellis-releases.herokuapp.com/update/' + platform + '/' + version)

  // Wait a second for the window to exist before checking for updates.
  setTimeout(function() {
    updater.checkForUpdates()
  }, 1000)

  updater.on('checking-for-update', () => {
    log.info('Checking for update...')
  })

  updater.on('update-available', (ev, info) => {
    log.info('Update available.')
  })

  updater.on('update-not-available', (ev, info) => {
    log.info('Update not available.')
  })

  updater.on('error', (ev, err) => {
    log.info('Error in auto-updater.')
    log.info(ev)
    log.info(err)
  })

  updater.on('update-downloaded', (ev, info) => {
    log.info('Update downloaded.')

    let options = {
      type: "question",
      title: "Install Update?",
      message: "There is an update available. Would you like to install it?",
      buttons: ["Install Update", "Cancel"],
      defaultId: 0,
      cancelId: 1
    }

    dialog.showMessageBox(options, (response) => {
      if(response === 0) {
        log.info("Installing update.")
        updater.quitAndInstall()
      } else {
        log.info("Update cancelled.")
      }
    })
  })
}


export { update }
export default update
