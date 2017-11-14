angular.module('userApp', ['appRoutes','userControllers', 'userServices', 'mainController', 'authServices', 'managementController','ingedex.controllers'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptors');
});