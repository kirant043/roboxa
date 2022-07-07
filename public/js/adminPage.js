function download_img(el) {
    let canvas = $('.qrcodeImage > canvas').get(0);
    var image = canvas.toDataURL("image/png");
    el.href = image;
    /*canvas.toBlob(function (r) {
        saveAs(r, 'output.png');
    }, 'image/png');*/
};


function createierchart(first,second) {
google.load('visualization', '1.0', {
  'packages': ['corechart'],
  'callback': render
});

// Callback that creates and populates a data table,
// instantiates the chart, passes in the data and
// draws it.
function render() {

  // Create the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ['in', second],
    ['out',first]
   
  ]);

  // Set chart options
  var options = {

    'width': 280,
    'height': 300,
    pieSliceText: 'value',
    legend: {position: 'none'},
       colors: ['#a52714', '#097138'],

  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.PieChart(
    document.getElementById('chart_div'));
  chart.draw(data, options);

  setTimeout(function(){ 

  createtimewisegraph('byDay','Day');
 
     }, 200);
}



}

function createierchartallexpert(first,second) {
google.load('visualization', '1.0', {
  'packages': ['corechart'],
  'callback': render
});

// Callback that creates and populates a data table,
// instantiates the chart, passes in the data and
// draws it.
function render() {

  // Create the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addRows([
    ['in', second],
    ['out',first]
   
  ]);

  // Set chart options
  var options = {

    'width': 280,
    'height': 300,
    pieSliceText: 'value',
    legend: {position: 'none'},
       colors: ['#a52714', '#097138'],

  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.PieChart(
    document.getElementById('chart_divexpert'));
  chart.draw(data, options);

  setTimeout(function(){ 


     }, 200);
}



}


var globalchart;

      function linechartmap(){

        var data = globalchart;

var groups = (() => {
    var byDay = (item) => moment(item.start_date).format('MMM DD YYYY'),
        forHour = (item) => byDay(item) + ' ' + moment(item.start_date).format('hh a'),
        by6Hour = (item) => {
            var m = moment(item.start_date);
            return byDay(item) + ' ' + ['first', 'second', 'third', 'fourth'][Number(m.format('k')) % 8] + ' 8 hours';
        },
        forMonth = (item) => moment(item.start_date).format('MMM YYYY'),
        forWeek = (item) => forMonth(item) + ' ' + moment(item.start_date).format('ww');
    return {
        byDay,
        forHour,
        by6Hour,
        forMonth,
        forWeek,
    };
})();

var currentGroup = 'forHour';

var ob2=_.groupBy(data, groups[currentGroup])



var dfd=[]
Object.keys(ob2).forEach(function(key) {

    dfd.push(key)
    dfd.push(ob2[key].length)
});



var finalgraphdata=dfd.reduce(function(result, value, index, array) {
  if (index % 2 === 0)
    result.push(array.slice(index, index + 2));
  return result;
}, []);







      }



function hidegraph(){
    $("#chartmap").hide();
    
        $("#receivedCall").show();
}


function mapexpert() {

showloader()
 $.ajax({
            url: '/api/reportcallhistory',
            type: 'POST',
            data: {user_id:''},
            success: function (result) {
                console.log(result);
                 globalchart=result

         
            var incall =0
var outcall =0
function myFunction(item, index) {
// console.log(item.type)

if(item.type=="incoming"){
incall++
}
if(item.type=="outgoing"){
  outcall++
  
}

setTimeout(function(){
 // console.log(incall,outcall)
 hideloader()
 createierchartallexpert(incall,outcall)
 }, 500);

} 

result.forEach(myFunction);

            },
            error: function (err) {
                console.log(err);
           
            },
            statusCode: {
                401: function () {
              
                }
            }
        });
   // body...
}
function map(idd) {

showloader()
 $.ajax({
            url: '/api/reportcallhistory',
            type: 'POST',
            data: {user_id:idd},
            success: function (result) {
                // console.log(result);
                 globalchart=result

         mapexpert() 
            var incall =0
var outcall =0
function myFunction(item, index) {
// console.log(item.type)

if(item.type=="incoming"){
incall++
}
if(item.type=="outgoing"){
  outcall++
  
}

setTimeout(function(){
 // console.log(incall,outcall)
createierchart(incall,outcall)
 }, 500);

} 

result.forEach(myFunction)
            },
            error: function (err) {
                console.log(err);
           
            },
            statusCode: {
                401: function () {
              
                }
            }
        });
   // body...
}



