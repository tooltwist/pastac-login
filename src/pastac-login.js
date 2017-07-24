'use strict';


angular.module('pastac-login', [])

.component('pastacLogin', {
  controller: PastacLoginController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    // See https://docs.angularjs.org/guide/component
    handler: '=', // struct with callbacks
    template: '<' // as-is string
    freshCredentials: '<', // boolean, don't use JWT from cookie

    // UI-related
    signin: '<', // boolean
    hideRegister: '<', // boolean
    hideForgot: '<', // boolean
    hideAvatar: '<', // boolean
    hideLogout: '<', // boolean

    // Registration-related
    registerFields: '<', // string (password,first_name,middle_name,last_name)
    registerResume: '<', // URL - where to go after email verification

    // OAuth2-related
    facebook: '<', // boolean
    google: '<', // boolean
    github: '<', // boolean
    resume: '<', // URL, where to go after OAuth2 login
    fail: '<', // URL, where to go after OAuth2 error
  },

  templateUrl: function($element, $attrs) {
    var t = '/bower_components/pastac-login/dist/pastac-login-navbar.html';
    if ($attrs.template) {
      switch($attrs.template) {
        case 'navbar' :
          //console.log('pastac-login: using navbar template.');
          t = '/bower_components/pastac-login/dist/pastac-login-navbar.html';
          break;

        case 'modal' :
          //console.log('pastac-login: using modal template.');
          t = '/bower_components/pastac-login/dist/pastac-login-modal.html';
          break;

        case 'page' :
          //console.log('pastac-login: using page template.');
          t = '/bower_components/pastac-login/dist/pastac-login-page.html';
          break;

        default:
          //console.log('pastac-login: using custom template.');
          t = $attrs.template;
          break;
      }
    } else {
      //console.log('pastac-login: using default template.');
    }
    console.log('pastac-login: template: ' + t);
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

    // Get the user details.
    authservice.init({
      host: AUTHSERVICE_HOST,
      port: AUTHSERVICE_PORT,
      tenant: AUTHSERVICE_TENANT,
      pretend: AUTHSERVICE_USE_DUMMY_LOGIN,
      onUserChange: function(user, ttuat, stale) {

        // If the current user came from the cookie, reload it
        if (stale && ctrl.freshCredentials) {
          console.log('pastac-login: Reloading stale user details (came from cookie)');
          firstUser = false;
          return authservice.reloadUser();
        }

        // $timeout(function(){
        ctrl.user = user;
        console.log('pastac-login: setting user:', user);
        // });

        // Notify the page using this component of the change in user status
        if (!ctrl.handler) {
          console.log('pastac-login: NOT calling handler.onUserChange (handler not defined)');
        } else if (!ctrl.handler.onUserChange) {
          console.log('pastac-login: NOT calling handler.onUserChange (handler.onUserChange not defined)');
        } else {
          // Call the user handler
          //console.log('pastac-login: calling handler.onUserChange');
          $timeout(function(){
            ctrl.handler.onUserChange(user, ttuat, stale);
          }, 1);
        };
      }
    });

    ctrl.initiateOAuth2 = function(authority) {
      if (!ctrl.resume) {
        alert('pastac-login: Missing parameter: resume\nOAuth2 logins are disabled.');
        return;
      }

      // See which URL we should use for errors in OAuth2 logins.
      if (ctrl.error) {
        var errorURL = ctrl.error;
      } else {
        var errorURL = '/bower_components/pastac-login/test/test-error.html';
      }

      // Initiate Authservice
      var baseURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var options = {
        authority: authority,
        successURL: baseURL + ctrl.resume,
        failURL: baseURL + ctrl.error
      };
      authservice.initiateOAuth2(options);
    }


    ctrl.doEmailSignin = function() {
      console.log('doEmailSignin(' + ctrl.username + ', ' + ctrl.password + ')');
      var password = ctrl.password;
      ctrl.password = '';
      authservice.login(ctrl.username, password, function(user) {
        ctrl.username = '';
        $('#pastac-login-modal').modal('hide')
        $('#pastac-login-navbar-dropdown').dropdown('toggle')
      }, function(error) {
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
      if (!ctrl.registerResume) {
        alert('pastac-login: Missing parameter: registerResume\nEmail registration is disabled.');
        return;
      }

      //ZZZZ Need a spinner

      // Call the Authservice server
      var baseURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var options = {
        email: ctrl.register_email,
        username: ctrl.register_email,
        resume: baseURL + ctrl.registerResume
      };
      if (ctrl.registerWithField('password')) {
        options.password = ctrl.register_password;
      }
      if (ctrl.registerWithField('first_name')) {
        options.first_name = ctrl.register_first_name;
      }
      if (ctrl.registerWithField('middle_name')) {
        options.middle_name = ctrl.register_middle_name;
      }
      if (ctrl.registerWithField('last_name')) {
        options.last_name = ctrl.register_last_name;
      }
      ctrl.register_password = '';

      console.log('doRegister()', options);
      authservice.register(options, function(user) {
        ctrl.mode = 'login';
        $('#pastac-login-navbar-dropdown').dropdown('toggle')
        $('#pastac-login-modal').modal('hide')
        $timeout(function () {
          alert('You have been Registered. Please check your email.')
        }, 10);
      }, function(error) {
        alert('Could not register: ' + error)
      })
    }

    ctrl.registerWithField = function(fieldname) {
      if (ctrl.registerFields) {
        var fields = ctrl.registerFields.split(',');
        for (var i = 0; i < fields.length; i++) {
          if (fields[i].trim() == fieldname) {
            return true;
          }
        }
      }
      return false;
    }



  };//- onInit






}
