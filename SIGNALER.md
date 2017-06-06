

## to be a compatible signaler you need to emit the following events 
```
  signaler.session // the unique id of this actor/session/peer
  signaler.name // the human readable name of this actor/session/peer

  // meta needs to contain {session:"abc123", name:"pvh", action:"hello"}
  // signal is the offer or reply signal sent
  // handler = a function to call to send a signal back the sender
  // hello -> handler(offer)
  // offer -> handler(reply) ...

  signaler.on('hello', function(meta, null,   handler) { })
  signaler.on('offer', function(meta, signal, handler) { })
  signaler.on('reply', function(meta, signal, null) { })
  signaler.on('error', (message,err) => { })

  // when the signaler connects or disconnects from its service 
  // used to show ones self as green or yellow on the peers pane

  signaler.on('connect', () => {})
  signaler.on('disconnect', () => {})

  // being signalling
  signaler.start()
```