function createtimewisegraph(type,xdata){
    showloader()
crbarchart(type,xdata)
 var data = globalchart;

var groups = (() => {
    var byDay = (item) => moment(item.start_date).format('MMM DD YYYY'),
        forHour = (item) => byDay(item) + ' ' + moment(item.start_date).format('hh a'),
        by6Hour = (item) => {
            var m = moment(item.start_date);
            return byDay(item) + ' ' + ['first', 'second', 'third', 'fourth'][Number(m.format('k')) % 8] + ' 8 hours';
        },
        forMonth = (item) => moment(item.start_date).format('MMM YYYY'),
        forWeek = (item) => forMonth(item) + ' ' + moment(item.start_date).format('ww');
    return {
        byDay,
        forHour,
        by6Hour,
        forMonth,
        forWeek,
    };
})();

var currentGroup = type
// console.log(_.groupBy(data, groups[currentGroup]));
var ob2=_.groupBy(data, groups[currentGroup])



var dfd=[]
Object.keys(ob2).forEach(function(key) {

    dfd.push(key)
    dfd.push(ob2[key].length)
});



var finalgraphdata=dfd.reduce(function(result, value, index, array) {
  if (index % 2 === 0)
    result.push(array.slice(index, index + 2));
  return result;
}, []);


// console.log(finalgraphdata)




///line chart

google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawLogScales);

function drawLogScales() {
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'X');
      data.addColumn('number', 'no of calls');
      

      data.addRows(finalgraphdata);

     var view = new google.visualization.DataView(data);
     view.setColumns([{ sourceColumn: 0, type: 'string',
       calc: function(dt, rowIndex) {
         return String(dt.getValue(rowIndex, 0));
       }}, 1]);
     
      var options = {
        hAxis: {
          title: xdata,
          logScale: false
      
        },
        vAxis: {
          title: 'calls',
          logScale: false
      
        },
        colors: ['#a52714', '#097138'],
        width: 900,
        height: 300,
      pointSize: 5
      };
    
      var chart = new google.visualization.LineChart(document.getElementById('chart_div2'));
      chart.draw(view, options);
    }

hideloader()
    var finalgraphdata2=dfd.reduce(function(result, value, index, array) {
  if (index % 3 === 0)
    result.push(array.slice(index,index+3));
  return result;
}, []);

//bar 


}



