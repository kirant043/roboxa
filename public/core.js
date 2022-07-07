if (localStorage.remmemberme == "true") {

	window.location.href = '/workers?user_id=' + JSON.parse(window.localStorage.getItem("loggeduserdata"))._id
}
var scotchTodo = angular.module('scotchTodo', []);

function mainController($scope, $http, $window) {




	$scope.formData = {};
	$scope.user = {};

	$scope.user.emp_id = '';
	$scope.user.password = '';
	$scope.remmemberme = false;
	// when landing on the page, get all todos and show them
	
	$scope.loginByEnter = function(keyEvent) {
		if (keyEvent.which === 13)
		$scope.login();
	}


	$scope.login = function () {

		var msg = '';


		if ($scope.user.emp_id == '') {
			msg = "Please enter username!";


		} else if ($scope.user.password == '') {
			msg = "Please enter password!";

		}

		if (msg != '') {
			alert(msg)
		} else {




			$http.post('/api/userlogin', $scope.user)
				.success(function (data) {
					$scope.todossss = data;
					
					if ($scope.todossss.length == 0) {

						alert("wrong user and password");
					} else {
						//	added conditional block for admin login
						if ($scope.todossss.user === 'admin') {
							window.localStorage.setItem("accessrole", JSON.stringify(data))
							$window.location.href = '/admin'
							window.localStorage.setItem("roletoremmember", $scope.remmemberme);
						} else {
							window.localStorage.setItem("loggeduserdata", JSON.stringify(data[0]))
							$window.location.href = '/workers?user_id=' + JSON.parse(window.localStorage.getItem("loggeduserdata"))._id
							window.localStorage.setItem("remmemberme", $scope.remmemberme)
						}
					}

				})
				.error(function (data) {


					console.log('Error: ' + data);

				});
		}
	}


	$scope.uploaddocaws = function () {
		var fileChooser = document.getElementById('filedata');
		var pbaarupload = document.getElementById('pbaar');
		var file = fileChooser.files[0];
		if (file) {
			AWS.config.update({
				"accessKeyId": "AKIAJEKFDQWHJ5E6XV4A",
				"secretAccessKey": "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",
				"region": "us-east-1"
			});
			var s3 = new AWS.S3();

			var params = {
				Bucket: 'roboxadev',
				Key: file.name,
				ContentType: file.type,
				Body: file,
				ACL: 'public-read'
			};
			$scope.uploadfilename = file.name;
			// s3.putObject(params, function (err, res) {

			// });
			var uploadprogress = document.getElementById('uploadprogress');
			uploadprogress.style.display = "block";
			pbaarupload.innerText = "Please wait...";
			var request = s3.putObject(params);
			request.on('httpUploadProgress', function (progress) {



				pbaarupload.innerText = Math.round(progress.loaded / progress.total * 100) + "%";

				pbaarupload.setAttribute("style", "width: " + Math.round(progress.loaded / progress.total * 100) + "%");
			});
			request.on('success', function (response) {
				// logs a value like "cherries.jpg" returned from DynamoDB


				pbaarupload.innerText = " uploaded successfully";
				document.getElementById('filedata').value = '';


				var myobj = {
					uploadededby: "41412412",
					documenurl: "https://s3.amazonaws.com/roboxadev/" + file.name,
					docname: file.name,
					docsize: file.size,
					createdtime: new Date(),
					filetype: file.type.split("/")[0],
					etag: response.data.ETag.replace(/"/g, "")
				};
				$scope.inserdocdata(myobj);
				setTimeout(function () {
					uploadprogress.style.display = "none";
				}, 2000);


			});
			request.send();


		} else {
			alert("Please select file")
		}
	};

	$scope.showdatadoc = function () {
		var dataobj = {}
		$http.post('/api/showdatadoc', dataobj)
			.success(function (data) {

				console.log('Error: ' + data);
				$scope.userdoclistadata = data



			})
			.error(function (data) {
				console.log('Error: ' + data);
			});
	}


	$scope.inserdocdata = function (dataobj) {

		$http.post('/api/inserdocdata', dataobj)
			.success(function (data) {



			})
			.error(function (data) {
				console.log('Error: ' + data);
			});
		setTimeout(function () {
			$scope.showdatadoc();
		}, 2000);

	};

	$scope.CountRows = function (typetable) {

		var totalRowCount = 0;
		var rowCount = 0;
		var table = document.getElementById(typetable);
		var rows = table.getElementsByTagName("tr")
		for (var i = 0; i < rows.length; i++) {
			totalRowCount++;
			if (rows[i].getElementsByTagName("td").length > 0) {
				rowCount++;
			}
		}
		return totalRowCount;
	}




	$scope.kbtomb = function (bytes) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
	}

	$scope.deletedocmentconfirm = function (etag) {

		var x = confirm("Are you sure you want to delete?");
		if (x) {


			$scope.deletedocmentsingle(etag)
			return true;

		} else {
			return false;
		}

	}
	$scope.deletedocmentsingle = function (etagid) {

		var deleteobj = {
			etag: etagid
		};
		$http.post('/api/deletedocdata', deleteobj)
			.success(function (data) {



			})
			.error(function (data) {
				console.log('Error: ' + data);
			});
		setTimeout(function () {
			$scope.showdatadoc();
		}, 2000);
	}


	$scope.getuserlist = function () {
		$http.get('/api/userdetails')
			.success(function (data) {
				$scope.usersdatalist = data;
				$scope.showdatadoc();

			})
			.error(function (data) {
				console.log('Error: ' + data);
			});
	};


	// when submitting the add form, send the text to the node API
	$scope.createTodo = function () {
		$http.post('/api/todos', $scope.formData)
			.success(function (data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.todos = data;
				console.log(data);
			})
			.error(function (data) {
				console.log('Error: ' + data);
			});
	};

	// delete a todo after checking it
	$scope.deleteTodo = function (id) {
		$http.delete('/api/todos/' + id)
			.success(function (data) {
				$scope.todos = data;
			})
			.error(function (data) {
				console.log('Error: ' + data);
			});
	};

}


// function mainController($scope, $http) {
// 	$scope.formData = {};

// 	// when landing on the page, get all todos and show them
// 	$http.get('/api/client')
// 		.success(function(data) {
// 			$scope.todos = data;
// 		})
// 		.error(function(data) {
// 			console.log('Error: ' + data);
// 		});

// 	// when submitting the add form, send the text to the node API
// 	$scope.createTodo = function() {
// 		$http.post('/api/todos', $scope.formData)
// 			.success(function(data) {
// 				$scope.formData = {}; // clear the form so our user is ready to enter another
// 				$scope.todos = data;
// 				console.log(data);
// 			})
// 			.error(function(data) {
// 				console.log('Error: ' + data);
// 			});
// 	};

// 	// delete a todo after checking it
// 	$scope.deleteTodo = function(id) {
// 		$http.delete('/api/todos/' + id)
// 			.success(function(data) {
// 				$scope.todos = data;
// 			})
// 			.error(function(data) {
// 				console.log('Error: ' + data);
// 			});
// 	};

// }