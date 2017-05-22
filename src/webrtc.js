var Peers = {}
var URL
var WebRTCServers = null
var SessionID = ""
var Depart

var now    = () => Math.round(Date.now() / 1000)
var age    = (t) => now() - t
var notice = (peer,desc) => (event) => console.log("notice:" + peer.id + ": " + desc, event)

function create_webrtc(peer) {
  var self = this
  var webrtc = new RTCPeerConnection(WebRTCServers)

  webrtc.onicecandidate = function(event) {
    if (event.candidate) {
      self.send_signal(event.candidate)
    }
  }

  webrtc.oniceconnectionstatechange = function(event) {
    console.log("notice:statechange",self.id,webrtc.iceConnectionState, event)
    self.update_state()
  }

  webrtc.onconnecting   = notice(self,"onconnecting")
  webrtc.onopen         = notice(self,"onopen")
  webrtc.onaddstream    = notice(self,"onaddstream")
  webrtc.onremovestream = notice(self,"onremovestream")
  webrtc.ondatachannel  = function(event) {
    console.log("new data channel") // receiver sees this!
    self.data_channel = event.channel
    self.data_channel.onmessage = msg => self.process_usergram(JSON.parse(msg.data))
    self.update_state()
    Exports.ondatachannel(peer)
  }
  self.webrtc = webrtc
}

/*
function set_session(s) {
  let self = this;
  self.session_record = s
  self.update_state()
}
*/