function crbarchart(type,xdata){ 

      var data = globalchart;

var groups = (() => {
    var byDay = (item) => moment(item.start_date).format('MMM DD YYYY'),
        forHour = (item) => byDay(item) + ' ' + moment(item.start_date).format('hh a'),
        by6Hour = (item) => {
            var m = moment(item.start_date);
            return byDay(item) + ' ' + ['first', 'second', 'third', 'fourth'][Number(m.format('k')) % 8] + ' 8 hours';
        },
        forMonth = (item) => moment(item.start_date).format('MMM YYYY'),
        forWeek = (item) => forMonth(item) + ' ' + moment(item.start_date).format('ww');
    return {
        byDay,
        forHour,
        by6Hour,
        forMonth,
        forWeek,
    };
})();

var currentGroup = type;
// console.log(_.groupBy(data, groups[currentGroup]));
var ob2=_.groupBy(data, groups[currentGroup])



var dfd=[]
Object.keys(ob2).forEach(function(key) {
    var dds=ob2[key];
    var inco=[]
    var outgo=[]
    dds.forEach(function(key2) {

// console.log(key, key2.type);

if(key2.type=="incoming"){

inco.push('1');

}else if(key2.type=="outgoing"){

  outgo.push('1');


}
  
    })

    dfd.push(key)
    dfd.push(outgo.length)
       dfd.push(inco.length)
});



var finalgraphdata2=dfd.reduce(function(result, value, index, array) {
  if (index % 3 === 0)
    result.push(array.slice(index,index+3));
  return result;
}, []);




google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(drawbar);

var chart;

var options;

function drawbar() {

var datas=[];

var Header= ['Element',' Outgoing call',' Incoming call', { role: 'style' }];
 
datas.push(Header);

for (var i = 0; i < finalgraphdata2.length; i++) {

      var temp=[];
      temp.push(finalgraphdata2[i][0]);
      temp.push(finalgraphdata2[i][1]);
          temp.push(finalgraphdata2[i][2]);
      temp.push("#097138"); //this will change based on value of 'i' variable
      datas.push(temp);

      if(eval(i+1)==finalgraphdata2.length){
        var chartdata = new google.visualization.arrayToDataTable(datas);
      }
  }

hideloader()
options = {

 hAxis: {
          title: xdata,
          logScale: false
      
        },
        vAxis: {
          title: 'calls',
          logScale: false
      
        },  gridlines: { count: -1},

        colors: ['#a52714', '#097138'],

'width': 600,
'height': 300
};

chart = new google.visualization.ColumnChart(document.getElementById('chart_div22'));
chart.draw(chartdata, options);
}
drawbar()
      }

function generateQRCode(code) {
    $(".qrcodeImage").empty().qrcode({
        width: 174,
        height: 174,
        text: code
    });
}
$(document).ready(function () {
    refreshData();
    $("#v-pills-home-tab").on('show.bs.tab', function () {
        //  update the users list
        refreshData();
    });
    $("#v-pills-profile-tab").on('show.bs.tab', function () {
        fetchWorkerList(function (result) {
            $("#addWorkerFromList").empty();
            let newArr = result.filter(r => r.supervisor_id == null || r.supervisor_id == '');
            $.each(newArr, function (idx, val) {
                $("#addWorkerFromList").append(
                    `<option value=${"'"+val._id+"'"}>${val.emp_id}</option>`
                );
            });
            $("#addWorkerFromList").customselect({
                list: newArr,
                checked: []
            });
        });
    });

    $('form').on('submit', function (e) {
        e.preventDefault();
    });
    $("#createSupervisorForm").on('submit', function () {
        $(this).find('input[name="access_role"]').val(setAccessRole());
        $.ajax({
            url: '/user/supervisor',
            type: 'POST',
            data: $(this).serialize(),
            success: function (result) {
                console.log(result);
                if (result) {
                    $("#createSupervisorForm").find(".invalid-feedback").hide();
                    $("#calbusyuser").find(".forUserType").text('Expert');
                    $("#calbusyuser").find(".modal-msg-text").text('Created');
                    $("#edituser").modal("hide");
                    $("#calbusyuser").modal("show");
                    $("#createSupervisorForm").trigger("reset");
                    fetchWorkerList(function (result) {
                        $("#addWorkerFromList").empty();
                        let newArr = result.filter(r => r.supervisor_id == null || r.supervisor_id == '');
                        $.each(newArr, function (idx, val) {
                            $("#addWorkerFromList").append(
                                `<option value=${"'"+val._id+"'"}>${val.emp_id}</option>`
                            );
                        });
                        $("#addWorkerFromList").customselect({
                            list: newArr,
                            checked: []
                        });
                    });
                } else {
                    $("#createSupervisorForm").find(".invalid-feedback").show();
                }
                //clear_form_elements("createSupervisorForm")
            },
            error: function (err) {
                console.log(err);
                $("#edituser").modal("hide");
                $("#alertupload").modal("show");
            },
            statusCode: {
                401: function () {
                    $('#myOverlay').hide();
                    $('#loadingGIF').hide();
                    alert("Unauthorized access, please login to proceed.");
                }
            }
        });
    });
    $("#createWorkerForm").on('submit', function () {
        $(this).find('input[name="access_role"]').val(setAccessRole());
        $.ajax({
            url: '/user/worker',
            type: 'POST',
            data: $(this).serialize(),
            success: function (result) {
                console.log(result);
                if (result) {
                    $("#createWorkerForm").find(".invalid-feedback").hide();
                    $("#calbusyuser").find(".forUserType").text('Technician');
                    $("#calbusyuser").find(".modal-msg-text").text('Created');
                    $("#edituser").modal("hide");
                    $("#calbusyuser").modal("show");
                    $("#createWorkerForm").trigger("reset");
                } else {
                    $("#createWorkerForm").find(".invalid-feedback").show();
                }

                //clear_form_elements("createWorkerForm");
            },
            error: function (err) {
                console.log(err);
                $("#edituser").modal("hide");
                $("#alertupload").modal("show");
            },
            statusCode: {
                401: function () {
                    $('#myOverlay').hide();
                    $('#loadingGIF').hide();
                    alert("Unauthorized access, please login to proceed.");
                }
            }
        });
    });

    $("#calbusyuser").on('hide.bs.modal', function () {
        refreshData();
    });
});

