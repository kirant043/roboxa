"use strict";
var socket;
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var call_start_date_time = Date();
var call_end_date_time = Date();
var call_type = "";
var callrcvdar = [];
var uniqcallid = "";
var isShredoc = "0";
var isShreevidence = "0";
var calltimercheck = "0";
var pcConfig = {
  iceServers: [
    {
      urls: "stun:stun:s3.xirsys.com",
    },
  ],
};

var callerbusy = false;

var serverconfig = {
  // Uses Google's STUN server
  sdpSemantics: "unified-plan",
  iceServers: [
    {
      urls: "stun:s3.xirsys.com",
    },
    {
      urls: [
        "turn:s3.xirsys.com:80?transport=udp",
        "turn:s3.xirsys.com:3478?transport=udp",
        "turn:s3.xirsys.com:80?transport=tcp",
        "turn:s3.xirsys.com:3478?transport=tcp",
      ],
      username: "52924132-59a0-11e8-b2c1-4ba290c8c0a3",
      credential: "529241e6-59a0-11e8-a048-17ad96ba1721",
    },
  ],
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

/////////////////////////////////////////////

// could prompt for room name:
// room = prompt('enter room name:');

socket = io.connect(chatServerUrl, {
  transports: ["websocket"],
  upgrade: false,
});

socket.on("connect", function () {
  console.log(socket, chatServerUrl, "connected to socket.io");
  // var ResToSetUserId = {
  //     'user_id': getCookie("user_id")
  // };
  // socket.emit('setUserId', ResToSetUserId);
  console.log("emitting getonline users");
  socket.emit("GetOnlineUsers");

  if (callerbusy) {
    var roomidd = {
      roomid: calleridfordocsave + getCookie("user_id"),
    };

    var argcallonline = {
      u_id: getCookie("user_id"),
      o_id: calleridfordocsave,
    };
    socket.emit("usergoonlineoncall", argcallonline);
    socket.emit("rejoinroom", roomidd);
  }
});

socket.on("userLoggedIn", function () {
  console.log("Connected User is Valid");
});
socket.on("usergoonlineoncall", function () {
  if (callerbusy) {
    $("#reconnectvideocall").attr("style", "");
  }
});
socket.on("usergoofflineoncall", function () {
  if (callerbusy) {
    $("#reconnectvideocall").attr("style", "");
    $("#reconnectvideocall").attr(
      "style",
      "background: url('images/reconnecting_user.gif');"
    );
    setTimeout(function () {
      var forroom = {
        room: calleridfordocsave,
        message: "bye",
      };

      // console.log('Client  ', forroom);
      socket.emit("message", forroom);
      clearTime();
      callerbusy = false;
      isInitiator = false;
      isStarted = false;
      isChannelReady = false;
      pc.close();

      $("#screenshotvideocanvas").hide();
      $("#screenshotvideo").hide();
      $("#allbuttonvideo").hide();
      $("#localVideo").hide();
      $("#remoteVideo").hide();
      $("#vZoomScrollNav").hide();
      $("#video-data").hide();
      $("#caldivshow").hide();
      var request = JSON.stringify({
        user_id: getCookie("user_id"),
        other_user_id: calleridfordocsave,
      });
      var leaveRoom = {
        room: calleridfordocsave + getCookie("user_id"),
      };

      socket.emit("leaveGroup", leaveRoom);

      // stop call recording
      if (isCallRecording) {
        $("#recordCallToggle").parent().click();
      }

      stopcalllpeer();

      call_end_date_time = Date();
      var startDate = call_start_date_time.toString();
      var endDate = call_end_date_time.toString();

      var CallData2 = "";
      if (call_type == "incoming") {
        console.log(callrcvdar.name);
        CallData2 = {
          user_id: calleridfordocsave,
          other_user_id: getCookie("user_id"),
          full_name: callrcvdar.name,
          glass_id: callrcvdar.glass_id,
          location: callrcvdar.location,
          callid: uniqcallid,
        };
      } else {
        console.log("callrcvdar.name");
        CallData2 = {
          user_id: getCookie("user_id"),
          other_user_id: calleridfordocsave,
          full_name: globalcalldata.name,
          glass_id: globalcalldata.glass_id,
          location: globalcalldata.location,
          callid: uniqcallid,
        };
      }
      $("#reconnectvideocall").attr("style", "");

      FnSaveCallDetail(startDate, endDate, call_type, CallData2);
      FnGetReciveCalls();

      localStream.getAudioTracks()[0].stop();
      localStream.getVideoTracks()[0].stop();
      localstaream = "";
      remoteStream = "";
      remoteVideo.srcObject = null;
    }, 20000);
  }
});

socket.on("disconnect", function () {
  for (var i = 0; i < workerListIds.length; i++) {
    $("#" + workerListIds[i]).attr("disabled", "disabled");
  }

  if (callerbusy) {
    $("#reconnectvideocall").attr("style", "");
    $("#reconnectvideocall").attr(
      "style",
      "background: url('images/reconnecting_user.gif');"
    );
    setTimeout(function () {
      var forroom = {
        room: calleridfordocsave,
        message: "bye",
      };

      // console.log('Client  ', forroom);
      socket.emit("message", forroom);
      clearTime();
      callerbusy = false;
      isInitiator = false;
      isStarted = false;
      isChannelReady = false;
      pc.close();

      $("#screenshotvideocanvas").hide();
      $("#screenshotvideo").hide();
      $("#allbuttonvideo").hide();
      $("#localVideo").hide();
      $("#remoteVideo").hide();
      $("#vZoomScrollNav").hide();
      $("#video-data").hide();
      $("#caldivshow").hide();
      var request = JSON.stringify({
        user_id: getCookie("user_id"),
        other_user_id: calleridfordocsave,
      });
      var leaveRoom = {
        room: calleridfordocsave + getCookie("user_id"),
      };

      socket.emit("leaveGroup", leaveRoom);

      // stop call recording
      if (isCallRecording) {
        $("#recordCallToggle").parent().click();
      }

      stopcalllpeer();

      call_end_date_time = Date();
      var startDate = call_start_date_time.toString();
      var endDate = call_end_date_time.toString();

      var CallData2 = "";
      if (call_type == "incoming") {
        console.log(callrcvdar.name);
        CallData2 = {
          user_id: calleridfordocsave,
          other_user_id: getCookie("user_id"),
          full_name: callrcvdar.name,
          glass_id: callrcvdar.glass_id,
          location: callrcvdar.location,
          callid: uniqcallid,
        };
      } else {
        console.log("callrcvdar.name");
        CallData2 = {
          user_id: getCookie("user_id"),
          other_user_id: calleridfordocsave,
          full_name: globalcalldata.name,
          glass_id: globalcalldata.glass_id,
          location: globalcalldata.location,
          callid: uniqcallid,
        };
      }
      $("#reconnectvideocall").attr("style", "");

      FnSaveCallDetail(startDate, endDate, call_type, CallData2);
      FnGetReciveCalls();

      localStream.getAudioTracks()[0].stop();
      localStream.getVideoTracks()[0].stop();
      localstaream = "";
      remoteStream = "";
      remoteVideo.srcObject = null;
    }, 20000);
  }
});

var localVideo = document.querySelector("#localVideo");
var remoteVideo = document.querySelector("#remoteVideo");

//  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function getUserMedia() {
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      //video:false
      video: { width: 640, height: 360 },
    })
    .then(gotStream)
    .catch(function (e) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(gotStream2)
        .catch(function (e) {
          setTimeout(function () {
            localVideo.srcObject = whiteNoise();
            localStream = whiteNoise();
            console.log("catch got user media");
            sendMessage("got user media");
            console.log("isInitiator", isInitiator);
            if (isInitiator) {
              console.log("Adding local stream.");
              maybeStart();
            }
          }, 1500);
        });
    });
}

