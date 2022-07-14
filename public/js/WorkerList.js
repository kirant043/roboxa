var rams = [];
var ramsname = [];
var calldata;
$(document).ready(function () {
  document
    .getElementById("remoteVideo")
    .addEventListener("play", startvideotimer);

  function startvideotimer() {
    if (calltimercheck == "0") {
      FnVideoTimer();
      calltimercheck = "545";
    }
  }

  $.ajaxSetup({
    headers: {
      "x-auth-token": JSON.parse(window.localStorage.getItem("loggeduserdata"))
        .token,
    },
  });
  // audio.loop = true;
  // audio.play();

  $("#screenshotvideocanvas").hide();
  $("#screenshotvideo").hide();
  $("#video-data").hide();

  $("#caldivshow").hide();
  var userId = getParameterByName("user_id");
  setCookie("user_id", userId, 10);
  FnGetWorkerList();
  FnGetWorkerListByCallHistory();
  getAllnotification();
  FnGetRecentUplodedDoc();

  $("input[id=filedata]").change(function (ev) {
    $("#filenameshow").innerHTML = "";
    if (ev.target.value != "") {
      $("#filenameshow").show();

      for (var i = 0; i < filedata.files.length; i++) {
        if (ramsname.includes(filedata.files[i].name)) {
          alert("already added");
        } else {
          ramsname.push(filedata.files[i].name);
          rams.push(filedata.files[i]);
        }
      }
      $("#filenameshow").empty();
      for (var i = 0; i < rams.length; i++) {
        var str =
          '<li id="fileup' +
          i +
          '">' +
          rams[i].name +
          "<span> <a onclick=\"removefilesingle('" +
          i +
          '\')"> <i class="fa fa-times" ></i> </a> </span></li>';

        $("#filenameshow").append(str);
      }
    }
  });

  $("[name=imageseacrh]").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("table tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
  $("[name=videoseacrh]").on("keyup", function () {
    var value = $(this).val().toLowerCase();

    $("table tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
  $("#searchmodaldoc").bind("keyup", function () {
    var searchString = $(this).val();

    $("searchtag li").each(function (index, value) {
      currentName = $(value).text();
      if (
        currentName.toUpperCase().indexOf(searchString.toUpperCase()) > -1 ||
        currentName.toUpperCase() == "VIDEOS"
      ) {
        $(value).show();
      } else {
        $(value).hide();
      }
    });
  });

  $("#searchText").bind("keyup", function () {
    var searchString = $(this).val();

    $("ul li").each(function (index, value) {
      currentName = $(value).text();
      if (currentName.toUpperCase().indexOf(searchString.toUpperCase()) > -1) {
        $(value).show();
      } else {
        $(value).hide();
      }
    });
  });

  // $('#localVideo').on('play', function (e) {
  //     $('#video-data').show();
  //     $('#remoteVideo').hide();
  //     $('#localVideo').show();

  // });

  $("#btn-switch-video").on("click", function (e) {
    $("#localVideo").toggle();
    $("#remoteVideo").toggle();
    $("#vZoomScrollNav").toggle();
    if (
      $(this).find("img").attr("src") ==
      "images/video-player-icons/ic_camera_flip_active.png"
    ) {
      $(this).find("img")[0].src =
        "images/video-player-icons/ic_camera_flip.png";
    } else {
      $(this).find("img")[0].src =
        "images/video-player-icons/ic_camera_flip_active.png";
    }
  });
  $("#v-pills-profile-tab").on("click", function (e) {
    getcallhistorydata();
  });
  $("#v-pills-messages-tab").on("click", function (e) {
    FnGetDocumentCount();
  });
  $("#reciveCallLink").on("click", function (e) {
    FnGetReciveCalls();
  });
  $("#outgoingCallLink").on("click", function (e) {
    FnGetOutgoingCalls();
  });
  $("#totalCallSummaryLink").on("click", function (e) {
    FnShowCallCallSummary(finalcallsummary);
  });

  $("#imageDocCountLink").on("click", function (e) {
    FnGetImageDoc();
  });

  $("#videoDocCountLink").on("click", function (e) {
    FnGetVideoDoc();
  });

  $("#uploadDocLink").on("click", function (e) {
    FnGetRecentUplodedDoc();
  });
});
var incomingcalltone = new Audio("callsound/ringtone.mp3");
var outgoingcalltone = new Audio("callsound/calltone.mp3");
var isSharesupport = "0";
var workerListIds = [];
var callhistoryglobal = [];
var finalcallsummary = [];
var callerbusy = false;
var canvasdrwaH, canvasdrwaW;
var timerInfo = document.getElementById("#video_timer"),
  seconds = 0,
  minutes = 0,
  hours = 0,
  t;
var timerinterval;
var callotheruserid = "";
var globalcalldata;
var callrejectimeout;

var ResToSetUserId = {
  user_id: getCookie("user_id"),
  emp_id: JSON.parse(window.localStorage.getItem("loggeduserdata")).emp_id,
};
socket.emit("setUserId", ResToSetUserId);
// socket.on("connect", function () {
//   console.log("connected" + socket.id);
// });
// socket.on("disconnect", function () {
//   console.log("Socket disconnected")
//   logout();
// });
function removefilesingle(id) {
  $("#fileup" + id).remove();
  rams.splice(id, 1);
  $("#filenameshow").empty();
  for (var i = 0; i < rams.length; i++) {
    var str =
      '<li id="fileup' +
      i +
      '">' +
      rams[i].name +
      "<span> <a onclick=\"removefilesingle('" +
      i +
      '\')"> <i class="fa fa-times" ></i> </a> </span></li>';

    $("#filenameshow").append(str);
  }
}

function FnGetWorkerList() {
  showloader();
  var user_id = getCookie("user_id");
  var request = JSON.stringify({
    supervisor_id: user_id,
  });
  $.ajax({
    type: "POST",
    url: "/api/userdetails/",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: request,
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      hideloader();
      showWorkerList(data);
      console.log('emitting getonline users' , socket)
      socket.emit("GetOnlineUsers");
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function disablecalldiv() {
  document
    .getElementById("pills-tab")
    .setAttribute(
      "style",
      "pointer-events: none;opacity:0.7; -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-o-user-select: none;user-select: none;"
    );
}

function enablecalldiv() {
  document.getElementById("pills-tab").setAttribute("style", "");
}

function removefile() {
  document.getElementById("filedata").value = "";
  $("#filenameshow").hide();
}

function showWorkerList(data) {
  for (var i = 0; i < data.length; i++) {
    data[i].user_id = data[i]._id;
    workerListIds.push(data[i].user_id);
    var tblContent =
      "<tr>" +
      '<td scope="row" class="ellipsis-text"><span>' +
      data[i].f_name +
      " " +
      data[i].l_name +
      "</span></td>" +
      '<td scope="row" class="ellipsis-text"><span>' +
      data[i].email +
      "</span></td>" +
      '<td scope="row" class="ellipsis-text"><span>' +
      data[i].glass_id +
      "</span></td>" +
      '<td scope="row" class="ellipsis-text"><span>' +
      data[i].location +
      "</span></td>" +
      '<td scope="row" class="ellipsis-text"><span id="span5' +
      data[i]._id +
      '">Inactive</span></td>' +
      '<td><button disabled type="button" name="' +
      data[i].f_name +
      " " +
      data[i].l_name +
      "," +
      data[i].glass_id +
      "," +
      data[i].location +
      '" id="' +
      data[i].user_id +
      '" class="btn btn-success btn-sm" data-toggle="modal" OnClick="makeCall(this)">Call</button></td>' +
      "</tr>";
    $("#tblContent").append(tblContent);
  }
}

function makeCall(value) {
  $("#pills-video2-tab").click();
  if (!callerbusy) {
    outgoingcalltone.loop = true;
    outgoingcalltone.currentTime = 0;
    outgoingcalltone.play();
    isShreevidence = "0";
    isShredoc = "0";
    isSharesupport = "0";
    var arr = value.name.split(",");
    $("#callLoader").empty();
    var str =
      '<div class="popup-calling-txt calling-txt-2">' +
      '<div class="call-heading">Calling...</div>' +
      '<div class="sub-heaing">' +
      "" +
      arr[0] +
      " <span>|</span> Glass ID " +
      arr[1] +
      " <span>|</span>" +
      arr[2] +
      " </div>" +
      '<div class="calling-btns-row">' +
      '<button type="button" class="btn btn-danger bdr-radius-20 btn-lg" data-dismiss="modal" onclick="rejectcall(\'' +
      value.id +
      "')\">Cancel</button>" +
      "</div>" +
      "</div>";

    $("#callLoader").append(str);
    $("#workerCall").modal("toggle");
    $("#endCallBtnDiv").empty();
    var endBtnStr =
      '<div class="bottom-txt"> <button name="' +
      value.id +
      '"  type="button" class="btn btn-danger btn-lg bdr-radius-20" onclick="endCall(this)">End</button> </div>';
    $("#endCallBtnDiv").append(endBtnStr);
    $("#v-pills-profile-tab").trigger("click");

    callotheruserid = value.id;
    calleridfordocsave = value.id;
    var CallData = {
      user_id: getCookie("user_id"),
      other_user_id: value.id,
      name: arr[0],
      glass_id: arr[1],
      location: arr[2],
      callid: uniqcallid,
    };
    globalcalldata = CallData;

    socket.emit("call", CallData);
  } else {
    $("#calbusyuser").modal("toggle");
  }
}
var calleridfordocsave = "";

function callclosetime() {
  callrejectimeout = setTimeout(function () {
    if (!callerbusy) {
      rejectcall(callotheruserid);
      $("#workerCall").modal("toggle");
    }
  }, 30000);
}

function stopcallreject() {
  clearTimeout(callrejectimeout);
}

socket.on("callAnswer", function (data) {
  stopcallreject();
  $("#workerCall").modal("toggle");
  outgoingcalltone.pause();
  incomingcalltone.pause();
  $("#pills-video2-tab").click();
  enablecalldiv();

  callerbusy = true;
  $("#caldivshow").show();
  $("#video-data").show();
  $("#remoteVideo").show();
  $("#vZoomScrollNav").show();
  $("#localVideo").hide();
  var request = JSON.stringify({
    user_id: getCookie("user_id"),
    other_user_id: data.user_id,
  });

  calleridfordocsave = data.user_id;
  callotheruserid = data.user_id;

  call_start_date_time = Date();
  call_type = "outgoing";

  $("#v-pills-profile-tab").trigger("click");
  createOrJoin(getCookie("user_id"), data.user_id);
});

var callrcvdar = [];

socket.on("call", function (data) {
  if (callerbusy) {
    var userdata = {
      user_id: data.user_id,
    };
    getAllnotification();
    var missedcalltext = data.name + " is looking for your help ";
    $("#busyincomingcalll").text(missedcalltext);
    busyincomingcalll.style.display = "block";

    socket.emit("callerbusy", userdata);
  } else {
    incomingcalltone.currentTime = 0;
    incomingcalltone.loop = true;

    incomingcalltone.play();

    callrcvdar = data;

    var request = JSON.stringify({
      user_id: getCookie("user_id"),
      other_user_id: data.user_id,
    });
    calleridfordocsave = data.user_id;
    $("#callLoader").empty();

    var str =
      '<div class="popup-calling-txt calling-txt-2">' +
      '<div class="call-heading">Recive a Call....</div>' +
      '<div class="sub-heaing">' +
      "" +
      data.name +
      " <span>|</span> Glass ID " +
      data.glass_id +
      " <span>|</span>" +
      data.location +
      " </div>" +
      '<div class="calling-btns-row">' +
      '<button type="button" class="btn btn-danger bdr-radius-20 btn-lg" data-dismiss="modal" onclick="rejectcall(\'' +
      data.user_id +
      "')\" >Cancel</button>" +
      "<span>|</span>" +
      '<button type="button" class="btn  btn-primary bdr-radius-20 btn-lg" data-dismiss="modal" onclick="callrcvweb()">Accept</button>' +
      "</div>" +
      "</div>";

    $("#callLoader").append(str);

    $("#workerCall").modal("toggle");
    $("#video-name-place").empty();
    var str1 =
      '<div class="name-place">' +
      data.name +
      " | " +
      data.glass_id +
      " | " +
      data.location +
      "</div>";
    $("#video-name-place").append(str1);

    $("#endCallBtnDiv").empty();
    var endBtnStr =
      '<div class="bottom-txt"> <button name="' +
      data.user_id +
      '"  type="button" class="btn btn-danger btn-lg bdr-radius-20" onclick="endCall(this)">End</button> </div>';
    $("#endCallBtnDiv").append(endBtnStr);
  }
});

function rejectcall(uid) {
  stopcallreject();
  outgoingcalltone.pause();
  incomingcalltone.pause();
  var userdata = {
    user_id: uid,
  };

  socket.emit("rejectcall", userdata);
}

function callrcvweb() {
  incomingcalltone.pause();
  $("#pills-video2-tab").click();
  enablecalldiv();
  callerbusy = true;
  $("#caldivshow").show();
  $("#video-data").show();
  $("#remoteVideo").show();
  $("#vZoomScrollNav").show();
  $("#localVideo").hide();

  isShreevidence = "0";
  isShredoc = "0";
  isSharesupport = "0";

  var CallAnswerData = {
    user_id: getCookie("user_id"),
    other_user_id: callrcvdar.user_id,
  };
  socket.emit("callAnswer", CallAnswerData);
  $("#v-pills-profile-tab").trigger("click");
  call_start_date_time = Date();
  call_type = "incoming";

  createOrJoin(getCookie("user_id"), callrcvdar.user_id);
}

function sendchat() {
  //console.log('Client sending message: ', message);

  var userdata = {
    user_id: calleridfordocsave + getCookie("user_id"),
    message: chatmsg.value,
  };
  socket.emit("chat", userdata);
  chatmsg.value = "";
}

// This client receives a message

socket.on("chat", function (message) {});

socket.on("rejectcall", function (args) {
  outgoingcalltone.pause();
  incomingcalltone.pause();
  $("#workerCall").modal("toggle");
});

function endCall(value) {
  sendMessage("bye");

  clearTime();
  callerbusy = false;
  isStarted = false;
  isInitiator = false;
  isChannelReady = false;

  localStream.getAudioTracks()[0].stop();
  localStream.getVideoTracks()[0].stop();
  remoteVideo.srcObject = null;
  localstaream = "";
  remoteStream = "";

  // var u_id,o_id;

  // if(call_type=="incoming"){

  //      calldata=callrcvdar;

  // }else{

  //      calldata=globalcalldata
  // }
  //       var requestcall = {

  //     "user_id": u_id,
  //     "other_user_id": o_id,
  //     "email": "",
  //     "emp_id": "",
  //     "full_name":calldata.name,
  //     "glass_id": calldata.glass_id,
  //     "location":calldata.location,
  //     "user_name": ""

  //     };

  call_end_date_time = Date();
  var startDate = call_start_date_time.toString();
  var endDate = call_end_date_time.toString();
  $("#localVideo").hide();
  $("#remoteVideo").hide();
  $("#vZoomScrollNav").hide();
  $("#video-data").hide();
  $("#caldivshow").hide();
  //  FnSaveCallDetail(startDate,endDate,call_type,requestcall);
  // FnGetReciveCalls();
}

function sendMessage(message) {
  var forroom = {
    room: calleridfordocsave + getCookie("user_id"),
    message: message,
  };

  // console.log('Client  ', forroom);
  socket.emit("message", forroom);
}

socket.on("callEnd", function (data) {
  busyincomingcalll.style.display = "none";
  clearTime();
  callerbusy = false;
  isInitiator = false;
  isStarted = false;
  isChannelReady = false;
  if (pc) {
    pc.close();
  }

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
    other_user_id: data.user_id,
  });
  var leaveRoom = {
    room: data.user_id + getCookie("user_id"),
  };

  socket.emit("leaveGroup", leaveRoom);

  stopcalllpeer();

  call_end_date_time = Date();
  var startDate = call_start_date_time.toString();
  var endDate = call_end_date_time.toString();
  FnSaveCallDetail(startDate, endDate, call_type, data);
  FnGetReciveCalls();

  localStream.getAudioTracks()[0].stop();
  localStream.getVideoTracks()[0].stop();
  localstaream = "";
  remoteStream = "";
  remoteVideo.srcObject = null;
});

socket.on("connectUser", function (data) {
  // socket.emit('setUserId', ResToSetUserId);
  console.log(workerListIds, data);
  for (var i = 0; i < workerListIds.length; i++) {
    if (workerListIds[i] == data.user_id) {
      $("#" + data.user_id).removeAttr("disabled");
      $("#span5" + data.user_id).text("Active");
    }
  }
});

socket.on("cehavidence", function (data) {
  var requestdsdds = JSON.stringify({
    url: data.url,
    user_id: data.user_id,
    other_user_id: data.other_user_id,
    callid: uniqcallid,
    doctype: "image",
    from: "glass",
  });
  isShreevidence = 1;

  inserevidentodb(requestdsdds);
});

function inserevidentodb(requestdsdds) {
  $.ajax({
    type: "POST",
    url: "/api/cehavidenceinsert",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: requestdsdds,
    cache: false,
    beforeSend: function () {},
    success: function (data) {},
    error: function (xhr, status, error) {},
  });
}

socket.on("userDisconnect", function (data) {
  for (var i = 0; i < workerListIds.length; i++) {
    if (workerListIds[i] == data.user_id) {
      $("#" + data.user_id).attr("disabled", "true");
      $("#span5" + data.user_id).text("Inactive");
    }
  }
});

socket.on("GetOnlineUsers", function (data) {
  for (var i = 0; i < workerListIds.length; i++) {
    if (data.user_id.indexOf(workerListIds[i]) !== -1) {
      $("#" + workerListIds[i]).removeAttr("disabled");
      $("#span5" + workerListIds[i]).text("Active");
    }
  }
});

function FnSaveCallDetail(startDate, endDate, call_type, datafromglass) {
  var requestdsdds = JSON.stringify({
    user_id: getCookie("user_id"),
    other_user_id: datafromglass.user_id,
    start_date: startDate,
    end_date: endDate,
    type: call_type,
    glass_id: datafromglass.glass_id,
    job_id: datafromglass.glass_id,
    location: datafromglass.location,
    full_name: datafromglass.full_name,
    emp_id: datafromglass.emp_id,
    callid: uniqcallid,
    isShredoc: isShredoc,
    isShreevidence: isShreevidence,
    isSharesupport: isSharesupport,
  });

  $.ajax({
    type: "POST",
    url: "/api/calldetailsave",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: requestdsdds,
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      getcallhistorydata();
    },
    error: function (xhr, status, error) {},
  });
}

function setCallCounts(data) {
  $("#reciveCallCount").empty();
  $("#outgoingCallCount").empty();
  $("#totalCallCount").empty();

  var rCallCount =
    '<span class="numbers">' +
    countcallrcout("incoming") +
    "</span> Received Call";
  var oCallCount =
    '<span class="numbers" > ' +
    countcallrcout("outgoing") +
    " </span > Outgoing Call";
  var tCallCount =
    '<span class="numbers" > ' + data.length + " </span > Call Reports";
  $("#reciveCallCount").append(rCallCount);
  $("#outgoingCallCount").append(oCallCount);
  $("#totalCallCount").append(tCallCount);
}

function FnGetReciveCalls() {
  FnShowReciveCallDetail(callhistoryglobal);
}

function FnShowReciveCallDetail(data) {
  $("#reciveCalls").empty();
  for (var i = 0; i < data.length; i++) {
    if (data[i].type == "incoming") {
      var str =
        '<div class="card">' +
        '<div class="card-header" id="headingOne">' +
        '<div class="row">' +
        '<div class="col-4 col-sm-2 ellipsis-text">' +
        "<span>" +
        data[i].full_name +
        "</span>" +
        "</div>" +
        '<div class="col-3 col-sm-2 ellipsis-text">' +
        "<span>" +
        data[i].glass_id +
        "</span>" +
        "</div>" +
        '<div class="col-3 col-sm-2 ellipsis-text">' +
        "<span>" +
        data[i].location +
        "</span>" +
        "</div>" +
        '<div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">' +
        "<span>" +
        get_time_diff(data[i].start_date, data[i].end_date) +
        " hrs</span>" +
        "</div>" +
        '<div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">' +
        "<span>" +
        getdateTimeformat(data[i].start_date) +
        "</span> </div>" +
        '<div class="col-2 col-sm-2 text-center">' +
        '<button class="btn btn-link  collapsed" data-toggle="collapse" data-target="#outgoing' +
        i +
        '" OnClick="showhidcalltext(this)" aria-expanded="false" aria-controls="collapseOne">Show</button>' +
        "</div > " +
        "</div > " +
        "</div > " +
        '<div id= "outgoing' +
        i +
        '" class="collapse" aria- labelledby="headingOne" data- parent="#accordion" style= ""> ' +
        '<div class="card-body p-0"> ' +
        '<div class="row"> ' +
        '<div class="col-md-12 pl-0 pr-0"> ' +
        '<div class="rc-bottom-data"> ' +
        '<div class="data-lt"> ' +
        '<div class="data-row"> ' +
        '<div class="lt-data-label"> Job ID </div > ' +
        '<div class="data-label-txt"> ' +
        "<span>:</span > " +
        data[i].job_id +
        " " +
        "</div> " +
        "</div> " +
        '<div class="data-row"> ' +
        '<div class="lt-data-label">Start Call</div>' +
        '<div class="data-label-txt">' +
        "<span>:</span> " +
        getdateformat(data[i].start_date) +
        "" +
        "</div>" +
        "</div>" +
        '<div class="data-row">' +
        '<div class="lt-data-label">Finish Call</div>' +
        '<div class="data-label-txt">' +
        "<span>:</span> " +
        getdateformat(data[i].end_date) +
        "" +
        "</div>" +
        "</div>" +
        '<div class="data-row">' +
        '<div class="lt-data-label">Call Duration</div>' +
        '<div class="data-label-txt">' +
        "<span>:</span> " +
        get_time_diff(data[i].start_date, data[i].end_date) +
        " hrs" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="rc-bottom-data-img">' +
        '<div class="img-1 datshareclass' +
        data[i].isShreevidence +
        '">' +
        '<img src="images/call-ftr-img1.jpg" alt="">' +
        '<div class="img-overlay">' +
        '<div class="zoom-icon">' +
        "<a OnClick=\"opensharedevidence('" +
        data[i].callid +
        "')\" >" +
        '<img src="images/zoom-icon.png" alt="" />' +
        "</a>" +
        "</div>" +
        '<div class="img-overlay-txt">' +
        "<a OnClick=\"opensharedevidence('" +
        data[i].callid +
        "')\" >View Evidence</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="img-1 datshareclass' +
        data[i].isSharesupport +
        '">' +
        '<img src="images/call-ftr-img1.jpg" alt="">' +
        '<div class="img-overlay">' +
        '<div class="zoom-icon">' +
        "<a OnClick=\"opensupooerevidence('" +
        data[i].callid +
        "')\" >" +
        '<img src="images/zoom-icon.png" alt="" />' +
        "</a>" +
        "</div>" +
        '<div class="img-overlay-txt">' +
        "<a OnClick=\"opensupooerevidence('" +
        data[i].callid +
        "')\" >Support Evidence</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="img-1 datshareclass' +
        data[i].isShredoc +
        '">' +
        '<img src="images/call-ftr-img2.jpg" alt="">' +
        '<div class="img-overlay">' +
        '<div class="zoom-icon">' +
        "<a OnClick=\"openshareddoc('" +
        data[i].callid +
        "')\" >" +
        '<img src="images/zoom-icon.png" alt="" />' +
        "</a>" +
        "</div>" +
        '<div class="img-overlay-txt">' +
        "<a OnClick=\"openshareddoc('" +
        data[i].callid +
        "')\" >Shared Documents</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
      $("#reciveCalls").append(str);
    }
  }
}

function FnGetOutgoingCalls() {
  FnShowOutgoingCallDetail(callhistoryglobal);
}

function FnShowOutgoingCallDetail(data) {
  $("#outgoingCalls").empty();
  for (var i = 0; i < data.length; i++) {
    if (data[i].type == "outgoing") {
      var str =
        '<div class="card">' +
        '<div class="card-header" id="headingOne">' +
        '<div class="row">' +
        '<div class="col-4 col-sm-2 ellipsis-text">' +
        "<span>" +
        data[i].full_name +
        "</span>" +
        "</div>" +
        '<div class="col-3 col-sm-2 ellipsis-text">' +
        "<span>" +
        data[i].glass_id +
        "</span>" +
        "</div>" +
        '<div class="col-3 col-sm-2 ellipsis-text">' +
        "<span>" +
        data[i].location +
        "</span>" +
        "</div>" +
        '<div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">' +
        "<span>" +
        get_time_diff(data[i].start_date, data[i].end_date) +
        " hrs</span>" +
        "</div>" +
        '<div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">' +
        "<span>" +
        getdateTimeformat(data[i].start_date) +
        "</span>" +
        "</div>" +
        '<div class="col-2 col-sm-2 text-center">' +
        '<button class="btn btn-link  collapsed" data-toggle="collapse" data-target="#outgoing' +
        i +
        '" aria-expanded="false" OnClick="showhidcalltext(this)" aria-controls="collapseOne">Show</button>' +
        "</div > " +
        "</div > " +
        "</div > " +
        '<div id= "outgoing' +
        i +
        '" class="collapse" aria- labelledby="headingOne" data- parent="#accordion" style= ""> ' +
        '<div class="card-body p-0"> ' +
        '<div class="row"> ' +
        '<div class="col-md-12 pl-0 pr-0"> ' +
        '<div class="rc-bottom-data"> ' +
        '<div class="data-lt"> ' +
        '<div class="data-row"> ' +
        '<div class="lt-data-label"> Job ID </div > ' +
        '<div class="data-label-txt"> ' +
        "<span>:</span > " +
        data[i].job_id +
        " " +
        "</div> " +
        "</div> " +
        '<div class="data-row"> ' +
        '<div class="lt-data-label">Start Call</div>' +
        '<div class="data-label-txt">' +
        "<span>:</span> " +
        getdateformat(data[i].start_date) +
        "" +
        "</div>" +
        "</div>" +
        '<div class="data-row">' +
        '<div class="lt-data-label">Finish Call</div>' +
        '<div class="data-label-txt">' +
        "<span>:</span> " +
        getdateformat(data[i].end_date) +
        "" +
        "</div>" +
        "</div>" +
        '<div class="data-row">' +
        '<div class="lt-data-label">Call Duration</div>' +
        '<div class="data-label-txt">' +
        "<span>:</span> " +
        get_time_diff(data[i].start_date, data[i].end_date) +
        " hrs" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="rc-bottom-data-img">' +
        '<div class="img-1 datshareclass' +
        data[i].isShreevidence +
        '">' +
        '<img src="images/call-ftr-img1.jpg" alt="">' +
        '<div class="img-overlay">' +
        '<div class="zoom-icon">' +
        "<a OnClick=\"opensharedevidence('" +
        data[i].callid +
        "')\" >" +
        '<img src="images/zoom-icon.png" alt="" />' +
        "</a>" +
        "</div>" +
        '<div class="img-overlay-txt">' +
        "<a OnClick=\"opensharedevidence('" +
        data[i].callid +
        "')\">View Evidence</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="img-1 datshareclass' +
        data[i].isSharesupport +
        '">' +
        '<img src="images/call-ftr-img1.jpg" alt="">' +
        '<div class="img-overlay">' +
        '<div class="zoom-icon">' +
        "<a OnClick=\"opensupooerevidence('" +
        data[i].callid +
        "')\" >" +
        '<img src="images/zoom-icon.png" alt="" />' +
        "</a>" +
        "</div>" +
        '<div class="img-overlay-txt">' +
        "<a OnClick=\"opensupooerevidence('" +
        data[i].callid +
        "')\">Support Evidence</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="img-1 datshareclass' +
        data[i].isShredoc +
        '">' +
        '<img src="images/call-ftr-img2.jpg" alt="">' +
        '<div class="img-overlay">' +
        '<div class="zoom-icon">' +
        "<a OnClick=\"openshareddoc('" +
        data[i].callid +
        "')\">" +
        '<img src="images/zoom-icon.png" alt="" />' +
        "</a>" +
        "</div>" +
        '<div class="img-overlay-txt">' +
        "<a OnClick=\"openshareddoc('" +
        data[i].callid +
        "')\">Shared Documents</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
      $("#outgoingCalls").append(str);
    }
  }
}

function getcallhistorydata() {
  callhistoryglobal = [];
  var user_id = getCookie("user_id");
  var userdataid = {
    user_id: user_id,
  };
  $.ajax({
    type: "POST",
    url: "/api/callhistorydata",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      callhistoryglobal = data.reverse();

      setCallCounts(callhistoryglobal);
      FnGetReciveCalls();
      FnGetOutgoingCalls();
      getcallhistorydata2();
    },
    error: function (xhr, status, error) {},
  });
}

function getcallhistorydata2(data) {
  var user_id = getCookie("user_id");
  var userdataid = {
    user_id: user_id,
  };
  $.ajax({
    type: "POST",
    url: "/api/callhistorydata",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      allcalldatadetail(data);
    },
    error: function (xhr, status, error) {},
  });
}

function checknancallcount(count) {
  if (isNaN(sad)) {
    return "0";
  } else {
    return count;
  }
}

function FnShowCallCallSummary(data) {
  //data=data.reverse();
  data.sort(function (a, b) {
    var c = new Date(a.uniquekey);
    var d = new Date(b.uniquekey);

    return d - c;
  });

  console.log(data);

  $("#tblCallContent").empty();
  for (var i = 0; i < data.length; i++) {
    var callcountin = "";
    var callcountout = "";

    if (data[i].countcallrcv == "1" || data[i].countcallrcv == "0") {
      callcount = data[i].countcallrcv;
    } else {
      callcount = data[i].countcallrcv
        .split("")
        .reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    if (data[i].countcallout == "1" || data[i].countcallout == "0") {
      callcountout = data[i].countcallout;
    } else {
      callcountout = data[i].countcallout
        .split("")
        .reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }

    var str =
      "<tr>" +
      '<td class="ellipsis-text">' +
      "<span>" +
      data[i].callcountall
        .split("")
        .reduce((a, b) => parseInt(a) + parseInt(b), 0) +
      "</span>" +
      "</td>" +
      '<td class="ellipsis-text">' +
      "<span>" +
      callcount +
      "</span>" +
      "</td>" +
      '<td class="ellipsis-text">' +
      "<span>" +
      callcountout +
      "</span>" +
      "</td>" +
      '<td class="hide-on-mobile ellipsis-text">' +
      "<span>" +
      getsecondsumval(data[i].calldurtion) +
      " Hrs</span>" +
      "</td>" +
      '<td class="hide-on-mobile ellipsis-text">' +
      "<span>" +
      data[i].uniquekey +
      "</span>" +
      "</td>" +
      "<td>" +
      '<a href="#" class="btn btn-success btn-sm bdr-radius-20">Share</a>' +
      "</td>" +
      "</tr>";
    $("#tblCallContent").append(str);
  }
}

function timercallshow() {
  seconds++;
  if (seconds >= 60) {
    seconds = 0;
    minutes++;
    if (minutes >= 60) {
      minutes = 0;
      hours++;
    }
  }

  video_timer.textContent =
    (hours ? (hours > 9 ? hours : "0" + hours) : "00") +
    ":" +
    (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") +
    ":" +
    (seconds > 9 ? seconds : "0" + seconds);

  calltimerforcall();
}

function calltimerforcall() {
  timerinterval = setTimeout(timercallshow, 1000);
}

function FnVideoTimer() {
  calltimerforcall();
}

function clearTime() {
  clearTimeout(timerinterval);

  video_timer.textContent = "00:00:00";
  calltimercheck = "0";
  seconds = 0;
  minutes = 0;
  hours = 0;
}

var documentdataall = [];

function FnGetDocumentCount() {
  setTimeout(function () {
    FnSetDocumentCount("asdf");
    FnGetVideoDoc();
    FnGetImageDoc();
  }, 10);
}

function FnSetDocumentCount(data) {
  $("#imageDocumentCount").empty();
  $("#videoDocumentCount").empty();

  var imageDocCount =
    '<span class="numbers">' + countimgvido("image") + "</span>  Manuals";
  var videoDocCount =
    '<span class="numbers" > ' + countimgvido("video") + " </span > Videos";
  $("#imageDocumentCount").append(imageDocCount);
  $("#videoDocumentCount").append(videoDocCount);
}

function countimgvido(typedoc) {
  var count = 0;
  for (var i = 0; i < documentdataall.length; ++i) {
    if (documentdataall[i].filetype == typedoc) count++;
  }
  return count;
}

function countcallrcout(typecall) {
  var count = 0;
  for (var i = 0; i < callhistoryglobal.length; ++i) {
    if (callhistoryglobal[i].type == typecall) count++;
  }
  return count;
}

function FnGetImageDoc() {
  FnShowImageDoc(documentdataall);
}

function FnShowImageDoc(data) {
  $("#tblImageDocContent").empty();

  for (var i = 0; i < data.length; i++) {
    if (data[i].filetype == "image" || data[i].filetype == "pdf") {
      var str =
        "<tr>" +
        '<td scope="row" class="ellipsis-text ellipsis-text--large">' +
        "<span>" +
        data[i].docname +
        "</span>" +
        "</td>" +
        '<td class="ellipsis-text hide-on-mobile" > ' +
        "<span >" +
        datatosizeconvert(data[i].docsize) +
        "</span > " +
        "</td> " +
        '<td class="ellipsis-text" > ' +
        "<span >" +
        getdateformat(data[i].createdtime) +
        "</span > " +
        "</td > " +
        '<td class="text-center" > ' +
        "<a onclick=\"deletedocmentconfirm('" +
        data[i].etag +
        "','" +
        data[i].uploadededby +
        '\')"  class="text-dark" > ' +
        '<i class="fa fa-trash-o fa-lg" ></i > ' +
        "</a > " +
        "</td > " +
        "</tr>";

      $("#tblImageDocContent").append(str);
    }
  }
}

function FnGetVideoDoc() {
  FnShowVideoDoc(documentdataall);
}

function datatosizeconvert(bytes) {
  if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return "-";
  if (typeof precision === "undefined") precision = 1;
  var units = ["bytes", "kB", "MB", "GB", "TB", "PB"],
    number = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +
    " " +
    units[number]
  );
}

function FnShowVideoDoc(data) {
  $("#tblVideoDocContent").empty();
  for (var i = 0; i < data.length; i++) {
    if (data[i].filetype == "video") {
      var str =
        "<tr>" +
        '<td scope="row" class="ellipsis-text ellipsis-text--large">' +
        "<span>" +
        data[i].docname +
        "</span>" +
        "</td>" +
        '<td class="ellipsis-text hide-on-mobile" > ' +
        "<span >" +
        datatosizeconvert(data[i].docsize) +
        "</span > " +
        "</td> " +
        '<td class="ellipsis-text" > ' +
        "<span >" +
        getdateformat(data[i].createdtime) +
        "</span > " +
        "</td > " +
        '<td class="text-center" > ' +
        "<a onclick=\"deletedocmentconfirm('" +
        data[i].etag +
        "','" +
        data[i].uploadededby +
        '\')"  class="text-dark" > ' +
        '<i class="fa fa-trash-o fa-lg" ></i > ' +
        "</a > " +
        "</td > " +
        "</tr>";
      $("#tblVideoDocContent").append(str);
    }
  }
}

function FnGetRecentUplodedDoc() {
  var user_id = getCookie("user_id");
  var userdataid = {
    uploadededby: user_id,
  };
  $.ajax({
    type: "POST",
    url: "/api/showdatadoc",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      documentdataall = data.reverse();

      FnGetDocumentCount();
      modeldocumnetlist(documentdataall);
      FnShowRecentUploadedDoc(documentdataall);
    },
    error: function (xhr, status, error) {},
  });
}

function inserintodb(datadoc) {
  //    console.log(datadoc)
  $.ajax({
    type: "POST",
    url: "/api/inserdocdata",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: datadoc,
    beforeSend: function () {},
    success: function (data) {
      FnGetRecentUplodedDoc();
    },
    error: function (xhr, status, error) {},
  });
}

function FnShowRecentUploadedDoc(data) {
  $("#tblRecentUploadedDoc").empty();
  for (var i = 0; i < data.length; i++) {
    var str =
      "<tr>" +
      '<td scope="row" class="ellipsis-text ellipsis-text--large">' +
      "<span>" +
      data[i].docname +
      "</span>" +
      "</td>" +
      '<td class="ellipsis-text hide-on-mobile" > ' +
      "<span >" +
      datatosizeconvert(data[i].docsize) +
      "</span > " +
      "</td> " +
      '<td class="ellipsis-text" > ' +
      "<span >" +
      getdateformat(data[i].createdtime) +
      "</span > " +
      "</td > " +
      '<td class="text-center" > ' +
      "<a onclick=\"deletedocmentconfirm('" +
      data[i].etag +
      "','" +
      data[i].uploadededby +
      '\')"  class="text-dark" > ' +
      '<i class="fa fa-trash-o fa-lg" ></i > ' +
      "</a > " +
      "</td > " +
      "</tr>";
    $("#tblRecentUploadedDoc").append(str);
  }
}

function modeldocumnetlist(data) {
  $("#videolistmodal").empty();
  $("#pdfdocumentlistmodal").empty();

  for (var i = 0; i < data.length; i++) {
    if (data[i].filetype == "video") {
      var str =
        '<li class="list-group-item">' +
        '<div class="form-check">' +
        '<input class="form-check-input" type="checkbox" etag="' +
        data[i].etag +
        '" docname="' +
        data[i].docname +
        '" doctype="' +
        data[i].filetype +
        '" value="' +
        data[i].documenurl +
        '" id="checkboxdoc">' +
        '<label class="form-check-label" for="video5">' +
        data[i].docname +
        "</label>" +
        " </div>" +
        "</li>";
      $("#videolistmodal").append(str);
    } else if (data[i].filetype == "image" || data[i].filetype == "pdf") {
      var str =
        '<li class="list-group-item">' +
        '<div class="form-check">' +
        '<input class="form-check-input" type="checkbox" etag="' +
        data[i].etag +
        '" docname="' +
        data[i].docname +
        '" doctype="' +
        data[i].filetype +
        '"  value="' +
        data[i].documenurl +
        '" id="checkboxdoc">' +
        '<label class="form-check-label" for="video5">' +
        data[i].docname +
        "</label>" +
        " </div>" +
        "</li>";
      $("#pdfdocumentlistmodal").append(str);
    }
  }
}

var fileuplen = 0;

function uploaddocaws() {
  if (document.getElementById("filedata").value != "") {
    $(".disableupload").attr(
      "style",
      "pointer-events: none;opacity:0.7; -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-o-user-select: none;user-select: none;"
    );
    $(".disableupload1").attr(
      "style",
      "pointer-events: none;opacity:0.7; -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-o-user-select: none;user-select: none;"
    );

    if (rams.length > 1) {
      uploaddocawsmulti(rams[fileuplen]);
    } else {
      uploaddocawsmulti(rams[0]);
    }
  } else {
    $("#alertupload").modal("toggle");
  }
}

function uploaddocawsmulti(file) {
  var pbaarupload = document.getElementById("pbaar");

  if (file) {
    AWS.config.update({
      accessKeyId: "AKIAJEKFDQWHJ5E6XV4A",
      secretAccessKey: "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",
      region: "us-east-1",
    });
    var s3 = new AWS.S3();

    var params = {
      Bucket: "roboxadata",
      Key: file.name,
      ContentType: file.type,
      Body: file,
      ACL: "public-read",
    };
    // $scope.uploadfilename=file.name;
    var uploadfilename = document.getElementById("uploadfilename");
    uploadfilename.innerText = file.name;
    // s3.putObject(params, function (err, res) {

    // });
    var uploadprogress = document.getElementById("uploadprogress");
    uploadprogress.style.display = "block";
    pbaarupload.innerText = "Please wait...";
    var request = s3.putObject(params);
    request.on("httpUploadProgress", function (progress) {
      pbaarupload.innerText =
        Math.round((progress.loaded / progress.total) * 100) + "%";

      pbaarupload.setAttribute(
        "style",
        "width: " + Math.round((progress.loaded / progress.total) * 100) + "%"
      );
    });
    request.on("success", function (response) {
      // logs a value like "cherries.jpg" returned from DynamoDB

      pbaarupload.innerText = " uploaded successfully";
      //document.getElementById('filedata').value='';
      //removefile()

      var user_id = getCookie("user_id");
      var ftypedata = file.type.split("/")[0];
      if (ftypedata == "application") {
        ftypedata = "pdf";
      }
      var myobj = {
        uploadededby: user_id,
        documenurl: "https://s3.amazonaws.com/roboxadata/" + file.name,
        docname: file.name,
        docsize: file.size.toString(),
        createdtime: new Date(),
        filetype: ftypedata,
        etag: response.data.ETag.replace(/"/g, ""),
      };
      inserintodb(JSON.stringify(myobj));
      setTimeout(function () {
        uploadprogress.style.display = "none";

        pbaarupload.setAttribute("style", "width:0%");
        pbaarupload.innerText = "Please wait...";
        if (rams.length > 1) {
          if (rams.length - 1 != fileuplen) {
            fileuplen = fileuplen + 1;
            uploaddocaws();
          } else {
            document.getElementById("filedata").value = "";
            removefile();
            rams = [];
            ramsname = [];
            fileuplen = 0;
            $(".disableupload1").attr("style", "");
            $(".disableupload").attr("style", "");
          }
        } else {
          document.getElementById("filedata").value = "";
          removefile();
          rams = [];
          ramsname = [];
          fileuplen = 0;
          $(".disableupload1").attr("style", "");
          $(".disableupload").attr("style", "");
        }
      }, 200);
    });
    request.send();
  } else {
    $("#alertupload").modal("toggle");
  }
}

//delete docment
function deletedocmentconfirm(etag, id) {
  deletemodlcall(etag, id);
}

function deletemodlcall(id, usrid) {
  $("#deletemodal").empty();
  var str =
    '<div class="delete-modal-text">' +
    " Do you want to delete this item?" +
    ' <div class="delete-modal-btns-row">' +
    '  <button type="button" class="btn btn-success btn-lg"  data-dismiss="modal" onclick="deletedocmentsingle(\'' +
    id +
    "','" +
    usrid +
    "')\">Yes</button>" +
    '    <button type="button" class="btn btn-outline-dark btn-lg" data-dismiss="modal">Cancel</button>' +
    "</div>" +
    " </div>";

  $("#deletemodal").append(str);
  $("#modalDelete").modal("toggle");
}

function deletedocmentsingle(etagid, userid) {
  var deleteobj = {
    etag: etagid,
    user_id: userid,
  };

  $.ajax({
    type: "POST",
    url: "/api/deletedocdata",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(deleteobj),
    beforeSend: function () {},
    success: function (data) {
      FnGetRecentUplodedDoc();
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function senddoctoglasssocket() {
  var docArray = [];
  $("input:checkbox[id=checkboxdoc]:checked").each(function () {
    docArray.push({
      url: $(this).val(),
      docname: $(this).attr("docname"),
      doctype: $(this).attr("doctype"),
      etag: $(this).attr("etag"),
    });
  });
  console.log(JSON.stringify(docArray));

  var objsenddoc = {
    user_id: getCookie("user_id"),
    otheruser_id: calleridfordocsave,
    callid: uniqcallid,
    doclist: docArray,
  };
  console.log(JSON.stringify(objsenddoc));
  $.ajax({
    type: "POST",
    url: "/api/saveglasswisedoclist",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(objsenddoc),
    beforeSend: function () {},
    success: function (data) {
      isShredoc = 1;
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
  setTimeout(function () {
    socket.emit("sharedDoc", objsenddoc);

    if ($(this).attr("checked")) $("input:checkbox").attr("checked", "checked");
    else $("input:checkbox").removeAttr("checked");
  }, 300);
}

function get_time_diff(first, second) {
  var fromTime = new Date(first);
  var toTime = new Date(second);

  var differenceTravel = toTime.getTime() - fromTime.getTime();
  var seconds = Math.floor(differenceTravel / 1000);
  seconds = Number(seconds);
  var h = pad(Math.floor(seconds / 3600));
  var m = pad(Math.floor((seconds % 3600) / 60));
  var s = pad(Math.floor((seconds % 3600) % 60));

  function pad(n) {
    return n < 10 ? "0" + n : n;
  }

  var hDisplay = h > 0 ? h + (h == 1 ? ":" : ":") : "00:";
  var mDisplay = m > 0 ? m + (m == 1 ? ":" : ":") : "00:";
  var sDisplay = s > 0 ? s + (s == 1 ? ":" : ":") : "00";
  return hDisplay + mDisplay + sDisplay;
}

function getdateformat(datestring) {
  var today = new Date(datestring);
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  var today = dd + "/" + mm + "/" + yyyy;
  return today;
}

function getdateTimeformat(datestring) {
  var today = new Date(datestring);
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();

  var hh = today.getHours();
  var m = today.getMinutes();
  var ss = today.getSeconds();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  if (hh < 10) {
    hh = "0" + hh;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (ss < 10) {
    ss = "0" + ss;
  }
  var today = dd + "/" + mm + "/" + yyyy + " " + hh + ":"+ m + ":"+ ss;
  return today;
}

function getsecondsvalue(first, second) {
  var fromTime = new Date(first);
  var toTime = new Date(second);
  var differenceTravel = toTime.getTime() - fromTime.getTime();
  var seconds = Math.floor(differenceTravel / 1000);
  return seconds;
}

function getsecondsumval(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor((seconds % 3600) % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? ":" : ":") : "00:";
  var mDisplay = m > 0 ? m + (m == 1 ? ":" : ":") : "00:";
  var sDisplay = s > 0 ? s + (s == 1 ? ":" : ":") : "00";
  return hDisplay + mDisplay + sDisplay;
}

function allcalldatadetail(allcallaraysorted) {
  allcallaraysorted.forEach(function (i, v) {
    if (i.type == "outgoing") {
      allcallaraysorted[v].countcallout = 1;
      allcallaraysorted[v].countcallrcv = 0;
    } else {
      allcallaraysorted[v].countcallrcv = 1;
      allcallaraysorted[v].countcallout = 0;
    }
    allcallaraysorted[v].uniquekey = getdateformat(i.start_date);
    allcallaraysorted[v].calldurtion = parseInt(
      getsecondsvalue(i.start_date, i.end_date)
    );
    allcallaraysorted[v].callcountall = "1";

    if (allcallaraysorted.length == eval(v + 1)) {
      finalcallsummary = groupArray(
        allcallaraysorted,
        "uniquekey",
        onMergeCallback
      );
    }
  });
}

function groupArray(dataarr, key, onMerge) {
  if (dataarr.length === 0) {
    return [];
  }
  var pref, i;
  // sort by key
  dataarr.sort(function (a, b) {
    return a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0;
  });
  // loop through the array grouping objects by key
  pref = dataarr[0][key];
  for (i = 1; i < dataarr.length; i++) {
    if (dataarr[i][key] === pref) {
      //merge 2 items, call the onMerge callback
      dataarr[i - 1] = onMerge(dataarr[i - 1], dataarr[i]);
      //remove the element
      dataarr.splice(i, 1);
      // set i one back
      i--;
    }
    pref = dataarr[i][key];
  }
  return dataarr;
}
// functon that will be called when 2 items are merged
// stay will stay and gone will be gone
// this function is specific to your data type
function onMergeCallback(stay, gone) {
  // console.log(stay,gone)

  stay.calldurtion = eval(
    parseInt(stay.calldurtion) + parseInt(gone.calldurtion)
  );
  stay.callcountall = stay.callcountall + "" + gone.callcountall;

  stay.countcallout = stay.countcallout + "" + gone.countcallout;
  stay.countcallrcv = stay.countcallrcv + "" + gone.countcallrcv;

  return stay;
}

var video;
var context;
var canvas;

function getscreenshot() {
  disablecalldiv();
  setTimeout(function () {
    canvasdrwaH = 360;
    canvasdrwaW = 640;

    getscreenshot2();
  }, 200);
}

function getscreenshot2() {
  $("#screenshotvideo").show();
  $("#video-data").hide();

  video = document.getElementById("remoteVideo");

  canvas = document.getElementById("ram");
  context = canvas.getContext("2d");

  snap();
}

function fitToContainer(canvas) {
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  // ...then set the internal size to match
  canvas.width = canvasdrwaW;
  canvas.height = canvasdrwaH;
}

function cancelscreenshot() {
  enablecalldiv();
  $("#pills-video2-tab").click();
  $("#screenshotvideo").hide();
  $("#video-data").show();
}

function savescreenshot() {
  $("#screenshotvideo").hide();
  $("#video-data").show();

  enablecalldiv();
  $("#pills-video2-tab").click();

  var dataUrl = canvas.toDataURL("image/jpeg");
  var blobData = dataURItoBlob(dataUrl);
  var namefile = Math.floor(Math.random() * 96466465465) + ".png";
  AWS.config.update({
    accessKeyId: "AKIAJEKFDQWHJ5E6XV4A",
    secretAccessKey: "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",
    region: "us-east-1",
  });
  var s3 = new AWS.S3();
  var params = {
    Bucket: "roboxadata",
    Key: namefile,
    ContentType: "image/png",
    Body: blobData,
    ACL: "public-read",
  };

  var request = s3.putObject(params);

  request.on("success", function (response) {
    var requestdsdds = JSON.stringify({
      url: "https://s3.amazonaws.com/roboxadata/" + namefile,
      user_id: getCookie("user_id"),
      other_user_id: callotheruserid,
      callid: uniqcallid,
      doctype: "image",
      from: "web",
    });

    isShreevidence = 1;
    inserevidentodb(requestdsdds);
  });
  request.send();
}

function dataURItoBlob(dataURI) {
  var binary = atob(dataURI.split(",")[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: "image/jpeg",
  });
}

function openshareddoc(idx) {
  showloader();

  var userdataid = {
    callid: idx,
  };

  $.ajax({
    type: "POST",
    url: "/api/getglasswisedoclist",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    beforeSend: function () {},
    success: function (data) {
      if (data.length == 0) {
        hideloader();
      } else {
        hideloader();
        appenddoclistmodal(data.doclist);
      }
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function opensharedevidence(idx) {
  showloader();

  var userdataid = {
    callid: idx,
  };

  $.ajax({
    type: "POST",
    url: "/api/viewevidence",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    beforeSend: function () {},
    success: function (data) {
      hideloader();
      appendEvidencelistmodal(data);
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function opensupooerevidence(idx) {
  showloader();

  var userdataid = {
    callid: idx,
  };

  $.ajax({
    type: "POST",
    url: "/api/viewevidence",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    beforeSend: function () {},
    success: function (data) {
      hideloader();
      appendsuppoermodal(data);
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function appendsuppoermodal(data) {
  $("#sharedevidencemodal").empty();
  for (var i = 0; i < data.length; i++) {
    var str = "";
    if (data[i].doctype == "image" && data[i].from == "websupport") {
      str = '<img  class="ramimageslider2" src="' + data[i].url + '" />';
      $("#sharedevidencemodal").append(str);
    }
  }

  setTimeout(function () {
    $("body").picEyes({
      classSelect: "ramimageslider2",
    });
    $(".ramimageslider2")[0].click();
  }, 500);
}

function appendEvidencelistmodal(data) {
  $("#sharedevidencemodal").empty();
  for (var i = 0; i < data.length; i++) {
    var str = "";
    if (data[i].doctype == "image" && data[i].from != "websupport") {
      if (data[i].from == "glass" || data[i].from == "web") {
        str = '<img  class="ramimageslider2" src="' + data[i].url + '" />';
        $("#sharedevidencemodal").append(str);
      }
    } else if (data[i].doctype == "video") {
      str = '<a  class="ramimageslider2" href="' + data[i].url + '" /></a>';

      $("#sharedevidencemodal").append(str);
    } else if (data[i].doctype == "pdf") {
      str = '<p  class="ramimageslider2" href="' + data[i].url + '" /></p>';

      $("#sharedevidencemodal").append(str);
    }

    setTimeout(function () {
      $("body").picEyes({
        classSelect: "ramimageslider2",
      });
      $(".ramimageslider2")[0].click();
    }, 500);
  }
}

function appenddoclistmodal(data) {
  $("#shareddocmodal").empty();

  for (var i = 0; i < data.length; i++) {
    var str = "";
    if (data[i].doctype == "image") {
      str = '<img  class="ramimageslider" src="' + data[i].url + '" />';
      $("#shareddocmodal").append(str);
    } else if (data[i].doctype == "video") {
      str =
        '<a  class="ramimageslider" href="' +
        data[i].url.replace(/ /g, "%20") +
        '" /></a>';

      $("#shareddocmodal").append(str);
    } else {
      str = '<p  class="ramimageslider" href="' + data[i].url + '" /></p>';

      $("#shareddocmodal").append(str);
    }

    setTimeout(function () {
      $("body").picEyes({
        classSelect: "ramimageslider",
      });
      $(".ramimageslider")[0].click();
    }, 500);
  }
}

function snap() {
  fitToContainer(canvas);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
}

function showloader() {
  $("#myOverlay").show();
  $("#loadingGIF").show();
}

function hideloader() {
  $("#myOverlay").hide();
  $("#loadingGIF").hide();
}

function logout() {
  console.log("Inside Logout");
  var logoutdata = {
    user_id: getCookie("user_id"),
  };

  //localStorage.clear()
  // localStorage.setItem("loggeduserdata", "");
  // localStorage.setItem("roboxa_remember_me", "");

  $.ajax({
    url: "/api/userlogout",
    type: "POST",
    data: JSON.parse(window.localStorage.getItem("loggeduserdata")),
    success: function (result) {
      console.log("Logout Success");
      // setCookie("user_id", "", 10);
      // const tempUrl = new URL(window.location.href);
      window.location.href = "https://" + window.location.host;
      // window.location.href = tempUrl.origin;
      // window.location.href = "http://"  window.location.host
      // localStorage.clear()
      // localStorage.setItem('loggeduserdata', '');
      //localStorage.setItem('roboxa_remember_me', '');
      if (!JSON.parse(window.localStorage.getItem("roboxa_remember_me")))
        localStorage.clear();
      //localStorage.clear()
    },
    error: function (err) {
      console.log(err);
    },
  });
}

function playPause() {
  if (pluginvideoid.paused) pluginvideoid.play();
  else pluginvideoid.pause();
}

function stopcalllpeer() {}

function roboxaiconrefresh() {
  window.location.href =
    "/workers?user_id=" +
    JSON.parse(window.localStorage.getItem("loggeduserdata"))._id;
}

function showhidcalltext(a) {
  if (a.textContent == "Show") {
    a.textContent = "Hide";
  } else {
    a.textContent = "Show";
  }
}

function chnagepanesize(size) {
  pensize = parseInt(size);
}

//drawing canvas
var canvas33, canvasPsudo, contextPsudo;
var drawinit = 0;
var colorcanvasdrawline = "red";
var pensize = 3;
var scaleParameter = 1;
var tooltype = "draw";

var canvasdrawdataurl;

function drawimagein() {
  disablecalldiv();
  setTimeout(function () {
    canvasdrwaH = 356;
    canvasdrwaW = 636;

    drawimagein2();
  }, 200);
}

function drawimagein2() {
  video = document.getElementById("remoteVideo");
  $("#screenshotvideocanvas").show();
  $("#video-data").hide();
  canvas33 = document.getElementById("drawSpace");
  context = canvas33.getContext("2d");

  //	PSUDO CANVAS ADDED FOR DRAWING GUID FOR DRAWING SHAPES
  canvasPsudo = document.getElementById("psudoCanvas");
  contextPsudo = canvasPsudo.getContext("2d");

  fitToContainer(canvas33);
  fitToContainer(canvasPsudo);
  context.drawImage(video, 0, 0, canvas33.width, canvas33.height);

  var canvasx = $(canvas33).offset().left;
  var canvasy = $(canvas33).offset().top;
  var last_mousex = (last_mousey = 0);
  var drawing_X = (drawing_Y = 0); //	variable to store vertex values for drawing shapes
  var mousex = (mousey = 0);
  var mousedown = false;

  if (drawinit == "0") {
    drawinit = 1;
    //Mousedown
    $(canvasPsudo).on("mousedown", function (e) {
      drawing_X = last_mousex = mousex = parseInt(e.clientX - canvasx);
      drawing_Y = last_mousey = mousey = parseInt(e.clientY - canvasy);
      mousedown = true;
    });

    //Mouseup
    $(canvasPsudo).on("mouseup", function (e) {
      mousedown = false;
      var leftScroll = $("#drawCanvasParent").scrollLeft();
      var topScroll = $("#drawCanvasParent").scrollTop();
      if (tooltype == "rect") {
        //	DRAW RECTANGLE ON CANVAS
        context.clearRect(0, 0, context.width, context.height);
        context.beginPath();
        var width = mousex - drawing_X;
        var height = mousey - drawing_Y;
        context.rect(
          drawing_X + leftScroll,
          drawing_Y + topScroll,
          width,
          height
        );
        context.strokeStyle = colorcanvasdrawline;
        context.lineWidth = pensize;
        context.stroke();
        contextPsudo.clearRect(0, 0, canvasPsudo.width, canvasPsudo.height);
      } else if (tooltype == "circle") {
        //	DRAW CIRCLE ON CANVAS
        context.clearRect(0, 0, context.width, context.height); //clear canvas
        //Save
        context.save();
        context.beginPath();
        //Dynamic scaling
        var scalex = 1 * ((mousex - drawing_X) / 2);
        var scaley = 1 * ((mousey - drawing_Y) / 2);
        context.scale(scalex, scaley);
        //Create ellipse
        var centerx = (drawing_X + leftScroll) / scalex + 1;
        var centery = (drawing_Y + topScroll) / scaley + 1;
        context.arc(centerx, centery, 1, 0, 2 * Math.PI);
        //Restore and draw
        context.restore();
        context.strokeStyle = colorcanvasdrawline;
        context.lineWidth = pensize;
        context.stroke();
        contextPsudo.clearRect(0, 0, canvasPsudo.width, canvasPsudo.height);
      }
    });

    //Mousemove
    $(canvasPsudo).on("mousemove", function (e) {
      mousex = parseInt(e.clientX - canvasx);
      mousey = parseInt(e.clientY - canvasy);
      var leftScroll = $("#drawCanvasParent").scrollLeft();
      var topScroll = $("#drawCanvasParent").scrollTop();
      if (mousedown) {
        if (tooltype == "draw") {
          context.clearRect(0, 0, context.width, context.height);
          context.beginPath();
          context.moveTo(last_mousex + leftScroll, last_mousey + topScroll);
          context.lineCap = "round";
          context.lineWidth = pensize;
          context.lineTo(mousex + leftScroll, mousey + topScroll);
          context.strokeStyle = colorcanvasdrawline;
          context.stroke();
        } else if (tooltype == "rect") {
          //	GUIDE BEFORE DRAWING ACTUAL RECTANGLE WITHIN CANVAS
          contextPsudo.clearRect(0, 0, canvasPsudo.width, canvasPsudo.height);
          contextPsudo.beginPath();
          var width = mousex - drawing_X;
          var height = mousey - drawing_Y;
          contextPsudo.rect(
            drawing_X + leftScroll,
            drawing_Y + topScroll,
            width,
            height
          );
          contextPsudo.strokeStyle = colorcanvasdrawline;
          contextPsudo.lineWidth = pensize;
          contextPsudo.stroke();
        } else if (tooltype == "circle") {
          //	GUIDE BEFORE DRAWING ACTUAL CIRCLE WITHIN CANVAS
          contextPsudo.clearRect(0, 0, canvasPsudo.width, canvasPsudo.height); //clear canvas
          //Save
          contextPsudo.save();
          contextPsudo.beginPath();
          //Dynamic scaling
          var scalex = 1 * ((mousex - drawing_X) / 2);
          var scaley = 1 * ((mousey - drawing_Y) / 2);
          contextPsudo.scale(scalex, scaley);
          //Create ellipse
          var centerx = (drawing_X + leftScroll) / scalex + 1;
          var centery = (drawing_Y + topScroll) / scaley + 1;
          contextPsudo.arc(centerx, centery, 1, 0, 2 * Math.PI);
          //Restore and draw
          contextPsudo.restore();
          contextPsudo.strokeStyle = colorcanvasdrawline;
          contextPsudo.lineWidth = pensize;
          contextPsudo.stroke();
        }
      }
      last_mousex = mousex;
      last_mousey = mousey;
      //Output
      //$('#output').html('current: '+mousex+', '+mousey+'<br/>last: '+last_mousex+', '+last_mousey+'<br/>mousedown: '+mousedown);
    });
  }

  canvasdrawdataurl = canvas33.toDataURL("image/jpeg");
}

// change drawing option LINE/RECTANGLE/CIRCLE
function changeDrawingStyle(type) {
  tooltype = type;
  changeActiveState(type);
}

// CHAGNE ACTIVE BUTTONS ICONS
function changeActiveState(type) {
  if (type == "draw") {
    //var src = ($('#freeHandTool').attr('src') === "images/free-hand-active.png") ? "images/free-hand.png"	: "images/free-hand-active.png";
    $("#freeHandTool").attr("src", "images/free-hand-active.png");
    $("#drawRectTool").attr("src", "images/rectange-line.png");
    $("#drawCircleTool").attr("src", "images/circle-line.png");
    //$("#drawLineTool").attr("src", "images/line.png");
  } else if (type == "rect") {
    //var src = ($('#drawRectTool').attr('src') === "images/rectange-line.png") ? "images/rectange-line-active.png"	: "images/rectange-line.png";
    $("#drawRectTool").attr("src", "images/rectange-line-active.png");
    $("#freeHandTool").attr("src", "images/free-hand.png");
    $("#drawCircleTool").attr("src", "images/circle-line.png");
   // $("#drawLineTool").attr("src", "images/line.png");
  } else if (type == "circle") {
    //var src = ($('#drawCircleTool').attr('src') === "images/circle-line.png") ? "images/circle-line-active.png"	: "images/circle-line.png";
    $("#drawCircleTool").attr("src", "images/circle-line-active.png");
    $("#drawRectTool").attr("src", "images/rectange-line.png");
    $("#freeHandTool").attr("src", "images/free-hand.png");
   // $("#drawLineTool").attr("src", "images/line.png");
  } /*else if (type == "line") {
    //var src = ($('#drawRectTool').attr('src') === "images/rectange-line.png") ? "images/rectange-line-active.png"	: "images/rectange-line.png";
    $("#drawLineTool").attr("src", "images/line-active.png");
    $("#freeHandTool").attr("src", "images/free-hand.png");
    $("#drawRectTool").attr("src", "images/rectange-line.png");
    $("#drawCircleTool").attr("src", "images/circle-line.png");
  }*/ else if (type == "up") {
    //var src = ($('#zoomUpTool').attr('src') === "images/img-zoom.png") ? "images/img-zoom-active.png"	: "images/img-zoom.png";
    $("#zoomUpTool").attr("src", "images/img-zoom-active.png");
    $("#zoomDownTool").attr("src", "images/zoom-out.png");
  } else if (type == "down") {
    //var src = ($('#zoomDownTool').attr('src') === "images/zoom-out.png") ? "images/zoom-out-active.png"	: "images/zoom-out.png";
    $("#zoomDownTool").attr("src", "images/zoom-out-active.png");
    if (scaleParameter == 1) {
      $("#zoomDownTool").attr("src", "images/zoom-out.png");
    }
    $("#zoomUpTool").attr("src", "images/img-zoom.png");
  }
}

// zoom function used for zoomin zoomout.
function zoom(key) {
  changeActiveState(key);
  var tempCanvas = document.createElement("canvas");
  var tctx = tempCanvas.getContext("2d");
  var cw = canvas33.width;
  var ch = canvas33.height;
  tempCanvas.width = cw;
  tempCanvas.height = ch;
  tctx.drawImage(canvas33, 0, 0);
  $("#drawCanvasParent").scrollLeft(0);
  $("#drawCanvasParent").scrollTop(0);
  if (key === "up") {
    if (scaleParameter >= 1 && scaleParameter < 1.75) {
      scaleParameter += 0.25;
      canvasPsudo.width = canvas33.width = parseInt(
        canvas33.width * scaleParameter
      );
      canvasPsudo.height = canvas33.height = parseInt(
        canvas33.height * scaleParameter
      );
      var ctx = canvas33.getContext("2d");
      ctx.clearRect(0, 0, cw, ch);

      ctx.drawImage(
        tempCanvas,
        0,
        0,
        cw,
        ch,
        0,
        0,
        cw * scaleParameter,
        ch * scaleParameter
      );
      //contextPsudo.drawImage(0,0,cw*scaleParameter,ch*scaleParameter);
    } else {
      $("#zoomUpTool").attr("src", "images/img-zoom.png");
      $("#zoomDownTool").attr("src", "images/zoom-out.png");
    }
    scrollCenter();
  } else if (key === "down") {
    if (scaleParameter > 1 && !(scaleParameter < 1)) {
      canvasPsudo.width = canvas33.width = parseInt(
        canvas33.width / scaleParameter
      );
      canvasPsudo.height = canvas33.height = parseInt(
        canvas33.height / scaleParameter
      );
      var ctx = canvas33.getContext("2d");
      ctx.clearRect(0, 0, cw, ch);

      ctx.drawImage(
        tempCanvas,
        0,
        0,
        cw,
        ch,
        0,
        0,
        cw / scaleParameter,
        ch / scaleParameter
      );
      //contextPsudo.drawImage(0,0,cw/scaleParameter,ch/scaleParameter);
      scrollCenter();
      scaleParameter -= 0.25;
    } else {
      $("#zoomUpTool").attr("src", "images/img-zoom.png");
      $("#zoomDownTool").attr("src", "images/zoom-out.png");
    }
  }
}

// scrollCenter function used for zooming in/out from center of the canvas.
function scrollCenter() {
  let widthScroll = parseInt(canvas33.width);
  let heightScroll = parseInt(canvas33.height);
  $("#drawCanvasParent").scrollLeft(widthScroll);
  $("#drawCanvasParent").scrollTop(heightScroll);
  let widthOffset = parseInt($("#drawCanvasParent").scrollLeft());
  let heightOffset = parseInt($("#drawCanvasParent").scrollTop());
  $("#drawCanvasParent").scrollLeft(widthOffset / 2);
  $("#drawCanvasParent").scrollTop(heightOffset / 2);
}

function changecolocode(clr) {
  colorcanvasdrawline = "#" + clr;
}

function sendcanvastoserver() {
  $("#sendingevidence").show();

  var dataUrl = canvas33.toDataURL("image/jpeg");
  var blobData = dataURItoBlob(dataUrl);
  var namefile = Math.floor(Math.random() * 96466465465) + ".jpg";
  AWS.config.update({
    accessKeyId: "AKIAJEKFDQWHJ5E6XV4A",
    secretAccessKey: "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",
    region: "us-east-1",
  });
  var s3 = new AWS.S3();
  var params = {
    Bucket: "roboxadata",
    Key: namefile,
    ContentType: "image/jpeg",
    Body: blobData,
    ACL: "public-read",
  };

  var request = s3.putObject(params);

  request.on("success", function (response) {
    $("#screenshotvideocanvas").hide();
    $("#video-data").show();
    isSharesupport = 1;
    enablecalldiv();
    $("#sendingevidence").hide();
    $("#pills-video2-tab").click();
    var requestdsdds = {
      url: "https://s3.amazonaws.com/roboxadata/" + namefile,
      user_id: getCookie("user_id"),
      other_user_id: calleridfordocsave,
      callid: uniqcallid,
      doctype: "image",
      from: "websupport",
    };

    socket.emit("canvsdata", requestdsdds);

    inserevidentodb(JSON.stringify(requestdsdds));
  });
  request.send();
}

function cancelcanvassend() {
  enablecalldiv();
  $("#pills-video2-tab").click();
  context.clearRect(0, 0, canvas33.width, canvas33.height);
  $("#screenshotvideocanvas").hide();
  $("#video-data").show();
}

function clearcanvasdraw() {
  // context.clearRect(0, 0, canvas33.width, canvas33.height);
  //fitToContainer(canvas33)
  var img = document.createElement("img");
  img.src = canvasdrawdataurl;

  context.drawImage(img, 0, 0, canvas33.width, canvas33.height);
}

//	VIDEO ZOOM FUNCTIONALITY
//	VIA SOCKETS
var video_zoom_val = 1; //	VARIABLE TO SAVE ZOOM SCALE
var min_vzoom_val = 1;
var max_vzoom_val = 2;
var left_scroll_by = 0;
var top_scroll_by = 0;

// ZOOM IN FUNCTION
function zoom_in_video() {
  if (video_zoom_val < max_vzoom_val && !(video_zoom_val >= max_vzoom_val)) {
    video_zoom_val += 0.5;
  }
  applyZoomStyle();
  var zoom = {
    room_id: calleridfordocsave + getCookie("user_id"),
    zoom_in_user: video_zoom_val, //  zoom_value 0 to 8
  };
  socket.emit("zoom_in_user", zoom);
}
//	ZOOM OUT FUNCTION
function zoom_out_video() {
  if (video_zoom_val > min_vzoom_val && !(video_zoom_val <= min_vzoom_val)) {
    video_zoom_val -= 0.5;
  }
  applyZoomStyle();
  var zoom = {
    room_id: calleridfordocsave + getCookie("user_id"),
    zoom_out_user: video_zoom_val, //  zoom_value 0 to 8
  };
  socket.emit("zoom_out_user", zoom);
}
//	FUNCTION TO SCROLL ZOOMED VIDEO
function moveZoomedVideo(param) {
  if (video_zoom_val > 1) {
    if (param == "right") {
      //	MOVE RIGHT
      $("#remoteVideo").css(
        "left",
        `${parseInt($("#remoteVideo").css("left")) + left_scroll_by}px`
      );
    } else if (param == "down") {
      //	MOVE DOWN
      $("#remoteVideo").css(
        "top",
        `${parseInt($("#remoteVideo").css("top")) + top_scroll_by}px`
      );
    } else if (param == "left") {
      //	MOVE LEFT
      $("#remoteVideo").css(
        "left",
        `${parseInt($("#remoteVideo").css("left")) - left_scroll_by}px`
      );
    } else if (param == "up") {
      //	MOVE TOP
      $("#remoteVideo").css(
        "top",
        `${parseInt($("#remoteVideo").css("top")) - top_scroll_by}px`
      );
    }
  }
}
//	APPLY ZOOM EFFECT TO VIDEO TAG
function applyZoomStyle() {
  $("#remoteVideo").css("left", "0px");
  $("#remoteVideo").css("top", "0px");
  $("#remoteVideo").css("-moz-transform", "scale(" + video_zoom_val + ")");
  $("#remoteVideo").css("-webkit-transform", "scale(" + video_zoom_val + ")");
  $("#remoteVideo").css("-o-transform", "scale(" + video_zoom_val + ")");
  $("#remoteVideo").css("-ms-transform", "scale(" + video_zoom_val + ")");
  $("#remoteVideo").css("transform", "scale(" + video_zoom_val + ")");
  if (video_zoom_val > 1) {
    left_scroll_by = Math.abs(parseInt($("#remoteVideo").offset().left));
    top_scroll_by = Math.abs(parseInt($("#remoteVideo").offset().top));
  } else {
    left_scroll_by = 0;
    top_scroll_by = 0;
  }
}

//	ZOOM VIDEO IN MODEL
function popUpVideoModel() {
  $("#remoteVideo").appendTo($("#videoZoomModal").find(".modal-body"));
  $("#remoteVideo")
    .css({
      position: "unset",
      width: "640px",
      height: "320px",
    })
    .addClass("mx-auto my-auto");
  $("#videoZoomModal").modal("show");
}

//	SOCKETS FOR ZOOM IN AND OUT
socket.on("zoom_in_user", function (args) {
  if (args.zoom_in_user <= max_vzoom_val && !(video_zoom_val > max_vzoom_val)) {
    video_zoom_val = parseFloat(args.zoom_in_user);
    popUpVideoModel();
    applyZoomStyle();
  }
});
socket.on("zoom_out_user", function (args) {
  if (
    args.zoom_out_user > min_vzoom_val &&
    !(video_zoom_val <= min_vzoom_val)
  ) {
    video_zoom_val = parseFloat(args.zoom_out_user);
    applyZoomStyle();
  }
});

// notification

function getAllnotification() {
  $.ajax({
    type: "POST",
    url: "/api/listNotification/",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify({
      supervisor_id: JSON.parse(window.localStorage.getItem("loggeduserdata"))
        ._id,
    }),
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      console.log(data.data);
      data = data.data;
      console.log("data");

      // the code you're looking for
      var needle = "active";
      $("#notifDropDownlist").empty();
      var firstcheck = false;
      // iterate over each element in the array
      for (var i = 0; i < data.length; i++) {
        // look for the entry with a matching `code` value
        var notificationdetaillist =
          '<a class="dropdown-item" style="border-top:1px solid #e9ecef;">' +
          '<div class="media">' +
          '<img class="img-fluid mr-3" style="max-width:32px;" src="images/worker.png" alt="Technician">' +
          '<div class="media-body" style="line-height:1em;">' +
          '<h6 class="mt-0 mb-0" style="font-size:0.9em;">' +
          data[i].name +
          "</h6>" +
          '<span style="font-size:0.8em">GID: ' +
          data[i].glass_id +
          " | " +
          data[i].location +
          "<span>" +
          "</div>" +
          "</div>" +
          "</a>";

        $("#notifDropDownlist").append(notificationdetaillist);

        if (data[i].status == needle) {
          // we found it
          firstcheck = true;
          // console.log(data[i].name)
          noticount.textContent = eval(parseInt(noticount.textContent) + 1);
        } else {
          if (!firstcheck) {
            noticount.textContent = 0;
          }
        }
      }

      // $("#filenameshow").empty()
      //     for (var i=0; i<data.length; i++) {

      // var str='<li id="fileup'+i+'">'+rams[i].name+'<span> <a onclick="removefilesingle(\''+i+'\')"> <i class="fa fa-times" ></i> </a> </span></li>';

      // $("#filenameshow").append(str)
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function readAllnotification() {
  $.ajax({
    type: "POST",
    url: "/api/readallnotification/",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify({
      supervisor_id: JSON.parse(window.localStorage.getItem("loggeduserdata"))
        ._id,
    }),
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      getAllnotification();
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

socket.on("desktopnotification", function (data) {
  if (data) {
    readAllnotification();
  }

  // Push.create("Mark Calling",{
  //             body: "Mark is looking for your help",
  //             icon: "img/logo.png",

  //             onClick: function () {
  //                 window.location="http://52.15.113.161:4057";
  //                 this.close();
  //             }
  //         });
});

// NEW EVIDENCE TAB CODE
function getTimeformat(datestring) {
  var today = new Date(datestring);
  var hh = today.getHours();
  var mm = today.getMinutes();
  var ss = today.getSeconds();
  if (hh < 10) {
    hh = "0" + hh;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  if (ss < 10) {
    ss = "0" + ss;
  }
  var today = hh + ":" + mm + ":" + ss;
  return today;
}
$("#v-pills-evidence-tab").on("click", function (e) {
  FnGetWorkerListByCallHistory();
});

function FnGetWorkerListByCallHistory() {
  showloader();
  var user_id = getCookie("user_id");
  var request = JSON.stringify({
    supervisor_id: user_id,
  });
  $.ajax({
    type: "POST",
    url: "/api/nocallworkers",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: request,
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      console.log("=====");
      console.log(data);
      console.log("=====");

      hideloader();
      FnShowEvidenceWithoutCall(data);
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function FnShowEvidenceWithoutCall(data) {
  $("#noCallsEvidence").empty();
  // for (var i = 0; i < data.length; i++) {
  //     data[i].user_id = data[i]._id
  //     workerListIds.push(data[i].user_id);
  //     var tblContent =
  //         '<tr>' +
  //         '<td scope="row" class="ellipsis-text"><span>' + data[i].f_name + ' ' + data[i].l_name + '</span></td>' +
  //         // '<td scope="row" class="ellipsis-text"><span>' + data[i].email + '</span></td>' +
  //         // '<td scope="row" class="ellipsis-text"><span>' + data[i].glass_id + '</span></td>' +
  //         // '<td scope="row" class="ellipsis-text"><span>' + data[i].location + '</span></td>' +
  //         // '<td scope="row" class="ellipsis-text"><span id="span5' + data[i]._id + '">Inactive</span></td>' +
  //         '<td><button disabled type="button" name="' + data[i].f_name + ' ' + data[i].l_name + "," + data[i].glass_id + "," + data[i].location + '" id="' + data[i].user_id + '" class="btn btn-success btn-sm" data-toggle="modal" OnClick="makeCall(this)">Call</button></td>' +
  //         '</tr>';
  //     $('#noCallsEvidence').append(tblContent);
  // }
  for (var i = 0; i < data.length; i++) {
    var str =
      '<div class="card">' +
      '<div class="card-header" id="headingOne">' +
      '<div class="row">' +
      '<div class="col-4 col-sm-3 ellipsis-text">' +
      "<span>" +
      data[i].f_name +
      " " +
      data[i].l_name +
      "</span>" +
      "</div>" +
      '<div class="col-3 col-sm-2 ellipsis-text">' +
      "<span>" +
      data[i].glass_id +
      "</span>" +
      "</div>" +
      '<div class="col-3 col-sm-3 ellipsis-text">' +
      "<span>" +
      data[i].location +
      "</span>" +
      "</div>" +
      // '<div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">' +
      // '<span>' + get_time_diff(data[i].start_date, data[i].end_date) + ' hrs</span>' +
      // '</div>' +
      '<div class="col-2 col-sm-2 text-center">' +
      '<button class="btn btn-link  collapsed" data-toggle="collapse" data-target="#evidence_' +
      i +
      '" OnClick="openNoCallEvidence(\'' +
      data[i]._id +
      "',this,'evidence_" +
      i +
      '\')" aria-expanded="false" aria-controls="collapseOne">Show</button>' +
      "</div > " +
      "</div > " +
      "</div > " +
      '<div id= "evidence_' +
      i +
      '" class="collapse" aria- labelledby="headingOne" data- parent="#accordionEvid" style= ""> ' +
      '<div class="card-body p-0"> ' +
      '<div class="row"> ' +
      // '<div class="col-md-12 pl-0 pr-0"> ' +

      // '</div>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
    $("#noCallsEvidence").append(str);
  }
}

function showEvidenceGallery(a, parent, data) {
  showhidcalltext(a);
  $("#" + parent)
    .find(".row")
    .empty();
  for (var i = 0; i < data.length; i++) {
    let str =
      '<div class="col-md-3 col-sm-1" style="padding-bottom:15px;"> ' +
      '<div class="rc-bottom-data-img">' +
      '<div class="img-1 datshareclass_' +
      i +
      '">' +
      '<img src="images/call-ftr-img1.jpg" alt="">' +
      '<div class="img-overlay" id="showGalleryImage_' +
      i +
      '" style="cursor:pointer;">' +
      '<div class="zoom-icon" >' +
      "<a>" +
      '<img src="images/zoom-icon.png" alt="" />' +
      "</a>" +
      "</div>" +
      '<div class="img-overlay-txt" style="color:#fff;">' +
      '<div class="lt-data-label" style="width:50%;float:left;">Time <span>:</span></div>' +
      '<div class="data-label-txt" style="width:50%;float:left;">' +
      getTimeformat(data[i].timestamp) +
      "<br />" +
      getdateformat(data[i].timestamp) +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
    $("#" + parent)
      .find(".row")
      .append(str);
    console.log(data[i]);
    $("#" + parent)
      .find("#showGalleryImage_" + i)
      .data("obj", data[i]);
    $("#" + parent)
      .find("#showGalleryImage_" + i)
      .click(function () {
        appendNoCallEvidenceModal($(this).data("obj"));
      });
  }
}

function openNoCallEvidence(idx, a, parent) {
  showloader();
  var userdataid = {
    supervisor_id: getCookie("user_id"),
    user_id: idx,
  };
  $.ajax({
    type: "POST",
    url: "/api/viewtrainingevidence",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    beforeSend: function () {},
    success: function (data) {
      console.log(data.length);
      if (data.length == 0) {
        hideloader();
      } else {
        hideloader();
        showEvidenceGallery(a, parent, data);
        // appendNoCallEvidenceModal(data)
      }
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function appendNoCallEvidenceModal(data) {
  $("#sharedevidencemodal").empty();
  // for (var i = 0; i < data.length; i++) {
  var str = "";
  if (data.type == "image") {
    str = '<img  class="ramimageslider2" src="' + data.url + '" />';
    $("#sharedevidencemodal").append(str);
  } else if (data.type == "video") {
    str = '<a  class="ramimageslider2" href="' + data.url + '" /></a>';

    $("#sharedevidencemodal").append(str);
  } else if (data.type == "pdf") {
    str = '<p  class="ramimageslider2" href="' + data.url + '" /></p>';

    $("#sharedevidencemodal").append(str);
  }

  setTimeout(function () {
    $("body").picEyes({
      classSelect: "ramimageslider2",
    });
    $(".ramimageslider2")[0].click();
  }, 500);

  // }
}

// call Recording code
$("#recordCallToggle").on("change", function () {
  if ($(this).prop("checked")) {
    console.log("Checked");
    $(this).siblings(".recordingStatus").text("Recoding On");
    startCallRecording();
  } else {
    console.log("Unchecked");
    $(this).siblings(".recordingStatus").text("Recoding Off");
    stopCallRecording();
  }
});

function saveRecordingToDB(datadoc) {
  //    console.log(datadoc)
  $.ajax({
    type: "POST",
    url: "/api/saverecording",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: datadoc,
    beforeSend: function () {},
    success: function (data) {
      FnGetRecentUplodedDoc();
    },
    error: function (xhr, status, error) {},
  });
}

$("#v-pills-recording-tab").on("click", function (e) {
  FnGetWorkerListByRecording();
});

function FnGetWorkerListByRecording() {
  showloader();
  var user_id = getCookie("user_id");
  var request = JSON.stringify({
    supervisor_id: user_id,
  });
  $.ajax({
    type: "POST",
    url: "/api/recordedworkers",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: request,
    cache: false,
    beforeSend: function () {},
    success: function (data) {
      console.log("=====");
      console.log(data);
      console.log("=====");

      hideloader();
      FnShowRecordingInUserList(data);
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function FnShowRecordingInUserList(data) {
  $("#callRecordingsOf").empty();
  for (var i = 0; i < data.length; i++) {
    var str =
      '<div class="card">' +
      '<div class="card-header" id="headingOne">' +
      '<div class="row">' +
      '<div class="col-4 col-sm-3 ellipsis-text">' +
      "<span>" +
      data[i].f_name +
      " " +
      data[i].l_name +
      "</span>" +
      "</div>" +
      '<div class="col-3 col-sm-2 ellipsis-text">' +
      "<span>" +
      data[i].glass_id +
      "</span>" +
      "</div>" +
      '<div class="col-3 col-sm-3 ellipsis-text">' +
      "<span>" +
      data[i].location +
      "</span>" +
      "</div>" +
      // '<div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">' +
      // '<span>' + get_time_diff(data[i].start_date, data[i].end_date) + ' hrs</span>' +
      // '</div>' +
      '<div class="col-2 col-sm-2 text-center">' +
      '<button class="btn btn-link  collapsed" data-toggle="collapse" data-target="#callRecordings_' +
      i +
      '" OnClick="openRecordingGallery(\'' +
      data[i]._id +
      "',this,'callRecordings_" +
      i +
      '\')" aria-expanded="false" aria-controls="collapseOne">Show</button>' +
      "</div > " +
      "</div > " +
      "</div > " +
      '<div id= "callRecordings_' +
      i +
      '" class="collapse" aria- labelledby="headingOne" data- parent="#accordionRecord" style= ""> ' +
      '<div class="card-body p-0"> ' +
      '<div class="row"> ' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
    $("#callRecordingsOf").append(str);
  }
}

function openRecordingGallery(idx, a, parent) {
  showloader();
  var userdataid = {
    supervisor_id: getCookie("user_id"),
    user_id: idx,
  };
  $.ajax({
    type: "POST",
    url: "/api/viewrecordings",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(userdataid),
    beforeSend: function () {},
    success: function (data) {
      console.log(data.length);
      if (data.length == 0) {
        hideloader();
      } else {
        hideloader();
        showRecordingGallery(a, parent, data);
      }
    },
    error: function (xhr, status, error) {
      // alert(error); alert(status); alert(xhr);
    },
  });
}

function showRecordingGallery(a, parent, data) {
  showhidcalltext(a);
  $("#" + parent)
    .find(".row")
    .empty();
  for (var i = 0; i < data.length; i++) {
    let str =
      '<div class="col-md-3 col-sm-1" style="padding-bottom:15px;"> ' +
      '<div class="rc-bottom-data-img">' +
      '<div class="img-1 datshareclass_' +
      i +
      '">' +
      '<img src="images/call-ftr-img1.jpg" alt="">' +
      '<div class="img-overlay" id="showCallRecording_' +
      i +
      '" style="cursor:pointer;">' +
      '<div class="zoom-icon" >' +
      "<a>" +
      '<img src="images/zoom-icon.png" alt="" />' +
      "</a>" +
      "</div>" +
      '<div class="img-overlay-txt" style="color:#fff;">' +
      '<div class="lt-data-label" style="width:50%;float:left;">Time <span>:</span></div>' +
      '<div class="data-label-txt" style="width:50%;float:left;">' +
      getTimeformat(data[i].timestamp) +
      "<br />" +
      getdateformat(data[i].timestamp) +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
    $("#" + parent)
      .find(".row")
      .append(str);
    console.log(data[i]);
    $("#" + parent)
      .find("#showCallRecording_" + i)
      .data("obj", data[i]);
    $("#" + parent)
      .find("#showCallRecording_" + i)
      .click(function () {
        appendNoCallEvidenceModal($(this).data("obj"));
      });
  }
}
