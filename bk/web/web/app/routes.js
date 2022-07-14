var dbaa = "";
var dbcheck = "";
var MongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var url = "mongodb://localhost:45628/";
//var url = "mongodb://localhost:45628/";
var { generateToken } = require("./models/token");
var auth = require("./middleware/auth");
MongoClient.connect(url, (err, database) => {
  if (err) return console.log(err);
  //require('./app/routes')(app,{});
  //check below line changed

  var dbo = database.db("roboxadev");
  dbaa = dbo;
  dbcheck = database;
  /*Return only the documents with the address "Park Lane 38":*/
  console.log("result");
});

module.exports = function (app) {
  // api ---------------------------------------------------------------------
  // get all todos
  app.get("/api/client", function (req, res) {
    var query = {};
    dbaa
      .collection("client")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);

        res.json(result);
      });
  });

  app.post("/api/mobilelogin", function (req, res) {
    var login = {
      emp_id: req.body.emp_id,
      password: req.body.password,
    };

    dbaa
      .collection("supervisor")
      .find(login)
      .toArray(function (err, result) {
        if (err) throw err;

        if (result.length > 0) {
          var findata = result[0];
          var supervisor_idtoken = findata._id.toLocaleString();
          console.log(findata._id);
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
          var token_data = {
            deviceToken: req.body.deviceToken,
            supervisor_id: supervisor_idtoken,
            date_time: pickdate + "," + picktime,
            deviceID: req.body.deviceID,
          };

          dbaa.collection("usertokkendetails").remove(
            {
              deviceID: req.body.deviceID,
            },
            function (err, result) {
              if (err) throw err;
              // console.log("remove detaisl",result);
              dbaa
                .collection("usertokkendetails")
                .insert(token_data, function (err, result) {
                  if (err) throw err;
                  console.log("1 notification inserted");
                  var response = {
                    supervisorData: {
                      full_name: findata.f_name + " " + findata.l_name,
                      id: supervisor_idtoken,
                    },
                    msg: "login Successfully",
                    status: "200",
                  };
                  res.json(response);
                });
            }
          );
        } else {
          var failed = {
            msg: "login failed",
            status: "404",
          };
          res.json(failed);
        }
      });
  });
  var user = [];
  app.post("/api/userlogin", function (req, res) {
    console.log(req.body);

    var query = req.body;
    if (!query) {
      return;
    }
    console.log("user", user);
    // if (user !== undefined && user.length > 0) {
    //   if (
    //     user.find(function (a) {
    //       return a.emp_id === query.emp_id && a.isLoggedIn;
    //     })
    //   ) {
    //     dbaa
    //       .collection("userlogindetails")
    //       .find({ user_name: query.emp_id })
    //       .toArray(function (err, result) {
    //         if (err) throw err;
    //         var obj = result[0];
    //         var pair = { isLoggedIn: true };
    //         obj = { ...obj, ...pair };
    //         res.json(obj);
    //       });
    //     // res.json(obj);
    //     return;
    //   }
    // }

    if (query.emp_id === "admin") {
      query.user = "admin";
      delete query.password;
      // var token = generateToken(query.emp_id);
      // query.token = token;
      // var token_data = {
      //   user_token: token,
      //   user_name: query.user,
      //   user_id: query.user,
      // };
      //
      // dbaa
      //   .collection("userlogindetails")
      //   .insert(token_data, function (err, result) {
      //     if (err) throw err;
      //     console.log("1 notification inserted");
      //   });
      //   query.isLoggedIn = true;
      //   user.push(query);
      res.json(query);
    } else {
      /*dbaa.collection("supervisor").find(query).toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);
        res.json(result);
      });*/
      dbaa
        .collection("supervisor")
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            var findata = result[0];
            var user_idtoken = query.emp_id;
            var token = generateToken(query.emp_id);
            var token_data = {
              user_token: token,
              user_name: user_idtoken,
              user_id: result[0]._id,
            };
             result[0]["token"] = token;
            // dbaa
            //   .collection("userlogindetails")
            //   .insert(token_data, function (err, result) {
            //     if (err) throw err;
            //     console.log("1 notification inserted");
            //   });
            //   query.isLoggedIn = true;
            //   user.push(query);
            res.json(result);
          } else {
            var failed = {
              msg: "login failed",
              status: "404",
            };
            res.json(failed);
          }
        });
    }
    console.log("End", user);
    // next();
  });

  app.post("/api/userlogout", function (req, res) {
    // console.log("Before Logout", req.body);
    // if (user !== undefined && user.length > 0) {
    //   user.splice(
    //     user.findIndex(function (i) {
    //       return i.emp_id === req.body.emp_id;
    //     }),
    //     1
    //   );
    // }
    //
    // var query = {
    //   user_name: req.body.emp_id,
    // };
    // dbaa.collection("userlogindetails").remove(query, function (err, result) {
    //   if (err) throw err;
    //   console.log("1 notification inserted");
      res.json({
        status: "200",
        msg: "logout Successfully",
      });
    // });
    // console.log("After Logout", user);
  });

  app.post("/api/userdetails", function (req, res) {
    console.log(req.body);
    var query = {
      supervisor_id: ObjectID(req.body.supervisor_id),
    };
    dbaa
      .collection("user")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);

        res.json(result);
      });

    /*dbaa.collection("supervisor").findOne({'_id':ObjectID(req.body['supervisor_id'])}, function (err, supervisorObj) {
		if (err) throw err;
		console.log('supervisorObj  ',supervisorObj);
		if(supervisorObj && supervisorObj.hasOwnProperty('worker_list')){
			var query = [];
			if(typeof(supervisorObj['worker_list']) == 'object' && supervisorObj['worker_list'].length >0) {
				supervisorObj['worker_list'].forEach(function(e){
					query.push(ObjectID(e));
				});
			} else if(typeof(supervisorObj['worker_list']) == 'string'){
				query.push(ObjectID(supervisorObj['worker_list']));
			}
			dbaa.collection("user").find({_id:{$in:query}}).toArray(function (er, results) {
				if (er) throw er;
				// console.log(result);
				res.json(results);
			});
		} else {
			res.json({ok:0});
		}
    });*/
  });

  //start notification code
  app.post("/api/userdetails", function (req, res) {
    console.log(req.body);
    var query = {
      supervisor_id: ObjectID(req.body.supervisor_id),
    };
    dbaa
      .collection("user")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);

        res.json(result);
      });
  });

  app.post("/api/mobilelogin", function (req, res) {
    var login = {
      emp_id: req.body.emp_id,
      password: req.body.password,
    };

    dbaa
      .collection("supervisor")
      .find(login)
      .toArray(function (err, result) {
        if (err) throw err;

        if (result.length > 0) {
          var findata = result[0];
          var supervisor_idtoken = findata._id.toLocaleString();
          console.log(findata._id);
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
          var token_data = {
            deviceToken: req.body.deviceToken,
            supervisor_id: supervisor_idtoken,
            date_time: pickdate + "," + picktime,
            deviceID: req.body.deviceID,
          };

          dbaa.collection("usertokkendetails").remove(
            {
              deviceID: req.body.deviceID,
            },
            function (err, result) {
              if (err) throw err;
              // console.log("remove detaisl",result);
              dbaa
                .collection("usertokkendetails")
                .insert(token_data, function (err, result) {
                  if (err) throw err;
                  console.log("1 notification inserted");
                  var response = {
                    supervisorData: {
                      full_name: findata.f_name + " " + findata.l_name,
                      id: supervisor_idtoken,
                    },
                    msg: "login Successfully",
                    status: "200",
                  };
                  res.json(response);
                });
            }
          );
        } else {
          var failed = {
            msg: "login failed",
            status: "404",
          };
          res.json(failed);
        }
      });
  });

  app.post("/api/savenotfication", function (req, res) {
    dbaa
      .collection("notificationdetail")
      .insert(req.body, function (err, result) {
        if (err) throw err;
        console.log("1 document inserted");
        res.json(result);
      });
  });
  //supervisor detail
  app.post("/api/supervisordetails", function (req, res) {
    var query = {
      _id: req.body.supervisor_id,
    };

    // dbaa.collection("supervisor").find(query).toArray(function (err, result) {
    //   if (err) throw err;
    //   console.log(result);
    //
    //   res.json(result);
    // });
    console.log(req, "reqtest");
    dbaa.collection("supervisor").findOne(
      {
        _id: req.body.supervisor_id,
      },
      function (err, result) {
        if (err) throw err;
        console.log(result, "resulttest");
        if (result) {
          res.json(result);
        }
      }
    );
  });

  app.post("/api/userrdetailsglass", function (req, res) {
    var query = {
      _id: ObjectID(req.body.user_id),
    };
    console.log(query);
    dbaa
      .collection("user")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);

        res.json(result);
      });
  });

  app.post("/api/mobilelogout", function (req, res) {
    var query = {
      supervisor_id: req.body.supervisor_id,
    };

    dbaa.collection("usertokkendetails").remove(query, function (err, result) {
      if (err) throw err;
      console.log("1 notification inserted");
      if (
        req.session.user.find(function (a) {
          return a.emp_id === query.emp_id;
        })
      )
        return;
      req.session.user = undefined;
      res.json({
        status: "200",
        msg: "logout Successfully",
      });
    });
  });

  app.post("/api/findtoken", function (req, res) {
    dbaa
      .collection("usertokkendetails")
      .find(req.body)
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);

        res.json(result);
      });
  });

  app.post("/api/readallnotification", function (req, res) {
    console.log(req.body.supervisor_id);
    dbaa.collection("notificationdetail").update(
      {
        supervisor_id: req.body.supervisor_id,
      },
      {
        $set: {
          status: "inactive",
        },
      },
      {
        multi: true,
      },
      function (err, result) {
        if (err) throw err;
        res.json(result);
      }
    );
  });

  app.post("/api/listNotification", function (req, res) {
    console.log("as", {
      supervisor_id: req.body.supervisor_id,
    });

    dbaa
      .collection("notificationdetail")
      .find({
        supervisor_id: req.body.supervisor_id,
      })
      .sort([["_id", -1]])
      .toArray(function (err, result) {
        if (err) throw err;
        var response = "";

        if (result.length > 0) {
          response = {
            data: result,
            msg: "data found",
            status: "200",
          };
        } else {
          response = {
            data: result,
            msg: "data not found",
            status: "404",
          };
        }

        res.json(response);
      });
  });

  //end  notification work
  app.post("/api/inserdocdata", function (req, res) {
    dbaa.collection("alldocuments").insert(req.body, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted");
      res.json(result);
    });
  });

  app.post("/api/deletedocdata", function (req, res) {
    var querydlt = {
      etag: req.body.etag,
    };

    dbaa.collection("alldocuments").remove(querydlt, function (err, result) {
      if (err) throw err;
      console.log("1 document deleted");
      res.json(result);
    });

    dbaa.collection("glasswisedoclist").update(
      {
        user_id: req.body.user_id,
      },
      {
        $pull: {
          doclist: {
            etag: req.body.etag,
          },
        },
      },
      {
        multi: true,
      }
    );
  });

  app.post("/api/showdatadoc", function (req, res) {
    console.log(req.body);

    var query = req.body;

    dbaa
      .collection("alldocuments")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);

        res.json(result);
      });
  });

  app.post("/api/callhistorydata", function (req, res) {
    console.log(req.body);
    var query = {
      user_id: ObjectID(req.body.user_id),
    };
    dbaa
      .collection("callhistory")
      .find(req.body)
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);

        res.json(result);
      });
  });

  app.post("/api/reportcallhistory", function (req, res) {
    var datsend = {};
    console.log(req.body);
    var query = {
      user_id: req.body.user_id,
    };
    if (req.body.user_id != "") {
      datsend = {
        $or: [
          { user_id: req.body.user_id },
          { other_user_id: req.body.user_id },
        ],
      };
    }

    dbaa
      .collection("callhistory")
      .find(datsend)
      .toArray(function (err, result) {
        if (err) throw err;
        // console.log(result);

        res.json(result);
      });
  });

  app.post("/api/calldetailsave", function (req, res) {
    console.log(req.body);

    dbaa.collection("callhistory").insert(req.body, function (err, result) {
      if (err) throw err;
      console.log("1 call inserted");
      res.json(result);
    });
  });

  app.post("/api/viewevidence", function (req, res) {
    console.log(req.body);

    dbaa
      .collection("evidence")
      .find(req.body)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log("evidence call");
        res.json(result);
      });
  });

  app.post("/api/cehavidenceinsert", function (req, res) {
    console.log(req.body);

    dbaa.collection("evidence").insert(req.body, function (err, result) {
      if (err) throw err;
      console.log("evidence inserted");
      res.json(result);
    });
  });

  app.post("/api/saveglasswisedoclist", function (req, res) {
    dbaa
      .collection("glasswisedoclist")
      .insert(req.body, function (err, result) {
        if (err) throw err;
        console.log("glasscalldoc");
        res.json(result);
      });
  });

  app.post("/api/savetrainingevidence", function (req, res) {
    // save user_id and timestamp
    let evd = req.body;
    evd["user_id"] = ObjectID(req.body.user_id);
    evd["timestamp"] = new Date();

    dbaa.collection("traingevidence").insert(evd, function (err, result) {
      if (err) throw err;
      console.log("traingevidence");

      res.json({
        meta: {
          message: "Saved Successfully",
          status: "200",
        },
      });
    });
  });

  app.post("/api/getglasswisedoclist", function (req, res) {
    dbaa
      .collection("glasswisedoclist")
      .aggregate([
        {
          $unwind: "$doclist",
        },
        {
          $match: req.body,
        },
        {
          $group: {
            _id: req.body.otheruser_id,
            clrs: {
              $push: "$doclist",
            },
          },
        },
        {
          $project: {
            doclist: "$clrs",
          },
        },
      ])
      .toArray(function (err, result) {
        console.log(result);
        if (result[0]) {
          var metad = {
            doclist: result[0].doclist,
            meta: {
              message: "documents found",
              status: "200",
            },
          };

          res.json(metad);
        } else {
          var metad = {
            meta: {
              message: "documents not found",
              status: "404",
            },
          };
          // result.push(metad)

          res.json(metad);
        }
      });
  });

  app.post("/api/login", function (req, res) {
    console.log(req.body);

    var datadsds = {
      glass_id: req.body.qr_code,
    };

    dbaa
      .collection("user")
      .find(datadsds)
      .toArray(function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          result = result[0];
          var returnData = {
            glassUserData: {
              email: result.email,
              emp_id: result.emp_id,
              full_name: result.f_name + " " + result.l_name,
              glass_id: result.glass_id,
              location: result.location,
              user_id: result._id,
              user_name: "",
            },
            meta: {
              message: "Login Successfully",
              status: "200",
              user_id: "",
            },
          };
          console.log("bug", result);
          if (
            result.supervisor_id !== null &&
            result.supervisor_id !== undefined &&
            result.supervisor_id !== ""
          ) {
            dbaa.collection("supervisor").findOne(
              {
                _id: ObjectID(result.supervisor_id),
              },
              function (er, sup) {
                returnData["supervisorData"] = {
                  email: sup.email,
                  emp_id: sup.emp_id,
                  full_name: sup.f_name + " " + sup.l_name,
                  glass_id: sup.glass_id,
                  location: sup.location,
                  user_id: sup._id,
                  // "user_name": sup.user_name
                };
                res.json(returnData);
              }
            );
          } else {
            res.send("Supervisor not assigned.");
          }
        } else {
          res.json({
            meta: {
              message: "Login failed",
              status: "203",
              user_id: "",
            },
          });
        }
      });
  });

  //	ADMIN API's
  //	ADD SUPERVISOR API
  app.post("/user/supervisor", function (req, res) {
    let query = req.body;
    let workerArr = [];
    if (typeof query.worker_list == "string") {
      workerArr.push(query.worker_list);
    } else if (typeof query.worker_list == "object") {
      workerArr = query.worker_list;
    }
    if (query.access_role == "admin") {
      dbaa.collection("supervisor").findOne(
        {
          emp_id: query.emp_id,
        },
        function (err, result) {
          if (err) throw err;
          if (result) {
            res.send(false);
          } else {
            dbaa.collection("supervisor").insertOne(
              {
                //"user_name": query.user_name,
                password: query.password,
                user_image: "",
                email: query.email,
                tel_country_code: "",
                phone: "",
                work_at: "",
                dob: "",
                f_name: query.f_name,
                l_name: query.l_name,
                device_token: "",
                device_type: "",
                registration_type: "supervisor",
                lon: 0,
                lat: 0,
                company: query.company,
                location: query.location,
                updated_by: "admin",
                deleted_by: "admin",
                updated_on: new Date(),
                created_on: new Date(),
                phone_verified: true,
                email_verified: true,
                user_verified: true,
                is_private: false,
                is_login: true,
                is_active: true,
                city: "",
                state: "",
                country: "Singapore",
                emp_id: query.emp_id,
                qr_code: query.emp_id,
                worker_list: workerArr,
                client_id: "000000000000000000000000",
                glass_id: "AR456466",
              },
              function (err, r) {
                if (err) throw err;
                console.log(r);
                updateWorkersList(r.ops[0]._id, query.worker_list).then(() => {
                  res.json(r.ops[0]);
                });
              }
            );
          }
        }
      );
    } else {
      res.status(401);
    }
  });
  //	ADD WORKER API
  app.post("/user/worker", function (req, res) {
    let query = req.body;
    console.log(query);
    if (query.access_role == "admin") {
      dbaa.collection("user").findOne(
        {
          qr_code: query.qr_code,
        },
        function (err, result) {
          if (err) throw err;
          if (result) {
            res.send(false);
          } else {
            dbaa.collection("user").insertOne(
              {
                //"user_name": query.user_name,
                password: query.password,
                user_image: "",
                email: query.email,
                tel_country_code: "",
                phone: "",
                work_at: "",
                dob: "",
                f_name: query.f_name,
                l_name: query.l_name,
                device_token: "",
                device_type: "",
                registration_type: "worker",
                lon: 0,
                lat: 0,
                location: query.location,
                updated_by: "000000000000000000000000",
                deleted_by: "000000000000000000000000",
                updated_on: new Date(),
                created_on: new Date(),
                phone_verified: true,
                email_verified: true,
                user_verified: true,
                is_private: false,
                is_login: true,
                is_active: true,
                city: "",
                state: "",
                country: "",
                emp_id: query.qr_code,
                qr_code: query.qr_code,
                supervisor_id: "",
                supervisor_name: "",
                client_id: "000000000000000000000000",
                glass_id: query.glass_id,
              },
              function (err, r) {
                if (err) throw err;
                res.json(r);
              }
            );
          }
        }
      );
    } else {
      res.status(401);
    }
  });

  //	UPDATE SUPERVISOR API
  app.put("/user/supervisor", function (req, res) {
    let query = req.body;
    let o_id = ObjectID(query.id);
    let workerArr = [];
    if (typeof query.worker_list == "string") {
      workerArr.push(query.worker_list);
    } else if (typeof query.worker_list == "object") {
      workerArr = query.worker_list;
    }
    dbaa.collection("supervisor").findOne(
      {
        _id: o_id,
      },
      function (er, result) {
        if (er) throw er;
        if (result) {
          freeWorkersList(result.worker_list).then(function () {
            dbaa.collection("supervisor").findOneAndUpdate(
              {
                _id: o_id,
              },
              {
                $set: {
                  //"user_name": query.user_name,
                  email: query.email,
                  f_name: query.f_name,
                  l_name: query.l_name,
                  company: query.company,
                  location: query.location,
                  password: query.password,
                  emp_id: query.emp_id,
                  qr_code: query.password,
                  worker_list: workerArr,
                  updated_on: new Date(),
                },
              },
              {
                upsert: false,
              },
              function (err, result) {
                if (err) throw err;
                updateWorkersList(o_id, query.worker_list).then(() => {
                  res.json(result);
                });
              }
            );
          });
        }
      }
    );
  });
  //	UPDATE WORKER API
  app.put("/user/worker", function (req, res) {
    let query = req.body;
    console.log(query);
    let o_id = ObjectID(query.id);
    //    console.log(query);
    dbaa.collection("user").findOne(
      {
        _id: o_id,
      },
      function (err, result) {
        if (err) throw err;
        if (result.supervisor_id !== null && result.supervisor_id !== "") {
          console.log(result);
          dbaa.collection("supervisor").findOneAndUpdate(
            {
              _id: ObjectID(result.supervisor_id),
            },
            {
              $pull: {
                worker_list: query.id,
              },
            },
            {},
            function (er, r) {
              dbaa.collection("user").findOneAndUpdate(
                {
                  _id: o_id,
                },
                {
                  $set: {
                    //"user_name": query.user_name,
                    email: query.email,
                    f_name: query.f_name,
                    l_name: query.l_name,
                    location: query.location,
                    emp_id: query.qr_code,
                    qr_code: query.qr_code,
                    updated_on: new Date(),
                    glass_id: query.glass_id,
                    supervisor_id: ObjectID(query.supervisor_id),
                  },
                },
                {
                  upsert: false,
                },
                function (err, result) {
                  if (err) throw err;
                  dbaa.collection("supervisor").findOneAndUpdate(
                    {
                      _id: ObjectID(query.supervisor_id),
                    },
                    {
                      $addToSet: {
                        worker_list: query.id,
                      },
                    },
                    {
                      upsert: false,
                    },
                    function (err, re) {
                      res.json(result);
                    }
                  );
                }
              );
            }
          );
        } else {
          dbaa.collection("user").findOneAndUpdate(
            {
              _id: o_id,
            },
            {
              $set: {
                email: query.email,
                f_name: query.f_name,
                l_name: query.l_name,
                location: query.location,
                emp_id: query.qr_code,
                qr_code: query.qr_code,
                updated_on: new Date(),
                glass_id: query.glass_id,
                supervisor_id: ObjectID(query.supervisor_id),
              },
            },
            {
              upsert: false,
            },
            function (err, result) {
              if (err) throw err;
              dbaa.collection("supervisor").findOneAndUpdate(
                {
                  _id: ObjectID(query.supervisor_id),
                },
                {
                  $addToSet: {
                    worker_list: query.id,
                  },
                },
                {
                  upsert: false,
                },
                function (err, re) {
                  res.json(result);
                }
              );
            }
          );
        }
      }
    );
  });

  //	VIEW SUPERVISOR API
  app.get("/view/supervisor", function (req, res) {
    if (req.query.access_role == "admin") {
      dbaa
        .collection("supervisor")
        .find()
        .toArray(function (err, result) {
          if (err) throw err;
          if (result) {
            res.json(result);
          } else {
            res.json({
              can: "do",
            });
          }
        });
    } else {
      res.status(401);
    }
  });
  //	VIEW WORKER API
  app.get("/view/worker", function (req, res) {
    if (req.query.access_role == "admin") {
      dbaa
        .collection("user")
        .find()
        .toArray(function (err, result) {
          if (err) throw err;
          if (result) {
            res.json(result);
          } else {
            res.json({
              can: "do",
            });
          }
        });
    } else {
      res.status(401);
    }
  });

  let freeWorkersList = async function (list) {
    if (typeof list == "object" && list.length > 0) {
      await list.forEach(function (e) {
        // idArr.push(ObjectID(e));
        dbaa.collection("user").updateOne(
          {
            _id: ObjectID(e),
          },
          {
            $set: {
              supervisor_id: "",
            },
          }
        );
      });
    } else if (typeof list == "string") {
      await dbaa.collection("user").updateOne(
        {
          _id: ObjectID(list),
        },
        {
          $set: {
            supervisor_id: "",
          },
        }
      );
    }
  };

  let updateWorkersList = async function (id, list) {
    if (typeof list == "object" && list.length > 0) {
      let idArr = [];
      await list.forEach(function (e) {
        // idArr.push(ObjectID(e));
        dbaa.collection("user").updateOne(
          {
            _id: ObjectID(e),
          },
          {
            $set: {
              supervisor_id: id,
            },
          }
        );
      });
    } else if (typeof list == "string") {
      await dbaa.collection("user").updateOne(
        {
          _id: ObjectID(list),
        },
        {
          $set: {
            supervisor_id: id,
          },
        }
      );
    }
  };

  //	SEND SUPERVISOR LIST TO WORKER VIEW
  app.get("/get/supervisorlist", function (req, res) {
    dbaa
      .collection("supervisor")
      .find()
      .toArray(function (err, result) {
        if (err) throw err;
        if (result) {
          let newJson = [];
          for (let i = 0; i < result.length; i++) {
            newJson.push({
              _id: result[i]._id,
              emp_id: result[i].emp_id,
              name: result[i].f_name + " " + result[i].l_name,
            });
          }
          res.json(newJson);
        } else {
          res.json({
            ok: 0,
          });
        }
      });
  });
  //	SEND WORKER LIST TO SUPERVISOR FORM
  app.get("/get/workerlist", function (req, res) {
    dbaa
      .collection("user")
      .find()
      .toArray(function (err, result) {
        if (err) throw err;
        if (result) {
          let newJson = [];
          for (let i = 0; i < result.length; i++) {
            newJson.push({
              _id: result[i]._id,
              emp_id: result[i].emp_id,
              supervisor_id: result[i].supervisor_id,
              fname: result[i].f_name,
              lname: result[i].l_name,
            });
          }
          res.json(newJson);
        } else {
          res.json({
            ok: 0,
          });
        }
      });
  });

  //	DELETE THE SUPERVISOR AND ASSOCIATED WORKER
  app.delete("/delete/supervisor", function (req, res) {
    let param = req.query;
    dbaa.collection("supervisor").findOneAndDelete(
      {
        _id: ObjectID(param.user_id),
      },
      function (err, result) {
        if (err) throw err;
        if (result) {
          console.log("01 ", result);
          console.log(
            "result ",
            result.value._id,
            "  ",
            result.value.worker_list
          );
          deleteWorkersList(result.value._id, result.value.worker_list).then(
            () => {
              //dbaa.collection("supervisor").findOneAndDelete({_id: ObjectID(param.user_id)});
              res.send(true);
            }
          );
        } else {
          res.send(false);
        }
      }
    );
  });
  //	DELETE THE WORKER
  app.delete("/delete/worker", function (req, res) {
    let param = req.query;
    console.log(param);
    dbaa.collection("user").findOneAndDelete(
      {
        _id: ObjectID(param.user_id),
      },
      function (err, result) {
        if (err) throw err;
        if (result) {
          res.send(true);
        } else {
          res.send(false);
        }
      }
    );
  });

  let deleteWorkersList = async function (id, list) {
    if (typeof list == "object" && list.length > 0) {
      await list.forEach(function (e) {
        dbaa.collection("user").deleteMany({
          supervisor_id: ObjectID(id),
        });
      });
    } else if (typeof list == "string") {
      await dbaa.collection("user").deleteOne({
        _id: ObjectID(list),
      });
    }
  };

  // NEW No Call Evidence Code
  app.post("/api/nocallworkers", function (req, res) {
    dbaa
      .collection("traingevidence")
      .aggregate([
        {
          $match: {
            supervisor_id: req.body.supervisor_id,
          },
        },
        {
          $group: {
            _id: "$user_id",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "_id",
            as: "list",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ["$list", 0] }, "$$ROOT"],
            },
          },
        },
        {
          $project: { list: 0 },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray(function (err, result) {
        console.log(result);
        res.json(result);
      });
  });

  app.post("/api/viewtrainingevidence", function (req, res) {
    console.log(req.body);
    dbaa
      .collection("traingevidence")
      .aggregate([
        {
          $match: {
            supervisor_id: req.body.supervisor_id,
            user_id: ObjectID(req.body.user_id),
          },
        },
        {
          $sort: {
            timestamp: -1,
          },
        },
      ])
      .toArray(function (err, result) {
        console.log(result);
        res.json(result);
      });
  });

  // call redording apis
  app.post("/api/saverecording", function (req, res) {
    let evd = req.body;
    evd["user_id"] = ObjectID(req.body.user_id);

    dbaa.collection("callrecordings").insert(evd, function (err, result) {
      if (err) throw err;
      console.log("1 recording inserted");
      res.json(result);
    });
  });

  app.post("/api/recordedworkers", function (req, res) {
    dbaa
      .collection("callrecordings")
      .aggregate([
        {
          $match: {
            supervisor_id: req.body.supervisor_id,
          },
        },
        {
          $group: {
            _id: "$user_id",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "_id",
            foreignField: "_id",
            as: "list",
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ["$list", 0] }, "$$ROOT"],
            },
          },
        },
        {
          $project: { list: 0 },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray(function (err, result) {
        console.log(result);
        res.json(result);
      });
  });

  app.post("/api/viewrecordings", function (req, res) {
    console.log(req.body);
    dbaa
      .collection("callrecordings")
      .aggregate([
        {
          $match: {
            supervisor_id: req.body.supervisor_id,
            user_id: ObjectID(req.body.user_id),
          },
        },
        {
          $sort: {
            timestamp: -1,
          },
        },
      ])
      .toArray(function (err, result) {
        console.log(result);
        res.json(result);
      });
  });
  // end call recording apis

  // application -------------------------------------------------------------
  app.get("/", function (req, res) {
    res.sendfile("./public/index.html"); // load the single view file (angular will handle the page changes on the front-end)
  });
  app.get("/workers", function (req, res) {
    res.sendfile("./public/workers.html"); // load the single view file (angular will handle the page changes on the front-end)
  });

  //	admin login -------------------
  app.get("/admin", function (req, res) {
    res.sendfile("./public/adminPanel.html"); // load the single view file (angular will handle the page changes on the front-end)
  });
};