function refreshData() {
    $('#myOverlay').show();
    $('#loadingGIF').show();
    apiCall4UserList();
}



function setAccessRole() {
    if (null != window.localStorage.getItem("accessrole")) {
        return JSON.parse(window.localStorage.getItem("accessrole")).emp_id;
    } else {
        return;
    }
}

function clear_form_elements(id_name) {
    $("#" + id_name).find(':input').each(function () {
        switch (this.type) {
            case 'password':
            case 'text':
            case 'textarea':
            case 'file':
            case 'select-one':
            case 'select-multiple':
            case 'date':
            case 'number':
            case 'tel':
            case 'email':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;
                break;
        }
    });
}

function allexpertlist(){
     if (null != window.localStorage.getItem("accessrole")) {
        let dataToSend = {
            'access_role': JSON.parse(window.localStorage.getItem("accessrole")).emp_id
        }
        $.get('/view/supervisor', dataToSend, function (result) {
            console.log(result)
              map(result[0]._id)
            $.each(result, function (i, item) {
    $('#expertoption').append($('<option>', { 
        value: item._id,
        text : item.f_name 
    }));
});
   });
    }

}

$('#expertoption').on('change', function() {

  map(this.value)
});
// console.log = function() {}

allexpertlist()
function apiCall4UserList() {
    if (null != window.localStorage.getItem("accessrole")) {
        let dataToSend = {
            'access_role': JSON.parse(window.localStorage.getItem("accessrole")).emp_id
        }
        $.get('/view/supervisor', dataToSend, function (result) {
            console.log(result)
            if (result) {
                let count = 0;
                $("#reciveCalls").empty();
                $("#reciveCalls").data('supervisorList', result);
                $.each(result, function (idx, val) {
                    count = idx + 1;
                    $("#reciveCalls").append(
                        `<div class="card"><div class="card-header"><div class="row">
                                                <div class="col-4 col-sm-3">
                                                    <span>${val.f_name+' '+val.l_name}</span>
                                                </div>
                                                <div class="col-3 col-sm-2">
                                                    <span>${val.emp_id}</span>
                                                </div>
                                                <div class="col-3 col-sm-3">
                                                    <span>${val.location}</span>
                                                </div>
                                                <div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">
                                                    <span>${val.email}</span>
                                                </div>
                                                <div class="col-2 col-sm-2 text-center">
                                                    <span class="btn btn-sm btn-info" onclick="viewModal('${val._id}','supervisor')">View</span>
                                                    <span class="btn btn-sm btn-info" onclick="editModal('${val._id}','supervisor')">Edit</span>
                                                    <span class="btn btn-sm btn-info" onclick="deleteModal('${val._id}','supervisor')">Delete</span>
                                                 

                                                </div>

                                            </div></div></div>`
                    );
                });
                $("#reciveCallCount > span.numbers >  span.digits").empty().append(count);
                $('#myOverlay').hide();
                $('#loadingGIF').hide();
            }
        });
        $.get('/view/worker', dataToSend, function (result) {
            if (result) {
                let count = 0;
                $("#outgoingCalls").empty();
                $("#outgoingCalls").data('workerList', result);
                $.each(result, function (idx, val) {
                    count = idx + 1;
                    $("#outgoingCalls").append(
                        `<div class="card"><div class="card-header"><div class="row">
                                                <div class="col-4 col-sm-3">
                                                    <span>${val.f_name+' '+val.l_name}</span>
                                                </div>
                                                <div class="col-3 col-sm-2">
                                                    <span>${val.glass_id}</span>
                                                </div>
                                                <div class="col-3 col-sm-3">
                                                    <span>${val.location}</span>
                                                </div>
                                                <div class="col-2 col-sm-2 hide-on-mobile ellipsis-text">
                                                    <span>${val.email}</span>
                                                </div>
                                                <div class="col-2 col-sm-2 text-center">
                                                    <span class="btn btn-sm btn-info" onclick="viewModal('${val._id}','worker')">View</span>
                                                    <span class="btn btn-sm btn-info" onclick="editModal('${val._id}','worker')">Edit</span>
                                                    <span class="btn btn-sm btn-info" onclick="deleteModal('${val._id}','worker')">Delete</span>
                                                </div>
                                            </div></div></div>`
                    );
                });
                $("#outgoingCallCount > span.numbers > span.digits").empty().append(count);
                $('#myOverlay').hide();
                $('#loadingGIF').hide();
            }
        });
    } else {
        $('#myOverlay').hide();
        $('#loadingGIF').hide();
        alert("Unauthorized access, please login to proceed.");
    }
}

