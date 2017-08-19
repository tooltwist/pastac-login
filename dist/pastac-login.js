'use strict';


angular.module('pastac-login', [])

.component('pastacLogin', {
  controller: PastacLoginController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    // See https://docs.angularjs.org/guide/component
    config: '<',
    handler: '=', // struct with callbacks
    template: '<', // as-is string
    freshCredentials: '<', // boolean, don't use JWT from cookie

    // UI-related
    loginWithUsername: '<', // boolean
    signin: '<', // boolean
    hideRegister: '<', // boolean
    hideForgot: '<', // boolean
    hideAvatar: '<', // boolean
    hideLogout: '<', // boolean
    bindToDom: '<', // boolean
    extraMenuItems: '<', // string ([+-]tag:label, ...) + = logged in, - = logged out.

    // Registration-related
    registerFields: '<', // string (password,first_name,middle_name,last_name)
    registerResume: '<', // URL - where to go after email verification
    forgotResume: '<', // URL - where to go after email verification

    // OAuth2-related
    facebook: '<', // boolean
    google: '<', // boolean
    github: '<', // boolean
    resume: '<', // URL, where to go after OAuth2 login
    fail: '<' // URL, where to go after OAuth2 error
  },

  templateUrl: function($element, $attrs) {
    var t = '/bower_components/pastac-login/dist/pastac-login-navbar.html';
    if ($attrs.template) {
      switch($attrs.template) {
        case 'invisible' :
          //console.log('pastac-login: using navbar template.');
          t = '/bower_components/pastac-login/dist/pastac-login-invisible.html';
          break;

        case 'user' :
          //console.log('pastac-login: using navbar template.');
          t = '/bower_components/pastac-login/dist/pastac-login-user.html';
          break;

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
  },//- templateUrl

}) //- .component pastacLogin

.component('pastacUserDetails', {
  controller: PastacLoginController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    // See https://docs.angularjs.org/guide/component
    config: '<',
    handler: '=', // struct with callbacks
    template: '<', // as-is string
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
    fail: '<' // URL, where to go after OAuth2 error
  },

  templateUrl: function($element, $attrs) {
    var t = '/bower_components/pastac-login/dist/pastac-login-navbar.html';
    if ($attrs.template) {
      switch($attrs.template) {
        case 'invisible' :
          //console.log('pastac-login: using navbar template.');
          t = '/bower_components/pastac-login/dist/pastac-login-invisible.html';
          break;

        case 'user' :
          //console.log('pastac-login: using navbar template.');
          t = '/bower_components/pastac-login/dist/pastac-login-user.html';
          break;

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

});//- .component pastacUserDetails


function PastacLoginController($scope, $timeout) {
  var ctrl = this;
  var firstUser = true;
  var userHandler = null;

  ctrl.$onInit = function() {

    console.log('ctrl=', ctrl);

    // Set the initial mode
    ctrl.loggedIn = false;
    ctrl.mode = 'login';
    ctrl.setMode = function(mode) { ctrl.mode = mode; }
    ctrl.validatingUsername = false;
    ctrl.usernameErrorMessage = '';

    userHandler = ctrl.handler;
    //alert('authservice.init()');

    // Check for extra menu items
    parseExtraMenuItems(); // sets ctrl.loggedInMenuItems and ctrl.loggedOutMenuItems.

    // Get the user details.
    authservice.init({
      host: ctrl.config.host,
      port: ctrl.config.port,
      tenant: ctrl.config.tenant,
      version: ctrl.config.version,
      pretend: ctrl.config.pretend,
      bindToDOM: ctrl.bindToDOM,
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

      // See which URL we should use for errors in OAuth2 logins.
      if (ctrl.error) {
        var errorURL = ctrl.error;
      } else {
        var errorURL = '/bower_components/pastac-login/test/test-error.html';
      }

      // Get the URL to a "bounce page". This is a page that sets the JWT
      // cookie from a URL parameter, and then redirevts to the 'resume' page.
      var baseURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var resumeURL = ctrl.resume ? (baseURL + ctrl.resume) : Authservice.currentPageURL();
      var bounceURL = Authservice.bounceURL('/bower_components/pastac-login/dist/bounce.html', resumeURL);
      console.log('bounceURL=' + bounceURL);

      // Initiate Authservice
      var options = {
        authority: authority,
        resume: bounceURL
      };
      options.error = ctrl.error ? (baseURL + ctrl.error) : options.resumeURL;
      authservice.initiateOAuth2(options);
    }


    ctrl.doEmailSignin = function() {
      console.log('doEmailSignin(' + ctrl.email + ', ' + ctrl.password + ')');
      var password = ctrl.password;
      ctrl.password = '';
      ctrl.loginError = '';
      authservice.login(ctrl.email, password, function(user) {
        $timeout(function() {
          ctrl.email = '';
          $('#pastac-login-modal').modal('hide')
          $('#pastac-login-navbar-dropdown').dropdown('toggle')
        }, 100);
      }, function(error) {
        $timeout(function() {
          ctrl.loginError = error;
        }, 100);
      })
    }

    ctrl.doLogout = function() {
      //alert('ctrl.doLogout()')
      authservice.logout();
      ctrl.email = '';
      ctrl.password = '';
    }

    ctrl.validateUsername = function() {
      // Nothing to check if no username has been entered
      // Don't worry, the submit button won't be anabled
      if (ctrl.register_username == '') {
        ctrl.usernameErrorMessage = '';
        return;
      }

      // See if the name is available
      ctrl.validatingUsername = true;
      ctrl.usernameErrorMessage = '';
      Authservice.usernameAvailability(ctrl.register_username, function(msg) {

        // Valid return from server, but msg may contain a validation error message
        $timeout(function() {
          ctrl.usernameErrorMessage = msg;
          ctrl.validatingUsername = false;
        }, 1);
      }, function() {

        // Error calling server
        alert('Communications error: unable to determine if this username is available');
        ctrl.usernameErrorMessage = null;
        ctrl.validatingUsername = false;
      });//- Authservice.usernameAvailability
    }


    ctrl.doRegister = function() {
      if (ctrl.usernameErrorMessage) {
        return;
      }
      // if (!ctrl.registerResume) {
      //   alert('pastac-login: Missing parameter: registerResume\nEmail registration is disabled.');
      //   return;
      // }
      var baseURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var resumeURL = ctrl.registerResume ? (baseURL + ctrl.registerResume) : Authservice.currentPageURL();
      var bounceURL = Authservice.bounceURL('/bower_components/pastac-login/dist/bounce.html', resumeURL);
      console.log('bounceURL=' + bounceURL);


      // Call the Authservice server
      var baseURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var options = {
        email: ctrl.register_email,
        resume: bounceURL
      };

      // See if we have a username
      if (ctrl.loginWithUsername && ctrl.register_username) {
        options.username = ctrl.register_username;
      }

      // Add other fields, if they are being used.
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
      ctrl.registerInProgress = true;
      authservice.register(options, function(user) {
        // Success
        $timeout(function () {
          ctrl.registerInProgress = false;
          ctrl.mode = 'login';
          $('#pastac-login-navbar-dropdown').dropdown('toggle')
          $('#pastac-login-modal').modal('hide')
          alert('You have been Registered. Please check your email.')
        }, 10);
      }, function(error) {
        // Fail
        $timeout(function() {
          ctrl.registerInProgress = false;
          alert('Could not register: ' + error)
        }, 10);
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


    ctrl.doForgot = function() {
      var baseURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var resumeURL = ctrl.forgotResume ? (baseURL + ctrl.forgotResume) : Authservice.currentPageURL();
      var bounceURL = Authservice.bounceURL('/bower_components/pastac-login/dist/bounce.html', resumeURL);
      console.log('bounceURL=' + bounceURL);

      // Call the Authservice server
      var baseURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var options = {
        email: ctrl.forgot_email,
        resume: bounceURL
      };

      console.log('doForgot()', options);
      ctrl.forgotInProgress = true;
      authservice.forgot(options, function() {
        // Success
        $timeout(function () {
          ctrl.forgotInProgress = false;
          ctrl.mode = 'login';
          // Hide the login dropdown
          $('#pastac-login-navbar-dropdown').dropdown('toggle')
          $('#pastac-login-modal').modal('hide')
          alert('You have been sent a password reset email. Please check your email.')
        }, 10);
      }, function(error) {
        // Fail
        $timeout(function () {
          ctrl.forgotInProgress = false;
          alert('Could not send forgotten password email: ' + error)
        }, 10);
      })
    }//- doForgot()

    ctrl.onMenuItem = function(tag) {
      console.log('onMenuItem(' + tag + ')');
      if (!ctrl.handler) {
        console.log('pastac-login: NOT calling handler.onMenuItem (handler not defined)');
      } else if (!ctrl.handler.onMenuItem) {
        console.log('pastac-login: NOT calling handler.onMenuItem (handler.onMenuItem not defined)');
      } else {
        // Call the user handler
        //console.log('pastac-login: calling handler.onUserChange');
        $timeout(function(){
          ctrl.handler.onMenuItem(tag);
        }, 1);
      };
    }//- onMenuItem()
  };//- onInit

  ctrl.$onChanges = function(changesObj) {
    console.log('$onChanges()');
    parseExtraMenuItems();
  };

  // Parse the extra-menu-items tag, which has the form
  //  ([+-]tag:label, ...)
  //    + means logged in
  //    - means logged out.
  //    default is when both logged in and logged out
  //
  function parseExtraMenuItems() {
    ctrl.loggedInMenuItems = [ ];
    ctrl.loggedOutMenuItems = [ ];
    if (ctrl.extraMenuItems) {
      console.log('extraMenuItems=' + ctrl.extraMenuItems);
      var list = ctrl.extraMenuItems.split(',');
      console.log(typeof(list));
      list.forEach(function(item) {
        console.log('item=' + item);
        item = item.trim();

        // Check for the logged in/logged out indicator
        var loggedIn = false;
        var loggedOut = false;
        if (item.startsWith('+')) {
          loggedIn = true;
          item = item.substring(1)
        }
        else if (item.startsWith('-')) {
          loggedOut = true;
          item = item.substring(1)
        }
        if ( !loggedIn && !loggedOut ) {
          loggedIn = true;
          loggedOut = true;
        }

        // Split into tag and label.
        // If there is no label, the tag also becomes the label.
        console.log('item=' + item);
        var pos = item.indexOf(':');
        console.log('pos=' + pos);
        if (pos >= 0) {
          var tag = item.substring(0, pos);
          var label = item.substring(pos + 1);
        } else {
          tag = item;
          label = item;
        }

        // Add this item to the appropriate menu item list.
        if (loggedIn) {
          ctrl.loggedInMenuItems.push({ tag: tag, label: label });
        }
        if (loggedOut) {
          ctrl.loggedOutMenuItems.push({ tag: tag, label: label });
        }
      });
    }
    console.log(' in: ', ctrl.loggedInMenuItems);
    console.log('out: ', ctrl.loggedOutMenuItems);
  }//- parseExtraMenuItems

}