function whiteNoise() {
  var canvasasdsadsad = document.querySelector("#canvasdsdsdsds");
  let ctx = canvasasdsadsad.getContext("2d");
  ctx.fillRect(0, 0, canvasasdsadsad.width, canvasasdsadsad.height);
  let p = ctx.getImageData(0, 0, canvasasdsadsad.width, canvasasdsadsad.height);
  requestAnimationFrame(function draw() {
    for (var i = 0; i < p.data.length; i++) {
      p.data[i++] = p.data[i++] = p.data[i++] = Math.random() * 255;
    }
    ctx.putImageData(p, 0, 0);
    requestAnimationFrame(draw);
  });
  return canvasasdsadsad.captureStream(60);
}

function gotStream(stream) {
  console.log(stream);
  localStream = stream;
  localVideo.srcObject = stream;
  if (localStream.getVideoTracks().length == 0) {
    whiteNoise()
      .getTracks()
      .forEach((track) => localStream.addTrack(track, stream));
  }
  console.log("gotStream got user media");
  sendMessage("got user media");
  console.log("isInitiator", isInitiator);
  if (isInitiator) {
    console.log("Adding local stream.");
    maybeStart();
  }
}
function gotStream2(stream) {
  localStream = stream;
  localVideo.srcObject = stream;
  if (localStream.getVideoTracks().length == 0) {
    whiteNoise()
      .getTracks()
      .forEach((track) => localStream.addTrack(track, stream));
  }
  console.log("gotStream2 got user media");
  sendMessage("got user media");
  console.log("isInitiator", isInitiator);
  if (isInitiator) {
    console.log("Adding local stream.");
    maybeStart();
  }
}

// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

// function getUserMedia() {
//     navigator.mediaDevices.getUserMedia({
//             audio: true,
//             video: {
//                 width: 640,
//                 height: 360
//             }
//         })
//         .then(gotStream)
//         .catch(function (e) {
//             alert('getUserMedia() error: ' + e.name);
//         });

// }

// function gotStream(stream) {

//     localStream = stream;
//     localVideo.srcObject = stream;
//     sendMessage('got user media');
//     if (isInitiator) {
//         console.log('Adding local stream.');
//         maybeStart();
//     }
// }

// variable for holding user_id of other end of caller/receiver
let oncallwith;

function createOrJoin(user_id, other_user_id) {
  // added global holder for other user id
  oncallwith = other_user_id;

  var room = other_user_id + user_id;
  if (room !== "") {
    socket.emit("create or join", room);
    console.log("Attempted to create or  join room", room);
  }

  socket.on("created", function (room) {
    console.log("Created room " + room);
    isInitiator = true;
    isChannelReady = true;
    getUserMedia();
  });

  socket.on("full", function (room) {
    console.log("Room " + room + " is full");
  });

  socket.on("join", function (room) {
    console.log("Another peer made a request to join room " + room);
    console.log("This peer is the initiator of room " + room + "!");
    isChannelReady = true;
    getUserMedia();
  });

  socket.on("joined", function (room) {
    console.log("joined: " + room);

    isChannelReady = true;
    getUserMedia();
  });

  socket.on("log", function (array) {
    console.log.apply(console, array);
  });

}

socket.on("message", function (message) {
  console.log("Client received message:", message);
  if (message.type === "offer") {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === "answer" && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === "candidate" && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });

    pc.addIceCandidate(candidate);
  } else if (message === "bye" && isStarted) {
    handleRemoteHangup();
  }
});

////////////////////////////////////////////////////

var constraints = {
  audio: true,
  video: true,
};

//     //console.log('Getting user media with constraints', constraints);

//     //if (location.hostname !== 'localhost') {
//   requestTurn(
//         //  'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
//        'https://service.xirsys.com/ice?ident=roboxa&secret=df1329ae-598d-11e8-843f-64e5ceab1a01&domain=www.vivekc.xyz&application=default&room=MyFirstApp&secure=1'

// //  'https://service.xirsys.com/ice?ident=abhay0648&secret=1a51b0b4-329f-11e8-9660-8d907ccd5eed&domain=www.vivekc.xyz&application=default&room=testing&secure=1'
//     );
//     //}
var globalsstream = "";
function maybeStart() {
  //console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (
    !isStarted &&
    typeof localStream !== "undefined" &&
    isChannelReady &&
    localStream != ""
  ) {
    //  console.log('>>>>>> creating peer connection');
    createPeerConnection();
    // pc.addStream(localStream);

    // const audio = new Audio("https://sample-videos.com/audio/mp3/crowd-cheering.mp3");
    // audio.loop = true;
    // audio.crossOrigin = 'anonymous';
    // audio.play();

    // const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // const stream_dest = ctx.createMediaStreamDestination();
    // const source = ctx.createMediaElementSource(audio);
    // source.connect(stream_dest);

    // const stream222 = stream_dest.stream;
    //  var track = localStream.getVideoTracks()[0];
    //   var track2 = localStream.getAudioTracks()[0];
    //   // var audioMixer = new MultiStreamsMixer([au, track2]);
    //    // var track3 = au;
    //  pc.addTrack(track, localStream)
    //   pc.addTrack(track2, localStream)
    // pc.addTrack(stream222, localStream)
    //  pc.addStream(track2);
    // pc.addTrack(track3);
    globalsstream = localStream
      .getTracks()
      .forEach((track) => pc.addTrack(track, localStream));

    //       var track = localStream.getVideoTracks()[0];
    // globalsstream = pc.addTrack(track, localStream);

    isStarted = true;

    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function () {
  sendMessage("bye");
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    uniqcallid = "";
    pc = new RTCPeerConnection(serverconfig);
    pc.addEventListener('ontrack', async (event) => {
      console.log('Listening to ontrack event', event);
    });
    pc.addEventListener('onaddtrack', async (event) => {
      console.log('Listening to onaddtrack event', event);
    });
    pc.addEventListener('track', async (event) => {
      console.log('Listening to track event', event);
    });
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    pc.onicecandidate = handleIceCandidate;
    console.log("Created RTCPeerConnnection");
    $("#allbuttonvideo").show();

    uniqcallid = Math.floor(
      Math.random() * Math.floor("34564654654")
    ).toString();
  } catch (e) {
    console.log("Failed to create PeerConnection, exception: " + e.message);
    alert("Cannot create RTCPeerConnection object.");
    return;
  }
}

