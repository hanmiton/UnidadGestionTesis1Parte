angular.module('mainController',['authServices', 'userServices'])

.controller('mainCtrl', function(Auth, $location, $timeout, $rootScope, $window, $interval, $route, User, AuthToken){
	//console.log('hanmilton')
	var app = this;
 	
 	app.loadme = false;

 	app.checkSession = function() {
 		if(Auth.isLoggedIn()) {
 			app.checkingSession = true;
 			var interval = $interval(function(){
 				var token = $window.localStorage.getItem('token');
 				if(token === null ) {
 					$interval.cancel(interval);
 				} else {
 					self.parseJwt = function(token) {
 						var base64Url = token.split('.')[1];
 						var base64 = base64Url.replace('-', '+').replace('_', '/');
 						return JSON.parse($window.atob(base64));
 					}

 					var expireTime = self.parseJwt(token);
 					var timeStamp = Math.floor(Date.now() / 1000);
 					console.log(expireTime.exp);
 					console.log(timeStamp); 
 					var timeCheck = expireTime.exp - timeStamp;
 					console.log('timeCheck : ' + timeCheck);
 					if(timeCheck <= 25) {
 						console.log('token ha expirado');
 						showModal(1);
 						$interval.cancel(interval);
 					} else {
 						console.log('token todavia no ha expirado');
 					}
 				}
 			} , 2000);
 		}
 	};

 	app.checkSession();


 	var showModal = function(option) {
 		app.choiceMade = false;
 		app.modalHeader = undefined;
 		app.modalBody = undefined;
 		app.hideButton = false;

 		if(option == 1) {
 			app.modalHeader = 'Advertencia de tiempo de espera';
	 		app.modalBody = 'Su sesion expirara en 5 min, ¿Quiere renovar la sesions?'
	 		$("#myModal").modal({backdrop : "static"});
	 			
 		} else if ( option == 2) {
 			app.hideButton = true;
 			app.modalHeader = 'Sesion Finalizada';
 			$("#myModal").modal({backdrop : "static"});
 			$timeout(function(){
 				Auth.logout();
 				$location.path('/');
 				hideModal();
 				$route.reload();
 			}, 2000);
 		}	
 		$timeout(function(){
 			if(!app.choiceMade) {
 				hideModal();
 			}
 		}, 4000);	
 	};

 	app.renewSession = function() {
 		app.choiceMade = true;
 		User.renewSession(app.username).then(function(data) {
 			if(data.data.success) {
 				AuthToken.setToken(data.data.token);
 				app.checkSession();
 			} else {
 				app.modalBody = data.data.message;
 			}
 		});





 		console.log('session ha sido renovada');
 		hideModal();
 	};

 	app.endSession = function() {
 		app.choiceMade = true;
 		hideModal();
 		$timeout(function(){
 			showModal(2);
 		}, 1000);  
 	};

 	var hideModal = function () {
 		$("#myModal").modal('hide');
 	};

	$rootScope.$on('$routeChangeStart', function() {
		if(!app.checkSession) app.checkSession();

		if (Auth.isLoggedIn()) {
			console.log('Success: User is logged in.');
			app.isLoggedIn = true;
			
			Auth.getUser().then(function(data) {
				//console.log(data.data.username);
				//console.log(data.data);
				app.username = data.data.username;
				app.useremail = data.data.email;

				User.getPermission().then(function(data) {
					if(data.data.permission === 'admin' || data.data.permission === 'moderator') {
						app.authorized = true;
						app.loadme = true;
					} else {
						app.loadme = true;
					}
				});
			});
		}else {
			console.log('Failure: User is NOT logged in.');
			app.isLoggedIn = false;
			app.username = '';
			app.loadme = true;
		}
		 if ($location.hash() == '_=_') $location.hash(null);

			
	});

	
	this.facebook = function() {
		app.disabled = true; 
		//console.log($window.location);
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
	};

	this.twitter = function() {
		app.disabled = true; 
		//console.log($window.location);
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
	};

	this.google = function() {
		app.disabled = true; 
		//console.log($window.location);
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
	};

	this.doLogin = function(loginData){
		app.loading= true;
		app.errorMsg = false;
		app.successMsg = false;
		app.expired = false;
		app.disabled = true;
		
		Auth.login(app.loginData).then(function(data){
			if(data.data.success){
				app.loading= false;
				app.successMsg = data.data.message + '...Redirigiendo';
				//redirect to hombe page
				$timeout(function(){
					$location.path('/about');
					app.loginData= '';
					app.successMsg = false;
					app.checkSession();
				},2000);

			}else{
				if(data.data.expired){
					//Create an error message
					app.expired = true;
					app.loading = false;
					app.errorMsg = data.data.message;
				} else {
					//Create on error message
					app.loading = false;
					app.disabled = true;
					app.errorMsg = data.data.message;
				}
			}

			//console.log(this.loginData);
			//console.log(data.data.message);
		});
	};

	app.logout = function() {
		showModal(2);
	};
});
	
	