# Trellis

Trellis is a [Trello](https://trello.com/) clone built as an Electron desktop application. We built Trellis to demo [MPL](https://github.com/automerge/mpl), a distributed persistence library that allows developers to build collaborative applications that are realtime, offline, and network partition tolerant. 

![screenshot](https://raw.githubusercontent.com/automerge/trellis/master/screenshot.png)

## Motivation

Our motivation to build Trellis was to create an application that would demonstrate the unique features of MPL. We chose to build a Trello clone as our demo application due to Trello's popularity as a web-based project management tool, its highly collaboritive design, and its "dogfooding" usefulness so that we could use Trellis as we're building it.

Like most modern web applications, the original Trello relies on a stable Internet connection in order to function. With MPL, we can extend Trello's functionality to work offline, collaboritively with peers over a local network, and with synchronization so that peers coming back online can merge their changes with other peers using automatically merging data structures.

## Features

In addition to the basic features of Trello, Trellis includes:

- **Offline Mode**: Trellis is a desktop application and works offline with no network connection. Your changes will be saved locally and sync automatically when you re-establish an Internet connection.
- **Realtime Collaboration**: When online, Trellis will sync changes between peers in realtime.
- **Automatically Merging Synchronization**: Trellis uses MPL for data persistence, which uses automatically merging data structures for synchronization.
- **Network Partitions**: If you are disconnected from the Internet but share a local network with a peer, you can continue to collaborate in realtime with peers on the same network.

## Conclusions

We designed Trellis as an experiment to test and demonstrate the functionality of MPL, a distributed persistence library built on top of Conflict-free Replicated Data Types (CRDTs). Our goal was to assess CRDTs to see whether these data structures, which can be automatically merged, also work well in practice. We expected there may be several issues with using CRDTs in practice, such as CRDTs becoming unperformant at even small scales, or that the developer experience might be too difficult for the typical app developer unfamiliar with CRDTs.

To our surprise, MPL was reasonably performant at our scale and we were able to design a developer interface that is intuitive, familiar to developers using modern frontend libraries, and does not require developers to understand or interface with CRDTs. The end-user experience was also impressively free of data corruption: as long as data updates are done with as small of a "granularity" as possible there are very few instance of data merging in unexpected ways and users always converged to the same application state. The remaining challenges at the conclusion of this project were mostly in building a robust and decentralized networking layer for CRDT synchronization.

## Setup 

You can download the latest version of Trellis for Mac OSX here: https://github.com/automerge/trellis/releases

To test peer synchronization, make a copy of your Trellis.app and start both clients. You should see both peers in the Network panel of both clients. If you now open the same document in both clients, you'll be able to see the edits from one synchronize to the other in realtime.

## Development

To install all of the app dependencies, run:

    $ npm install -g electron-forge
    $ npm install

To start the app:

    $ npm start

To run tests:

    $ npm run test

## Distribution

To create a packaged ".app" on Mac OSX:

    $ npm run package

The command will create a `trellis.app` package located in the `out/trellis-darwin-x64` directory:

    $ open out/trellis-darwin-x64/trellis.app

