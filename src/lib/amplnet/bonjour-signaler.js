let bonjour = require('bonjour')()
let express = require('express')
let bodyParser = require('body-parser')
let request = require('request')

var UUID = (function() {
  var self = {};
  var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
  self.generate = function() {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
  }
  return self;
})();

// TODO: start()/stop()

function init(config) {
  let HANDLERS = { hello: () => {}, reply: () => {}, offer: () => {}, error: () => {}, connect: () => {}, disconnect: () => {} }

  let SESSION = config.session || UUID.generate()
  let NAME = config.name || "unknown"
  let DOC_ID = config.doc_id;

  let PORT = 3000 + Math.floor(Math.random() * 1000);
  
  let noticedSessions = {}

  function prepareSignalServer() {
    var app = express();
    app.use(bodyParser.json());
    app.post('/', hearOffer);
    app.listen(PORT);
  }

  function initializeBonjour() {
    let browser = bonjour.find({ type: 'ampl' }, 
      (service) => {
        console.log("Detected a new service. (This should be once per service.)")
        console.log(service)
        let meta = service.txt
        if (meta.session == SESSION) {
          console.log("The service we found was our own all along...")
          return
        }
        if (meta.docid != DOC_ID) {
          console.log("Heard folks talking about "+meta.docId+" but we only want to talk about " + DOC_ID+".")
          return
        }
        hearHello(service)
    })
    
    // text is encoded into a k/v object by bonjour
    // bonjour downcases keynames.
    let text = {session:SESSION, name: NAME, docid: DOC_ID}
    console.log("text is :", text)
    bonjour.publish({ name: 'ampl-'+SESSION, type: 'ampl', port: PORT, txt: text })
  }

  // initiated by .start()
  function sendHello() {
    console.log("sendHello()")
    prepareSignalServer();
    initializeBonjour();
  }

  // initiated by comes from bonjour `find()`.
  function hearHello(service) {
    console.log("hearHello()")
    let meta = {name: service.txt.name, session: service.txt.session, action: 'hello'}
    HANDLERS['hello'](meta, undefined, (offer) => sendOffer(service, offer))
  }

  // initiated by hearHello()
  function sendOffer(service, offer) {
    console.log("sendOffer()", service, offer)
    let msg = {name: NAME, session: SESSION, action: 'offer'}
    msg.body = offer;

    let opts = {method: 'POST', 
      url: "http://"+service.host+":"+service.port+"/", 
      json: msg};
    console.log("Sending post request to peer server:", opts)
    request(opts,
        (error ,response, body) => {
          if (error) {
            // We should probably be smarter about this.
            console.log(error)
            return;
          }

          console.log("Reply received: ")
          console.log(body)
          hearReply(body)
    })
  }

  // express calls this in response to a post on "/"
  function hearOffer(req, res) {
    console.log("hearOffer:", req, res)
    let meta = {name: req.body.name, session: req.body.session, action: 'offer'}
    HANDLERS['offer'](meta, req.body.body, (reply) => {
      let msg = {name: NAME, session: SESSION, body: reply, action: 'reply'}
      sendReply(res, msg)
    })
  }

  // this gets sent over the wire by express.
  function sendReply(res, reply) {
    console.log("sendReply()", res, reply)
    res.set("Connection", "close");
    res.json(reply)
  }

  // request receives this in response to the above.
  function hearReply(reply) {
    console.log("hearReply()", reply)
    HANDLERS['reply'](reply, reply.body, null)
  }

  return {
    session: SESSION,
    name: NAME,
    on: (type,handler) => { HANDLERS[type] = handler },
    start: () => { sendHello() },
    stop: () => {
      HANDLERS['disconnect']()
    }
  }
}

module.exports = {
  init
}
