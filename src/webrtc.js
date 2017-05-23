var Peers = {}
var WebRTCServers = null

var notice = (peer,desc) => (event) => console.log("notice:" + peer.id + ": " + desc, event)

function Peer(id, send_signal) {
  let self   = this

  self.id             = id
  self.handlers = { message: () => {} }

  self.on = (type,handler) => {
    self.handlers[type] = handler
  }

  self.is_connected        = is_connected

  self.send_signal      = send_signal

  self.send    = (message) => {
    console.log("Sending message",message)
    self.data_channel.send(JSON.stringify(message))
  }

  Peers[self.id] = self

  create_webrtc(self)
}

function create_webrtc(peer) {
  var webrtc = new RTCPeerConnection(WebRTCServers)

  webrtc.onicecandidate = function(event) {
    if (event.candidate) {
      peer.send_signal(event.candidate)
    }
  }

  webrtc.oniceconnectionstatechange = function(event) {
    console.log("notice:statechange",peer.id,webrtc.iceConnectionState, event)
  }

  webrtc.onconnecting   = notice(peer,"onconnecting")
  webrtc.onopen         = notice(peer,"onopen")
  webrtc.onaddstream    = notice(peer,"onaddstream")
  webrtc.onremovestream = notice(peer,"onremovestream")
  webrtc.ondatachannel  = function(event) {
    peer.data_channel = event.channel
    peer.data_channel.onmessage = msg => process_message(peer, msg)
    peer.data_channel.onerror = e => notice(peer,"datachannel error",e)
    peer.data_channel.onclose = () => notice(peer,"datachannel closed")
    peer.data_channel.onopen = () => notice(peer,"datachannel opened")
    HANDLERS.peer(peer)
  }
  peer.webrtc = webrtc
}

function is_connected() {
  let self = this;

  switch (self.webrtc.iceConnectionState) {
    case 'new':
    case 'checking':
    case 'disconnected':
    case 'failed':
      return false
    case 'connected':
    case 'completed':
      return true
    default:
      console.log("ICE STATE UNKNOWN: " + self.webrtc.iceConnectionState)
      return false
  }
}

function processHello(id, handler) {
  if (id in Peers) return
  let peer = new Peer(id,handler)

  let data = peer.webrtc.createDataChannel("datachannel",{protocol: "tcp"});
  data.onmessage = msg => process_message(peer, msg)
  data.onclose   = notice(peer,"data:onclose")
  data.onerror   = notice(peer,"data:error")
  data.onopen    = (event) => {
    peer.data_channel = data
    HANDLERS.peer(peer)
  }
  peer.webrtc.createOffer(desc => {
    peer.webrtc.setLocalDescription(desc,
      () => {
          peer.send_signal(desc)
      },
      e  => console.log("error on setLocalDescription",e))
  }, e => console.log("error with createOffer",e));
}

function processMessage(id, signal, handler) {
  let peer = Peers[id] || (new Peer(id,handler))

  var callback = function() { };
  if (signal.type == "offer") callback = function() {
    peer.webrtc.createAnswer(function(answer) {
      peer.webrtc.setLocalDescription(answer,function() {
        peer.send_signal(answer)
      },function(e) {
        console.log("Error setting setLocalDescription",e)
      })
    }, function(e) {
      console.log("Error creating answer",e)
    });
  }
  if (signal.sdp) {
    peer.webrtc.setRemoteDescription(new RTCSessionDescription(signal), callback, function(e) {
      console.log("Error setRemoteDescription",e)
    })
  } else if (signal.candidate) {
    peer.webrtc.addIceCandidate(new RTCIceCandidate(signal));
  }
}

function join(signaler, handler) {
  signaler.on('hello', processHello)
  signaler.on('offer', processMessage)
  signaler.on('reply', processMessage)
  signaler.on('error', (message,e) => {
    console.log("ERROR-MESSAGE",message)
    console.log("ERROR",e)
  })
  signaler.start()
}

function process_message(peer, msg) {
  console.log("INCOMING MSG",msg)
  console.log("data size",msg.data.length)
  let message = JSON.parse(msg.data)
  peer.handlers.message(message)
  HANDLERS.message(peer,message)
}

function noHandler(type) {
  return () => {
    console.log("no event handler declared for message type",type)
  }
}

let HANDLERS = {message: noHandler("message"), peer: noHandler("message")  }

function onHandler(type, handler) {
  HANDLERS[type] = handler
}

module.exports = {
  join:      join,
  on:        onHandler
}
