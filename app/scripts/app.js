'use strict';

/**
 * @ngdoc overview
 * @name keycloackApp
 * @description
 * # keycloackApp
 *
 * Main module of the application.
 */
// on every request, authenticate user first
// on every request, authenticate user first
angular.element(document).ready(() => {
    window._keycloak = Keycloak('keycloak/keycloak.json');

    window._keycloak.init({
        onLoad: 'login-required'
    })
    .success((authenticated) => {
        if(authenticated) {
            window._keycloak.loadUserProfile().success(function(profile){
                bootstrapAngular(window._keycloak, profile); //manually bootstrap Angular
            });
        }
        else {
            window.location.reload();
        }
    })
    .error(function () {
        window.location.reload();
    });
});

angular
  .module('keycloackApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  //Intercept the http request
  .config(function ($httpProvider){
    //$httpProvider.interceptors.push('AuthIntercpetor');
    $httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
  })
;

function bootstrapAngular(keycloak, userInfo) {
    angular.module('keycloackApp')
      .run(function ($rootScope, $http, $interval, $cookies) {
      
        var updateTokenInterval = $interval(function () {
        // refresh token if it's valid for less then 15 minutes
        keycloak.updateToken(15)
            .success(function (refreshed) {
              if (refreshed) {
                $cookies.put('X-Authorization-Token', keycloak.token);
              }
            });
        }, 10000);

        $cookies.put('X-Authorization-Token', keycloak.token);

        $rootScope.userLogout = function () {
          $cookies.remove('X-Authorization-Token');
          $interval.cancel(updateTokenInterval);
          $rootScope.userInfo = {};  
          keycloak.logout();
        };

        $rootScope.authData = {};

        $rootScope.userInfo = userInfo;
        $rootScope.userRoles = keycloak.realmAccess.roles;
        
        console.log(userInfo);
        
//				$http.jsonp("http://localhost:9000/test?callback=JSON_CALLBACK")
//					.success(function (response) {
//						$rootScope.authData.token = response.token;
//						$rootScope.authData.username = response.username;
//					});
      });

    angular.bootstrap(document, ['keycloackApp']);
  }

