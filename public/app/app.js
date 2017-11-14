angular.module('userApp', ['appRoutes','userControllers', 'userServices', 'mainController', 'authServices', 'managementController','ingedex.controllers',
    'ingedex.directives',
    'ingedex.filters'])

.config(function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptors');
});