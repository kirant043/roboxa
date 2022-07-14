var request = require("request");
var FCM = require("fcm-node");
const io = require('socket.io')(3058);

var globalapiurl = "https://nsbluescope.roboxatech.com";
var clients = {};
var offlineuser = [];
var call_end_date_time = Date();
var call_start_date_time = Date();
var startDate = call_start_date_time.toString();
var endDate = call_end_date_time.toString();

function handler(req, res) { }

("use strict");

io.sockets.on("connection", function (socket) {
  // console log user id who connected to the server and room name from socket object
  console.log('############################')
  console.log(`userID: ${socket.id}`)
  console.log(`rooms: ${socket.rooms}`)
  console.log(`name: ${socket.nsp.name}`)
  console.log(`connected: ${socket.nsp.connected}`)
  console.log(`address: ${socket.nsp.address}`)
  console.log('############################')
  //console.log("Successfully connected");
  // convenience function to log server messages on the client
  function log() {
    var array = ["Message from server:"];
    array.push.apply(array, arguments);
    socket.emit("log", array);
  }

  socket.on("setUserId", function (args) {
    // Map user to socket id
    offlineuser = [];
    console.log(args);
    // Check if user is already connected
    /*if (Object.values(clients).indexOf(args.user_id) > -1) {
      var found = Object.keys(clients).filter(function (key) {
        return clients[key] === args.user_id;
      });
      io.sockets.sockets[found].disconnect();
      console.log("Disconneted User");
      // io.sockets.sockets[clients[found]].disconnect();
    }*/
    //console.log(JSON.stringify(args));
    console.log("Connected User ------------- " + args.user_id);
    socket.userid = args.user_id;
    socket.room = args.user_id; // pass group id here so that user can be mapped to rooms
    socket.join(args.user_id);
    var data = {
      user_id: args.user_id,
    };
    clients[socket.id] = args.user_id;
    console.log(clients);
    //socket.broadcast.emit('connectUser', data);
    io.sockets.emit("connectUser", data);
  });
  /*socket.on("isConnected", function (id, ackFn) {
    let otherSocket = io.sockets.clients[id];
    ackFn(!!otherSocket && otherSocket.connected);
  });*/
  socket.on("disconnect", function () {
    // offlineuser.push(clients[socket.id]);
    //console.log("user " + clients[socket.id] + " disconnected");

    // var data3 = {
    //        'offlineuseid': clients[socket.id],
    //        'status':"offline"
    //    };

    // socket.broadcast.emit("usergoofflineoncall", clients[socket.id]);
    /*delete clients[socket.id];*/
    console.log('disconnected')
  });

  socket.on("usergoonlineoncall", function (args) {
    console.log("usergoonlineoncall");

    socket.in(args.o_id).emit("usergoonlineoncall", args.u_id);
  });

  //notification to mobile

  socket.on("notifysupervisor", function (args, fn) {
    console.log("notifysupervisor");
    //save notfication
    console.log(args);
    var supervisor_idtoken = args.supervisor_id;
    var pickdate = new Date()
      .toLocaleString("en-US", {
        timeZone: "Asia/Kuala_Lumpur",
      })
      .split(",")[0]
      .split("/");
    var picktime = new Date()
      .toLocaleString("en-US", {
        timeZone: "Asia/Kuala_Lumpur",
      })
      .split(",")[1];

    request.post(
      {
        url: globalapiurl + "/api/supervisordetails",
        method: "POST",
        json: {
          supervisor_id: supervisor_idtoken,
        },
      },
      function (error, response, body) {
        console.log("qwe", body);
        if (body && body.length > 0) {
          var location = body[0].location;
          request.post(
            {
              url: globalapiurl + "/api/userrdetailsglass",
              method: "POST",
              json: {
                user_id: args.user_id,
              },
            },
            function (error, response, body) {
              var glass_id = body[0].glass_id;

              request.post(
                {
                  url: globalapiurl + "/api/savenotfication",
                  method: "POST",
                  json: {
                    glass_id: glass_id,
                    supervisor_id: supervisor_idtoken,
                    location: body[0].location,
                    text: "is looking for your help .please login to portal",
                    user_id: args.user_id,
                    name: args.fullname,
                    dateTime:
                      pickdate.toString().replace(/,/g, "/") + "" + picktime,
                    startDate,
                    status: "active",
                  },
                },
                function (error, response, body) {
                  request.post(
                    {
                      url: globalapiurl + "/api/findtoken",
                      method: "POST",
                      json: {
                        supervisor_id: supervisor_idtoken,
                      },
                    },
                    function (error, response, body) {
                      console.log(body);

                      if (body.length > 0) {
                        console.log("token detail", body[0].deviceToken);
                        var serverKey =
                          "AAAAfZMZqfA:APA91bHncWxh0i_39xim8JFpkZkcJtRDK6nc4AKUBmX68QkC_nUwY4qXKGw8TC0tLukVvoLx2RDFibfkNlEDJ__gUADYfy7sibXt4gZLHv_mArLAuI4b6kL3Kq60ZEa93YXktyCCwAZm"; //put your server key here
                        var fcm = new FCM(serverKey);

                        var message = {
                          //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                          to: body[0].deviceToken,

                          android: {
                            priority: "high",
                          },

                          data: {
                            //you can send only notification or only data(or include both)
                            name: "ROBOXA",
                            content:
                              args.fullname +
                              " is looking for your help. Please login to portal",
                          },
                        };

                        fcm.send(message, function (err, response) {
                          if (err) {
                            console.log("Something has gone wrong!");
                            fn("failed");
                          } else {
                            console.log(
                              "Successfully sent with response: ",
                              response
                            );
                            socket.emit("desktopnotification", true);
                            fn("success");
                          }
                        });
                      } else {
                        // fn('failed');
                        fn("failed");
                      }
                    }
                  );
                }
              );
            }
          );
        } else {
          // fn('failed');
          console.log("failed");
        }
      }
    );
  });

  socket.on("callfailedlog", function (args) {
    console.log("callfailedlog");
    console.log(args);
    call_end_date_time = Date();

    endDate = call_end_date_time.toString();
    var uniqcallid = Math.floor(
      Math.random() * Math.floor("34564654654")
    ).toString();
    request.post(
      {
        url: globalapiurl + "/api/calldetailsave",
        method: "POST",
        json: {
          user_id: args.user_id,
          other_user_id: args.other_user_id,
          start_date: startDate,
          end_date: endDate,
          type: args.user_id,
          glass_id: args.glass_id,
          job_id: args.user_id,
          location: args.location,
          full_name: args.full_name,
          emp_id: args.emp_id,
          callid: uniqcallid,
          isShredoc: "0",
          isShreevidence: "0",
          isSharesupport: "0",
        },
      },
      function (error, response, body) {
        console.log(body);
      }
    );

    // request.post(
    //           globalapiurl+'/api/calldetailsave',
    //           JSON.stringify({
    //        "user_id":args.user_id,
    //       "other_user_id": args.other_user_id,
    //       "start_date": args.start_time,
    //       "end_date": args.user_id,
    //       "type": args.user_id,
    //       "glass_id": args.glass_id,
    //       "job_id": args.user_id,
    //       "location": args.location,
    //       "full_name": args.full_name,
    //       "emp_id": args.emp_id,
    //       "callid":uniqcallid,
    //       "isShredoc":"0",
    //       "isShreevidence":"0",
    //       "isSharesupport":"0"
    //           }),
    //           function (error, response, body) {
    //               if (!error && response.statusCode == 200) {
    //                    console.log("dsfdsfsdfdsfdsfdsram")
    //               }
    //           }
    //       );
  });

  socket.on("sharedDoc", function (args) {
    console.log("sharedDoc");
    var data = {
      listdoc: args.doclist,
    };
    var room = args.otheruser_id + args.user_id;
    socket.in(room).emit("sharedDoclist", data);
  });

  socket.on("callerbusy", function (args) {
    // console.log(args);
    console.log("callerbusy");

    socket.in(args.user_id).emit("full", "callerbusy");
  });

  socket.on("rejectcall", function (args) {
    console.log("rejectcall");
    console.log(args);

    socket.in(args.user_id).emit("rejectcall", args.message);
  });

  socket.on("canvsdata", function (args) {
    console.log("canvsdata");
    console.log(args);
    var room = args.other_user_id + args.user_id;
    console.log(room);
    socket.in(room).emit("canvsdata", args);
  });

  socket.on("evidenceReceived", function (args) {
    console.log("evidenceReceived");
    // console.log(args);
    socket.join(args.user_id);

    io.sockets.emit("cehavidence", args);
  });
  socket.on("chat", function (args) {
    console.log("chat");

    // console.log(clients[args.user_id].socket);
    //io.sockets.connected[clients[args.user_id].socket].emit('chat', args.message);
    // socket.broadcast.to(args.user_id).emit('chat', args.message);

    socket.in(args.user_id).emit("chat", args.message);
  });
  socket.on("call", function (args) {
    //console.log(args);
    var data = {
      user_id: args.user_id,
      name: args.name,
      glass_id: args.glass_id,
      location: args.location,
    };
    socket.in(args.other_user_id).emit("call", data);
    //socket.broadcast.emit('call', data);
  });

  socket.on("callAnswer", function (args) {
    console.log("callAnswer");

    call_start_date_time = Date();

    startDate = call_start_date_time.toString();

    var data = {
      user_id: args.user_id,
    };
    socket.in(args.other_user_id).emit("callAnswer", data);
    //io.sockets.in(args.other_user_id).emit('callAnswer', data);
    //socket.broadcast.emit('callAnswer', data);
  });

  socket.on("callEnd", function (args) {
    console.log("callEnd");

    //  console.log(args);
    //log(args);

    socket.in(args.other_user_id).emit("callEnd", args);
  });

  socket.on("leaveGroup", function (args) {
    console.log("leaveGroup");
    console.log(args);
    //log(args);

    socket.in(args.room).emit("leaveGroup", args);
    socket.leave(args.room);
    //socket.broadcast.emit('leaveGroup', args);
  });

  socket.on("userDisconnect", function (args) {
    console.log("userDisconnect");

    //console.log(args);
    var data = {
      user_id: args.user_id,
    };
    io.sockets.emit("userDisconnect", data);
  });

  socket.on("GetOnlineUsers", function () {
    console.log("GetOnlineUsers");

    var connected_user = findUsersConnected("", "");
    //console.log(connected_user);
    var data = {
      user_id: connected_user,
    };
    //io.sockets.emit('AllConnectedUsers', data);
    //socket.broadcast.emit('GetOnlineUsers', data);
    io.sockets.emit("GetOnlineUsers", data);
  });

  socket.on("message", function (message) {
    // for a real app, would be room-only (not broadcast)
    // socket.broadcast.emit('message', message);

    // for a particular room
    if (message.room) {
      socket.in(message.room).emit("message", message.message);
    } else {
      socket.broadcast.emit("message", message);
    }
    //io.sockets.in(message.room).emit('message', message.message);
  });

  socket.on("rejoinroom", function (args) {
    console.log("rejoinroom");

    socket.join(args.roomid);
  });

  socket.on("create or join", function (room) {
    console.log("create or join");

    log("Received request to create or join room " + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom
      ? Object.keys(clientsInRoom.sockets).length
      : 0;
    log("Room " + room + " now has " + numClients + " client(s)");

    if (numClients === 0) {
      socket.join(room);
      log("Client ID " + socket.id + " created room " + room);
      socket.emit("created", room, socket.id);
    } else if (numClients === 1) {
      log("Client ID " + socket.id + " joined room " + room);
      io.sockets.in(room).emit("join", room);
      socket.join(room);
      socket.emit("joined", room, socket.id);
      io.sockets.in(room).emit("ready");
    } else {
      // max two clients
      socket.emit("full", room);
    }
  });

  socket.on("ipaddr", function () {
    console.log("ipaddr");

    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (details.family === "IPv4" && details.address !== "nsbluescope.roboxatech.com") {
          socket.emit("ipaddr", details.address);
        }
      });
    }
  });

  socket.on("bye", function () {
    console.log("bye");

    // var wasconnected = this.connected;
    // if (wasconnected) {
    // socket.disconnect();
    // }
    console.log("received bye");
  });

  //   socket.on('checkuseronline', function(args) {

  // console.log("args");

  //    console.log(args);
  //     socket.broadcast.to(args.user_id).emit('usercheckonline', "offline");
  //        socket.broadcast.to(args.other_user_id).emit('usercheckonline', "offline");

  //   });
  socket.on("checkuseronline", function (name, fn) {
    console.log("checkuseronline");

    console.log(name.other_user_id);
    console.log(offlineuser);
    if (offlineuser.includes(name.other_user_id)) {
      fn("offline");
      console.log("offline");
    } else {
      console.log("online");
      fn("online");
    }
  });

  // VIDEO STREAM ZOOM FUNCTIONALITY
  socket.on("zoom_in_user", function (args) {
    console.log("zoom_in_user");

    console.log(args.zoom_in_user);
    if (args.room_id) {
      socket.in(args.room_id).emit("zoom_in_user", args);
    } else {
      socket.broadcast.emit("zoom_in_user", args);
    }
    //ack(args.zoom_in_user);
  });
  socket.on("zoom_out_user", function (args) {
    console.log("zoom_out_user");

    console.log(args.zoom_out_user);
    if (args.room_id) {
      socket.in(args.room_id).emit("zoom_out_user", args);
    } else {
      socket.broadcast.emit("zoom_out_user", args);
    }
    //ack(args.zoom_out_user);
  });
});

function findUsersConnected(room, namespace) {
  console.log("findUsersConnected()");
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

  var names = [];
  var ns = io.of("/");
  if (ns) {
    for (var id in ns.connected) {
      // if (room) {
      //   var roomKeys = Object.keys(ns.connected[id].rooms);
      //   for (var i in roomKeys) {
      //     if (roomKeys[i] == room) {
      //       if (ns.connected[id].userid) {
      //         names.push(ns.connected[id].userid);
      //       } else {
      //         names.push(ns.connected[id].id);
      //       }
      //     }
      //   }
      // } else {
      if (ns.connected[id].userid) {
        console.log(`userID: ${ns.connected[id].userid}`)
        names.push(ns.connected[id].userid);
      } else {
        console.log(`id: ${ns.connected[id].id}`)
        names.push(ns.connected[id].id);
      }
      // }
    }
  }
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  return names.sort();
}