function showloader(){
 $('#myOverlay').show();
                $('#loadingGIF').show();
}
function hideloader(){
      $('#myOverlay').hide();
                $('#loadingGIF').hide();
}


function deleteModal(id, userType) {
    $("#deleteuser").modal('show');
    var user, viewUserForm, code;

    if (userType == 'supervisor') {
        $("#deleteuser").find('.forUserType').show();
        $("#deleteuser").find('.forUserType2').hide();
    } else {
        $("#deleteuser").find('.forUserType').hide();
        $("#deleteuser").find('.forUserType2').show();
    }

    $("#deleteuser").find('.proceedDelete').unbind('click');
    $("#deleteuser").find('.proceedDelete').on('click', function () {
        $.ajax({
            url: '/delete/' + userType + '?user_id=' + id,
            type: 'DELETE',
            success: (res) => {
                $("#deleteuser").modal('hide');
                refreshData();
            },
            error: () => {}
        });
    });
}

function viewModal(id, userType) {
    var user, viewUserForm, code;
    if (userType == 'supervisor') {
        user = $("#reciveCalls").data('supervisorList').filter(val => {
            if (val._id == id) {
                return val;
            }
        })[0];
        viewUserForm = $(
            `<div class="table-responsive">
                                    <table class="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td scope="row">First Name</th>
                                                <td >${user.f_name}</td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Last Name</th>
                                                <td >${user.l_name}</td>
                                            </tr>
                                            <tr>
                                                <td  scope="row">Email</th>
                                                <td >${user.email}</td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Emp ID</th>
                                                <td >${user.emp_id}</td>
                                            </tr>
                                            <!-- <tr>
                                                <td scope="row">Username</th>
                                                <td>${user.user_name}</td>
                                            </tr> -->
                                            
                                            <!-- <tr>
                                                <td  scope="row">Company</th>
                                                <td >${user.company}</td>
                                            </tr> -->
                                            
                                            <tr>
                                                <td scope="row">Password</th>
                                                <td>${user.password}</td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Location</th>
                                                <td>${user.location}</td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Technicians</th>
                                                <td class="workersListDisplay"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>`
        );
        fetchWorkerList(function (result) {
            viewUserForm.find(".workersListDisplay").empty();
            let valStr = '';
            $.each(result, function (idx, val) {
                if (user.worker_list.includes(val._id)) {
                    valStr += val.emp_id + ", ";
                }
            });
            console.log(valStr.length, " ", valStr.substring(0, valStr.length - 2));
            valStr = valStr.substring(0, valStr.length - 2);
            viewUserForm.find(".workersListDisplay").append(`<span>${valStr} </span>`);
        });
    } else if (userType == 'worker') {
        user = $("#outgoingCalls").data('workerList').filter(val => {
            if (val._id == id) {
                return val;
            }
        })[0];
        viewUserForm = $(
            `<div class="table-responsive table-bordered">
                                    <table class="table">
                                        <tbody>
                                            <tr>
                                                <td scope="row">First Name</th>
                                                <td >${user.f_name}</td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Last Name</th>
                                                <td >${user.l_name}</td>
                                            </tr>
                                            <tr>
                                                <td  scope="row">Email</th>
                                                <td>${user.email}</td>
                                            </tr>
                                            <tr>
                                                <td  scope="row">Glass ID</th>
                                                <td>${user.glass_id}</td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Supervisor</th>
                                                <td class="asignedSupervisor"></td>
                                            </tr>
                                            <!-- <tr>
                                                <td  scope="row">Username</th>
                                                <td >${user.user_name}</td>
                                            </tr> -->
                                            <tr>
                                                <td scope="row">Location</th>
                                                <td>${user.location}</td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Qr Code </th>
                                                <td><div class="d-flex justify-content-between">
                                                    <div class="qrcodeImage"></div>
                                                    <a class="btn btn-sm btn-success align-self-center" id="downloadQRCode" href="" onclick="download_img(this)" download="qrcode.png">Download QR Code</a>
                                                </div></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>`
        );
        code = user.qr_code;
        fetchSupervisorList(function (result) {
            let valStr = '';
            $.each(result, function (idx, val) {
                if (user.supervisor_id == val._id) {
                    viewUserForm.find(".asignedSupervisor").append(`<span>${val.name}</span>`);
                }
            });
        });
    }
    $("#viewuser .modal-body").empty().append(viewUserForm);
    if (userType == 'worker') {
        generateQRCode(code);
    }
    $("#viewuser").modal("show");
}

