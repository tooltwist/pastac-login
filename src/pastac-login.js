'use strict';


angular.module('pastac-login', [])

.component('pastacLogin', {
  controller: PastacLoginController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    // See https://docs.angularjs.org/guide/component
    handler: '=', // struct with callbacks
    hideRegister: '<', // boolean
    hideForgot: '<', // boolean
    hideAvatar: '<', // boolean
    freshCredentials: '<', // boolean
    signin: '<', // boolean
    template: '<' // as-is string
  },

  templateUrl: function($element, $attrs) {
    var t = '../dist/pastac-login-navbar.html';
    if ($attrs.template) {
      switch($attrs.template) {
        case 'navbar' :
          console.log('pastac-login: using navbar template.');
          t = '../dist/pastac-login-navbar.html';
          break;

        case 'modal' :
          console.log('pastac-login: using modal template.');
          t = '../dist/pastac-login-modal.html';
          break;

        case 'page' :
          console.log('pastac-login: using page template.');
          t = '../dist/pastac-login-page.html';
          break;

        default:
          console.log('pastac-login: using custom template.');
          t = $attrs.template;
          break;
      }
    } else {
      console.log('pastac-login: using default template.');
    }
    console.log('template=>' + t);
    return t;
  },

});


function PastacLoginController($scope, $timeout) {
  var ctrl = this;
  var firstUser = true;
  var userHandler = null;

  ctrl.$onInit = function() {

    // Set the initial mode
    ctrl.loggedIn = false;

    userHandler = ctrl.handler;


    console.log('handler=', ctrl.handler);
    console.log('ctrl.freshCredentials=', ctrl.freshCredentials);


    // Get the user details.
    authservice.init({
      host: AUTHSERVICE_HOST,
      port: AUTHSERVICE_PORT,
      tenant: AUTHSERVICE_TENANT,
      pretend: AUTHSERVICE_USE_DUMMY_LOGIN,
      onUserChange: function(user, ttuat, stale) {

        // If the current user came from the cookie, reload it
        if (stale && ctrl.freshCredentials) {
          console.log('Reloading stale user details (came from cookie)');
          firstUser = false;
          return authservice.reloadUser();
        }

        // $timeout(function(){
          ctrl.user = user;
          console.log('\nUSER:', user);
        // });

        // Notify the page using this component of the change in user status
        if (userHandler && userHandler.onUserChange) {
          // ...but don't wait for the user function.
          $timeout(function(){
            userHandler.onUserChange(user, ttuat, stale);
          }, 0);
        }
      }
    });






  };//- onInit






}
