angular.module('userApp', ['appRoutes','userControllers', 'userServices', 'mainController', 'authServices', 'managementController'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptors');
});