function editModal(id, userType) {
    console.log(id);
    var user, editUserForm, forUser;
    if (userType == 'supervisor') {
        forUser = 'Expert';
        user = $("#reciveCalls").data('supervisorList').filter(val => {
            if (val._id == id) {
                return val;
            }
        })[0];
        editUserForm = $(
            `<div class="table-responsive">
                        <input type="hidden" name="access_role" value=${setAccessRole()}/>
                        <input type="hidden" name="id" value="${id}" />
                                    <table class="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td scope="row">First Name</th>
                                                <td ><input type="text" value="${user.f_name}" class="form-control" name="f_name" id="edit_super_fname"
                                            placeholder="First Name" required></td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Last Name</th>
                                                <td ><input type="text" value="${user.l_name}" class="form-control" name="l_name" id="edit_super_lname"
                                            placeholder="Last Name" required></td>
                                            </tr>
                                            <tr>
                                                <td  scope="row">Email</th>
                                                <td ><input type="email" class="form-control" value="${user.email}" name="email" id="edit_super_email"
                                            placeholder="Email" required></td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Emp ID</th>
                                                <td ><input type="text" class="form-control" name="emp_id" id="edit_super_empID" value="${user.emp_id}"
                                            placeholder="ID" required></td>
                                            </tr>
                                            <!-- <tr>
                                                <td scope="row">Username</th>
                                                <td><input type="text" class="form-control" name="user_name" value="${user.user_name}" id="edit_super_username"
                                            placeholder="Username" required></td>
                                            </tr> -->
                                            
                                            <tr>
                                                <td  scope="row">Password</th>
                                                <td ><input type="text" class="form-control" name="password" value="${user.password}" id="edit_super_password"
                                            placeholder="Password" required></td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Location</th>
                                                <td><input type="text" class="form-control" name="location" id="edit_super_location" value="${user.location}"
                                            placeholder="Location" required></td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Technicians</th>
                                                <td class="">
                                                    <select multiple class="form-control" id="editWorkerFromList" name="worker_list" required>
                                        </select>
<small>
  Select  at least one technician
</small>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>`
        );

        fetchWorkerList(function (result) {
            editUserForm.find("#editWorkerFromList").empty();
            let chkVal = [];
            let newArr = result.filter(r => r.supervisor_id == null || r.supervisor_id == '' || r.supervisor_id == user._id);
            $.each(newArr, function (idx, val) {
                if (user.worker_list != null && user.worker_list.includes(val._id)) {
                    chkVal.push(val._id);
                    editUserForm.find("#editWorkerFromList").append(
                        `<option value=${"'"+val._id+"'"} selected>${val.emp_id}</option>`
                    );
                } else {
                    editUserForm.find("#editWorkerFromList").append(
                        `<option value=${"'"+val._id+"'"}>${val.emp_id}</option>`);
                }
            });
            $("#editWorkerFromList").customselect({
                list: newArr,
                checked: chkVal
            });
        });
    } else if (userType == 'worker') {
        forUser = 'Technician';
        user = $("#outgoingCalls").data('workerList').filter(val => {
            if (val._id == id) {
                return val;
            }
        })[0];
        editUserForm = $(
            `<div class="table-responsive">
                        <input type="hidden" name="access_role" value=${setAccessRole()} />
                        <input type="hidden" name="id" value="${id}" />
                                    <table class="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td scope="row">First Name</th>
                                                <td ><input type="text" class="form-control" name="f_name" id="edit_worker_fname" value="${user.f_name}"
                                            placeholder="First Name" required></td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Last Name</th>
                                                <td ><input type="text" class="form-control" name="l_name" id="edit_worker_lname" value="${user.l_name}"
                                            placeholder="Last Name" required></td>
                                            </tr>
                                            <tr>
                                                <td  scope="row">Email</th>
                                                <td><input type="email" class="form-control" name="email" id="edit_worker_email" value="${user.email}"
                                            placeholder="Email" required></td>
                                            </tr>
                                            <tr>
                                                <td  scope="row">Glass ID</th>
                                                <td><input type="text" class="form-control" name="glass_id" id="edit_worker_glassId" value="${user.glass_id}"
                                            name="glass_id" placeholder="ID" required></td>
                                            </tr>
                                            <tr>
                                                <td  scope="row">Supervisor</th>
                                                <td>
                                                    <select class="form-control" name="supervisor_id" id="edit_worker_supervisorID"></select>
                                                </td>
                                            </tr>
                                            <!-- <tr>
                                                <td  scope="row">Username</th>
                                                <td ><input type="text" class="form-control" name="user_name" id="edit_worker_username" value="${user.user_name}"
                                            placeholder="Username" required></td>
                                            </tr> -->
                                            <tr>
                                                <td scope="row">Location</th>
                                                <td><input type="text" id="edit_worker_location" name="location" class="form-control" value="${user.location}"
                                            placeholder="Location" required></td>
                                            </tr>
                                            <tr>
                                                <td scope="row">Qr Code </th>
                                                <td><input required type="text" class="form-control" name="qr_code" id="edit_worker_qrcode" value="${user.qr_code}" placeholder="Password"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>`
        );
        fetchSupervisorList(function (result) {
            editUserForm.find("#edit_worker_supervisorID").empty();
            $.each(result, function (idx, val) {
                if (user.supervisor_id != null && user.supervisor_id == val._id) {
                    editUserForm.find("#edit_worker_supervisorID").append(
                        `<option value=${"'"+val._id+"'"} selected>${val.name}</option>`
                    );
                } else {
                    editUserForm.find("#edit_worker_supervisorID").append(
                        `<option value=${"'"+val._id+"'"}>${val.name}</option>`);
                }
            });
            //$("#edit_worker_supervisorID").customselect({list:result,checked:chkVal});
        });
    }

    $("#edituser .modal-body").empty().append(editUserForm);
    //if(userType == 'worker'){
    //generateQRCode('edit','#editUserForm');
    //}

    $('#editUserForm').unbind('submit');
    $('#editUserForm').on('submit', function (e) {
        if (userType == 'supervisor') {
            storeTo = 'supervisor';
        } else if (userType == 'worker') {
            storeTo = 'worker';
        }
        e.preventDefault();
        let formdata = $(this).serialize();
        formdata['id'] = id;
        $.ajax({
            url: '/user/' + storeTo,
            type: 'PUT',
            data: $(this).serialize(),
            success: function (result) {
                console.log(result);
                if (result) {
                    $("#edituser").modal("hide");
                    $("#calbusyuser").modal("show");
                    $("#calbusyuser").find(".forUserType").text(forUser);
                    $("#calbusyuser").find(".modal-msg-text").text('Updated');
                }
            },
            error: function (err) {
                console.log(err);
                $("#edituser").modal("hide");
                $("#alertupload").modal("show");
            },
            statusCode: {
                401: function () {
                    $('#myOverlay').hide();
                    $('#loadingGIF').hide();
                    alert("Unauthorized access, please login to proceed.");
                }
            }
        });
    });
    $("#edituser").modal("show");
}