function handleIceCandidate(event) {
  //   console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: "candidate",
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
    });
  } else {
    console.log("End of candidates.");
  }
}

function handleCreateOfferError(event) {
  console.log("createOffer() error: ", event);
}

function doCall() {
  console.log("Sending offer to peer");
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log("Sending answer to peer.");
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log("setLocalAndSendMessage sending message", sessionDescription);
  sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
  trace("Failed to create session description: " + error.toString());
}

function handleRemoteStreamAdded(event) {
  console.log("Remote stream added.", event);

  if(event.streams && event.streams.length) {
    remoteStream = event.streams[0]
  } else if(event.stream) {
    remoteStream = event.stream;
  }

  // window.stream used for recording call
  window.stream = remoteStream;
  //
  remoteVideo.srcObject = remoteStream;
  sendMessage("Remote Stream Added");
}

function handleRemoteStreamRemoved(event) {
  console.log("Remote stream removed. Event: ", event);
}

function hangup() {
  console.log("Hanging up.");
  stop();
  sendMessage("bye");
}

function handleRemoteHangup() {
  console.log("Session terminated.");

  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
  remoteVideo.srcObject = null;
}

// CALL RECORDING CODE
let mediaRecorder;
let recordedBlobs;
let isCallRecording = 0; // keep call recording status

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startCallRecording() {
  recordedBlobs = [];
  let options = {
    mimeType: "video/webm;codecs=vp9",
  };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not Supported`);
    options = {
      mimeType: "video/webm;codecs=vp8",
    };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      options = {
        mimeType: "video/webm",
      };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        options = {
          mimeType: "",
        };
      }
    }
  }

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
    isCallRecording = 1;
  } catch (e) {
    console.error("Exception while creating MediaRecorder:", e);
    return;
  }

  console.log("Created MediaRecorder", mediaRecorder, "with options", options);
  mediaRecorder.onstop = (event) => {
    console.log("Recorder stopped: ", event);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log("MediaRecorder started", mediaRecorder);
}

function stopCallRecording() {
  mediaRecorder.stop();
  isCallRecording = 0;
  saveCallRecording();
  console.log("Recorded Blobs: ", recordedBlobs);
}

function saveCallRecording() {
  var namefile = Math.floor(Math.random() * 96466465465) + ".webm";
  const blob = new Blob(recordedBlobs, {
    type: "video/webm",
  });
  var file = new File([blob], namefile);
  AWS.config.update({
    accessKeyId: "AKIAJEKFDQWHJ5E6XV4A",
    secretAccessKey: "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",
    region: "us-east-1",
  });
  var s3 = new AWS.S3();
  var params = {
    Bucket: "roboxadev",
    Key: file.name,
    ContentType: file.type,
    Body: file,
    ACL: "public-read",
  };
  var request = s3.putObject(params);
  request.on("success", function (response) {
    var user_id = getCookie("user_id");
    // var ftypedata = file.type.split("/")[0];
    var myobj = {
      user_id: oncallwith,
      supervisor_id: user_id,
      url: "https://s3.amazonaws.com/roboxadev/" + file.name,
      filename: file.name,
      filesize: file.size.toString(),
      timestamp: new Date(),
      // type: ftypedata,
      type: "video",
      etag: response.data.ETag.replace(/"/g, ""),
    };
    saveRecordingToDB(JSON.stringify(myobj));
  });
  request.on("error", function (response) {
    console.log(JSON.stringify(response));
  });
  request.send();
}