function is_webrtc_connected() {
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


function is_connected() {
  let self = this
//  console.log("checking ",self.id, " last=", self.last_connected, " web=", self.is_webrtc_connected(), " serv=", self.is_server_connected())
  return self.is_webrtc_connected()
}

function update_state() {
  let self = this
  let connected = self.is_connected()
  if (self.last_connected && !connected) {
    // disconnected
    self.last_connected = false
    Exports.onarrive(self)
  } else if (!self.last_connected && connected) {
    // connected
    self.last_connected = true
    Exports.ondepart(self)
  }
/*
  if (self.last_user != self.session_record.user) {
    self.last_user = self.session_record.user
    self.last_user_obj = parse(self.session_record.user)
    //Exports.onupdate(self)
    //Exports.onupdate("something updated ?") // FIXME
  }
  if (self.last_state != self.session_record.state) {
    self.last_state = self.session_record.state
    self.last_state_obj = parse(self.session_record.state)
    //Exports.onupdate(self)
    //Exports.onupdate("something else updated ?") // FIXME
  }
*/
}

function send(obj) {
  console.log("SEND");
  let self = this
  let result = ""
  try {
    if (self.data_channel) {
      self.data_channel.send(JSON.stringify(obj))
      result = "sent_by_data_channel";
    } else {
      self.send_usergram(obj)
      result = "sent_through_server";
    }
  } catch(e) {
    console.log("Error sending data - deleting data channel",e)
    delete self.data_channel

    self.send_usergram(obj)
    result = "sent_through_server";
  }
  console.log("SEND2",result);
  return result;
}

//  Terminology
//  message => [ signal || usergram ]

function process(messages) {
  let self = this
  messages.forEach((messageJSON) => {
    var message = JSON.parse(messageJSON)
    if (message.type == "signal") {
      self.process_signal(message.payload)
    } else if (message.type == "usergram") {
      self.process_usergram(message.payload)
    }
  })
}

function process_signal(signal) {
  console.log("SIGNAL",signal)
  let self = this
  var callback = function() { };
  if (signal.type == "offer") callback = function() {
    self.state = "answering"
    self.webrtc.createAnswer(function(answer) {
      self.state = "answering-setlocal"
      self.webrtc.setLocalDescription(answer,function() {
        self.send_signal(answer)
      },function(e) {
        console.log("Error setting setLocalDescription",e)
      })
    }, function(e) {
      console.log("Error creating answer",e)
    });
  }
  if (signal.sdp) {
    self.webrtc.setRemoteDescription(new RTCSessionDescription(signal), callback, function(e) {
      console.log("Error setRemoteDescription",e)
    })
  } else if (signal.candidate) {
    self.webrtc.addIceCandidate(new RTCIceCandidate(signal));
  }
}

function offer() {
  let self = this;
  let data = self.webrtc.createDataChannel("datachannel",{reliable: false});
  data.onmessage = msg => self.process_usergram(JSON.parse(msg.data))
  data.onclose   = notice(self,"data:onclose")
  data.onerror   = notice(self,"data:error")
  data.onopen    = (event) => {
    self.data_channel = data
    self.update_state()
    Exports.ondatachannel(self)
  }
  self.webrtc.createOffer(desc => {
    self.webrtc.setLocalDescription(desc,
      () => {
          self.send_signal(desc)
      },
      e  => console.log("error on setLocalDescription",e))
  }, e => console.log("error with createOffer",e));
}

function Peer(id, send_signal) {
  let self   = this

  self.id             = id
  self.state          = "new"
//  self.session_record = session
  self.last_connected = false
  self.last_user_obj  = {}
  self.last_state_obj = {}

  self.is_webrtc_connected = is_webrtc_connected
  self.is_connected        = is_connected

  self.create_webrtc   = create_webrtc
  self.update_state    = update_state
//  self.set_session     = set_session

  self.process_signal   = process_signal
  self.process_usergram = process_usergram
//  self.send_usergram    = send_usergram
  self.send_signal      = send_signal

  self.process = process
  self.offer   = offer
  self.send    = send

  Peers[self.id] = self

  self.create_webrtc(self)
  self.update_state()
}

function process_usergram(usergram) {
  let self = this
  Exports.onusergram(self.id, usergram)
}

function broadcast(usergram) {
  for (let key in Peers) {
    let p = Peers[key]
    if (p.last_connected) p.send(usergram)
  }
}

/*
function send_signal(payload) {
  console.log("SEND-SIGNAL",payload)
  let self = this
  post_message(self.id, { type: "signal", payload: payload } )
}

function send_usergram(payload) {
  let self = this
  post_message(self.id, { type: "usergram", payload: payload } )
}
*/

function post_message(target, message) {
    post({ to: target, session_id: SessionID, message: JSON.stringify(message) })
}

function post(payload) {
  $.ajax(URL, {
    method: "post",
    dataType: "json",
    data: payload,
    success: function(data) {
    },
    error: function(e) {
      console.log("Fail to POST",URL,e)
    }
  });
}

function put(payload) {
  $.ajax(URL, {
    method: "put",
    dataType: "json",
    data: payload,
    success: function(data) {
    },
    error: function(e) {
      console.log("Fail to PUT",URL,e)
    }
  });
}

function evict(id) {
  var peer = Peers[id]
  delete Peers[id]
  Exports.ondepart(peer)
}

function reset_state() {
  if (Peers) {
    for (let id in Peer) {
      evict(id)
    }
  }
  Peers = {}
  SessionID = ""
//  Exports.user = {}
//  Exports.state = {}
}

function parse(data) {
  try {
    return JSON.parse(data)
  } catch(e) {
    console.log("Error parsing",data)
    return {}
  }
}

/*
function process_session_data_from_server(data, handler) {
  if (SessionID != data.session_id) {
    reset_state()
    SessionID = data.session_id
    Exports.id = SessionID;
  }

//  Exports.user = parse(data.user)

  if (handler) handler()

  data.updates.forEach((s) => {
    let peer = Peers[s.session_id] || new Peer(s)
    if (peer.senior === undefined) peer.senior = true
    peer.set_session(s)
  })

  data.arrivals.forEach((s) => {
    let peer = new Peer(s)
    peer.senior = false
    peer.offer()
  })

  for (let from in data.messages) {
    if (Peers[from]) Peers[from].process(data.messages[from])
  }

  peer_change();
}
*/

/*
function get(handler) {
  $.ajax(URL + "?session=" + encodeURIComponent(SessionID), {
    contentType: "application/json; charset=UTF-8",
    method:      "get",
    dataType:    "json",
    success:     (data) => {
      process_session_data_from_server(data, handler)
      if (ServerError) {
        // console.log("Connected - clearing timer")
        ServerError = undefined
        clearTimeout(ServerErrorHandler)
      }
      get()
    },
    error:       (e) => {
      console.log("Fail to get",URL,e)
      if (!ServerError) {
        ServerError = Date.now() + 5000
        ServerErrorHandler = setTimeout(update_peer_state,5001)
      }
      setTimeout(get,1000)
    },
  });
}
*/

// USER = 1E52AA
/*
function peers() { // CAUTION
  var peers = [ { session: SessionID, state: Exports.state, user: Exports.user, connected: true, senior: false, self: true }]
  for (let id in Peers) {
    let p = Peers[id]
    if (p.last_connected) {
      peers.push({session:id, state: p.last_state_obj, user: p.last_user_obj, connected: p.data_channel != undefined, senior: p.senior, self: false })
    }
  }
  return peers
}
*/

function peer_change() {
  console.log("Rebuilding peers list")
  Exports.peers = []
  for (var k in Peers) {
    let p = Peers[k]
    Exports.peers.push({ session: p.id, connected: p.data_channel != undefined, send: (obj) => { return p.send(obj) }}) 
  }
}

function update_peer_state() {
  for (var k in Peers) {
    Peers[k].update_state()
  }
  peer_change();
}

function onHello(id, handler) {
  console.log("ON HELLO", id)
  if (id in Peers) return
  let peer = new Peer(id,handler)
  console.log("---- MAKE OFFER -----")
  peer.offer()
}

function onOffer(id, offer, handler) {
  let peer = Peers[id] || (new Peer(id,handler))
  console.log("---- ON OFFER -----", id, peer)
  peer.process_signal(offer)
}

function onReply(id, reply) {
  let peer = Peers[id]
  console.log("---- ON REPLY -----", id, peer)
  peer.process_signal(reply)
}

function join(signaler, handler) {
  reset_state()
  signaler.on('hello', onHello)
  signaler.on('offer', onOffer)
  signaler.on('reply', onReply)
  signaler.on('error', (message,e) => {
    console.log("ERROR-MESSAGE",message)
    console.log("ERROR",e)
  })
  signaler.start()
}

var Exports = {
  join:          join,
  peers:         [],
  broadcast:     broadcast,
  onarrive:      () => {},
  ondepart:      () => {},
  onusergram:    () => {},
  ondatachannel: () => {},
}

module.exports = Exports