//  function to fetch workers list
function fetchWorkerList(callback) {
    $.get('/get/workerlist', function (result) {
        callback(result);
    });
}

function fetchSupervisorList(callback) {
    $.get('/get/supervisorlist', function (result) {
        callback(result);
    });
}

function logout(argument) {
    //setCookie("user_id", "", 10);
    window.location.href = "http://" + window.location.host
    //localStorage.clear()
    localStorage.setItem("accessrole", "");
    localStorage.setItem("roletoremmember", "");
}

function myFunction() {
    var x = document.getElementById("v-pills-tab");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}
(function ($) {

    $.fn.customselect = function (options) { //adds optional filters from an array of options with "label" and "classURI"
        let that = this;
        let forID = new Date();
        let selectBox = $(`<div class="dropdown">
            <button class="btn dropdown-toggle w-100" style="background:unset;border: 1px solid #ced4da;text-align:left;color:#7f758d;" type="button" id="${forID}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Select</button>
            <div class="dropdown-menu custome-multi-select w-100 p-2" aria-labelledby="${forID}"></div>
        </div>`);
        $.each(options.list, function (i, v) {
            let chk = $(`<div class="form-check">
                <input class="form-check-input" type="checkbox" value="${"'"+v._id+"'"}" id="${"'"+v._id+v.emp_id+"'"}">
                <label class="form-check-label" for="${"'"+v._id+v.emp_id+"'"}">
                    ${v.emp_id}
                </label>
            </div>`);
            if (options.checked.includes(v._id)) {
                chk.find('input').prop('checked', true);
            }
            selectBox.find('.custome-multi-select').append(chk);
        });
        selectBox.find('.dropdown-menu.custome-multi-select').on('click', function (e) {
            e.stopPropagation();
        });
        that.siblings('.dropdown').remove();
        selectBox.insertBefore(this);
        selectBox.find('input').on('change', function () {
            if (this.checked) {
                that.find('option[value=' + $(this).val() + ']').prop('selected', true);
            } else {
                that.find('option[value=' + $(this).val() + ']').prop('selected', false);
            }
        });
        that.hide();
        return that;
    }

}(jQuery));