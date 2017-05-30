# Trellis

## Development

To install all of the app dependencies, run:

    $ npm install -g electron-forge
    $ npm install

You'll need to prepare an environment. Make a .env file, then add the following:

```
SLACK_BOT_TOKEN="put a slackbot token here, remember to invite the bot to #signals"
NAME="Your Name and Machine Name Here"
```

To start the app:

    $ npm update
    $ npm start

To run tests:

    $ npm run test

## Using Trellis

To join someone else's document, get a copy from them, then open it. You should see signals appearing in #signals and then peers should be listed in the peers pane. 

## Distribution

To create a packaged ".app" on Mac OSX:

    $ npm run package

The command will create a `trellis.app` package located in the `out/trellis-darwin-x64` directory:

    $ open out/trellis-darwin-x64/trellis.app

