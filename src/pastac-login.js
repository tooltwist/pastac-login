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
    registerWithPassword: '<', // boolean
    facebook: '<', // boolean
    google: '<', // boolean
    github: '<', // boolean
    signin: '<', // boolean
    template: '<' // as-is string
  },

  templateUrl: function($element, $attrs) {
    var t = '/bower_components/pastac-login/dist/pastac-login-navbar.html';
    if ($attrs.template) {
      switch($attrs.template) {
        case 'navbar' :
          console.log('pastac-login: using navbar template.');
          t = '/bower_components/pastac-login/dist/pastac-login-navbar.html';
          break;

        case 'modal' :
          console.log('pastac-login: using modal template.');
          t = '/bower_components/pastac-login/dist/pastac-login-modal.html';
          break;

        case 'page' :
          console.log('pastac-login: using page template.');
          t = '/bower_components/pastac-login/dist/pastac-login-page.html';
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
    ctrl.mode = 'login';
    ctrl.setMode = function(mode) { ctrl.mode = mode; }

    userHandler = ctrl.handler;


    console.log('handler=', ctrl.handler);
    console.log('ctrl.freshCredentials=', ctrl.freshCredentials);
    console.log('ctrl.registerWithPassword=', ctrl.registerWithPassword);


    // Get the user details.
    authservice.init({
      host: AUTHSERVICE_HOST,
      port: AUTHSERVICE_PORT,
      tenant: AUTHSERVICE_TENANT,
      pretend: AUTHSERVICE_USE_DUMMY_LOGIN,
      registerWithPassword: ctrl.registerWithPassword,
      onUserChange: function(user, ttuat, stale) {

        // If the current user came from the cookie, reload it
        if (stale && ctrl.freshCredentials) {
          console.log('Reloading stale user details (came from cookie)');
          firstUser = false;
          return authservice.reloadUser();
        }

        // $timeout(function(){
        ctrl.user = user;
        console.log('\nSETTING USER:', user);
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

    ctrl.initiateOAuth2 = function(authority) {
      authservice.initiateOAuth2(authority);
    }


    ctrl.doEmailSignin = function() {
      console.log('doEmailSignin(' + ctrl.username + ', ' + ctrl.password + ')');
      var password = ctrl.password;
      ctrl.password = '';
      authservice.login(ctrl.username, password, function(user) {
        ctrl.username = '';
        $('#pastac-login-modal').modal('hide')
      }, function(error) {
        //alert('Could not login: ' + error)
        $timeout(function() {
          ctrl.loginError = error;
        }, 100);
      })
    }

    ctrl.doLogout = function() {
      //alert('ctrl.doLogout()')
      authservice.logout();
      ctrl.username = '';
      ctrl.password = '';
    }


    ctrl.doRegister = function() {

      //ZZZZ Need a spinner
      var email = ctrl.register_email;
      var password = ctrl.register_password;
      ctrl.register_password = '';


      console.log('doRegister(' + email + ', ' + email + ', ' + password + ')');
      authservice.register(email, email, password, function(user) {
        alert('You have been Registered. Check your email.')
      }, function(error) {
        alert('Could not login: ' + error)
      })
    }


  };//- onInit






}
