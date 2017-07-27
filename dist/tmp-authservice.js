var Authservice = (function() {

  var LOGIN_DETAILS_COOKIE_NAME = 'authservice-login-details';
  var JWT_COOKIE_NAME = 'authservice-jwt';
  var LOGIN_TIMEOUT_DAYS = 3;

  // Authservice.io endpoint details
  var _host;
  var _port;
  var _version;
  var _apikey;
  var ENDPOINT = null;

  // Currently logged in user
  var _currentEntityId = -1; // Separate, so user code can't hack it
  var _currentUser = null;

  // Current Access token
  var _ttuat = null;

  // Maybe use Angular's $http object for AJAX calls.
  var _$http = null;


  // Are we simulating?
  var _pretend = false;

  // User callbacks
  var _onUserChange = null;


  var dummyUserBob =  {
    "tenant": "nodeclient",
    "id": 901,
    "authority": "email",
    "type": "user",
    "external_id": "jim",
    "status": "new",
    "email": "Bob",
    "email_status": "",
    "full_name": "Bob the Builder",
    "avatar": "",
    "entity_type_description": "User",
    "is_login_account": 1,
    "user": {
      "locale": "",
      "location": "",
      "timezone": "",
      "user_first_name": "Bob",
      "user_gender": "male",
      "user_languages": "EN",
      "user_last_name": "Builder",
      "user_media_page": "",
      "user_middle_name": "B"
    },
    "relationshipSummary": {
      "isFriendedBy": [
        {
          "entity_id": 902,
          "full_name": "Jim Boots",
          "last_name": "Boots",
          "entity_type": "user"
        }
      ],
      "hasFriend": [
        {
          "entity_id": 903,
          "full_name": "Jill Jones",
          "last_name": "Jones",
          "entity_type": "user"
        }
      ]
    },
    "relationships": [
      {
        "relationship_id": 6,
        "relationship_type": "friend",
        "entity_id_1": 901,
        "entity_id_2": 902
      }
    ]
  };

  function getDummyUser(username) {
    if (username == 'bob') {
      return dummyUserBob;
    } else {
      return null;
    }
  }



  /*
   *  Perform an AJAX, using jQuery or Angular if available.
   */
  function authservice_ajax_call(method, urlpath, params, successCallback/*(response)*/, errorCallback/*(statusCode, statusText, error)*/) {

    var url = ENDPOINT + urlpath;
    console.log('authservice_ajax_call(method, ' + urlpath + ')')
    console.log(url)
    console.log(params);
    console.log("vvvvvv calling vvvvvv");

    // See if this is an Angular AJAX call
    if (_$http) {
      // Call the API to get the product details
      // ZZZZ This should use JSONP, as some browsers do not support CORS.
      // ZZZZ Unfortunately JSONP does not support headers, so we need
      // ZZZZ to pass details either in the url or the data. i.e. the
      // ZZZZ server requires changes.


      /*
       *  We'll use Angular's $http to call the authservice API.
       *
       *  See https://docs.angularjs.org/api/ng/service/$http
       */
console.log('*** Using Angular AJAX call');
      var req = {
        method: 'POST',
        url: url,
        data: params
      };
      _$http(req).then(function(response) { // success handler

        // Successful AJAX call.
        var data = response.data; // {string|Object} – The response body transformed with the transform functions.
        console.log('success:', data)
        return successCallback(data);

      }, function(response) { // error handler

        // Error during API call.
        var statusCode = response.status; // {number} – HTTP status code of the response.
        var statusText = response.statusText; // {string} – HTTP status text of the response.
        var error = response.data; // Maybe an error object was returned.
        if (errorCallback) {
          return errorCallback(statusCode, statusText, error);
        }

        // We have no error callback, so we'll report the error here and return null data.
        alert('An error occurred contacting Authservice.\nSee the Javascript console for details.')
        console.log('statusCode:', response)
        console.log('statusText:', statusText)
        console.log('error:', error)
        return successCallback(null);
      });


    } else {  // Use jQuery AJAX.

      // We don't have Angular's $http, so use jQuery AJAX.
      // See http://api.jquery.com/jquery.ajax/
console.log('*** jQuery AJAX call (before)');
      var json = JSON.stringify(params)
      $.ajax({
        url: url,
        type: "POST", // Using CORS
        crossDomain: true,
        async: true,
        data: json,
        dataType: "json",
        contentType: 'application/json',
        success: function(response) {
          console.log('*** jQuery AJAX call (success)');

          // Successful AJAX call.
          return successCallback(response);
        },
        error: function(jqxhr, textStatus, errorThrown) {
          console.log('*** jQuery AJAX call (error)');

          // Error during AJAX call.
          var statusCode = jqxhr.status; // {number} – HTTP status code of the response.
          var statusText = jqxhr.statusText; // {string} null, "timeout", "error", "abort", or "parsererror"
          var error = errorThrown; // {string} "When an HTTP error occurs, errorThrown receives the textual portion of the HTTP status."
          if (errorCallback) {
            return errorCallback(statusCode, statusText, error);
          }

          // We have no error callback, so we'll report the error here and return null data.
          alert('An error occurred contacting Authservice.\nSee the Javascript console for details.')
          console.log('statusCode:', statusCode)
          console.log('statusText:', statusText)
          console.log('error:', error)
          return successCallback(null);
        }
      });
    }
  }

  /*
   *  Get a URL parameter.
   */
  function getURLParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  /*
   *  With luck, a previous page logged in, and saved the current user
   *  details and an access token in a cookie so we could pick it up here.
   */
  function setCurrentUserFromCookie() {

    // See if we have a AUTHSERVICE_JWT in the URL to this page
    var jwt = getURLParameterByName("AUTHSERVICE_JWT")
    if (jwt) {
      console.log("***");
      console.log("***");
      console.log("*** AUTHSERVICE_JWT IN URL")
      console.log("***");
      console.log("***");
      var isFromCookie = false;
      if (setCurrentUserFromJWT(jwt, isFromCookie)) {
      // Remember this JWT in a cookie for the next page.
        setCookie(JWT_COOKIE_NAME, jwt, LOGIN_TIMEOUT_DAYS);
      } else {
        removeCookie(JWT_COOKIE_NAME);
      }
      return;
    }


    // See if we have a cookie containing the current JWT
    var jwt = getCookie(JWT_COOKIE_NAME);
    if (jwt) {
      console.log("***");
      console.log("***");
      console.log("*** AUTHSERVICE_JWT IN A COOKIE")
      console.log("***");
      console.log("***");
      // var isFromCookie = true;
      var isFromCookie = false; // Check if it is stale ZZZZ
      if (setCurrentUserFromJWT(jwt, isFromCookie)) {
          // Good login from cookie
      } else {
        // Dud cookie
        removeCookie(JWT_COOKIE_NAME);
      }
      return;
    }
    // if (json) {
    //   try {
    //       // Parse the JSON, and check the required values exist
    //       var obj = JSON.parse(json); // May throw an exception
    //   } catch(e) {
    //
    //       // Dud cookie data
    //       console.log('Error parsing login cookie', e);
    //       var isFromCookie = true;
    //       setCurrentUser(null, null, isFromCookie);
    //       return;
    //   }
    //
    //   // Check the cookie data has user details.
    //   if (obj.user && obj.ttuat) {
    //
    //     // All good.
    //     console.log("FOUND LOGIN COOKIE.", obj)
    //     var isFromCookie = true;
    //     setCurrentUser(obj.user, obj.ttuat, isFromCookie);
    //     return;
    //
    //   } else {
    //     console.log('Login cookie missing user or ttuat');
    //   }
    //
    // } else {
    //   console.log('no login cookie');
    // }

    // not a good cookie
    console.log("***");
    console.log("***");
    console.log("*** AUTHSERVICE_JWT NOT IN URL OR COOKIE")
    console.log("***");
    console.log("***");
    var isFromCookie = false;
    setCurrentUser(null, null, isFromCookie);
  }

  /*
   *  Place the current user details and access token in a cookie,
   *  so the next page we go to knows who are logged in as.
   */
  function setCookieFromCurrentUser() {

    if (_currentUser) {

      // Create a new object here, but not with all the details
      var cookieObj = {
        user: {
          id: _currentUser.id,
          fullname: _currentUser.fullname,
          avatar: _currentUser.avatar,
          firstname: _currentUser.firstname,
          lastname: _currentUser.lastname
        },
        ttuat: _ttuat
      }
      console.log('Setting ' + LOGIN_DETAILS_COOKIE_NAME + ' (not sure why)')
      setCookie(LOGIN_DETAILS_COOKIE_NAME, JSON.stringify(cookieObj), LOGIN_TIMEOUT_DAYS);
    } else {
      // Remove the cookie
      console.log('Removing ' + LOGIN_DETAILS_COOKIE_NAME + ' (no current user)')
      setCookie(LOGIN_DETAILS_COOKIE_NAME, null, 0);
    }
  }

  function getCurrentUser() {

    //ZZZ We should return a clone so the original can't
    // be easily modified hacked from outside code.
    var clone = _currentUser;
    return clone;
  }

  function getCurrentUserId() {
    return _currentUser ? _currentUser.id : 0;
  }

  function getUserAccessToken() {
    return _ttuat;
  }

  function setCurrentUser(user, ttuat, fromCookie) {
    //console.log();
    // console.log('++++++++>  setCurrentUser(): ttuat=' + ttuat + ', user=', user)

    // Change the current user.
    var oldCurrentUser = _currentUser;
    if (user) {
      //console.log('Setting _currentUser to ', user);

      // // If relationships are loaded, sort the summey
      // if (user.relationshipSummary) {
      //   var arrayOfFriends = user.relationshipSummary.hasFriend
      //   arrayOfFriends.sort(sortRelationshipSummaryByFullname)
      //
      //   // Short those who have friended me
      //   var arrayOfFriendedBy = user.relationshipSummary.isFriendedBy;
      //   arrayOfFriendedBy.sort(sortRelationshipSummaryByFullname)
      // }
      _currentUser = user;
      _currentEntityId = user.id;
      if (ttuat) {
        _ttuat = ttuat;
      }

      setCookieFromCurrentUser();
      $('.authservice-logged-in').show();
      $('.authservice-logged-out').hide();
      $('.authservice-current-user-firstname').text(user.firstname);
      $('.authservice-current-user-lastname').text(user.lastname);

      if(user.avatar) {
        $('.authservice-current-user-avatar').attr('src', user.avatar).show();
        $('.authservice-default-user-avatar').attr('src', user.avatar).hide();
      } else {
        $('.authservice-current-user-avatar').attr('src', user.avatar).hide();
        $('.authservice-default-user-avatar').attr('src', user.avatar).show();
      }

      if (_onUserChange) { // && oldCurrentUser==null) {

        var newUser = getCurrentUser(); // may be a clone
        var newTtuat = _ttuat;
        (_onUserChange)(newUser, newTtuat, fromCookie);
      }
    } else {

      // No longer logged in
      _currentUser = null;
      _currentEntityId = -1;
      _ttuat = null;
      setCookieFromCurrentUser();
      //setCookie(LOGIN_DETAILS_COOKIE_NAME, null, LOGIN_TIMEOUT_DAYS);
      $('.authservice-logged-in').hide();
      $('.authservice-logged-out').show();
      $('.authservice-current-user-firstname').text('');
      $('.authservice-current-user-lastname').text('');
      $('.authservice-current-user-avatar').attr('src', '').hide();
      if (_onUserChange) { // && oldCurrentUser != null) {
        var fromCookie = false;
        _onUserChange(null, null, fromCookie);
      }
    }
  }

  // Set the current user from a JWT.
  // Does not change cookies.
  // Returns true on success.
  function setCurrentUserFromJWT(jwt, fromCookie) {

    //console.log();
    //console.log('++++++++>  setCurrentUser(): jwt=' + jwt)

    var haveUser = false;
    if (jwt) {
      // See https://github.com/auth0/jwt-decode
      try {
        var decoded = jwt_decode(jwt);
        console.log(decoded);
        var ident = decoded.identity;
        haveUser = true;

      } catch (e) {
        alert('Error decoding invalid JWT')
        haveUser = false;
      }
    }



    // Change the current user.
    var oldCurrentUser = _currentUser;
    if (haveUser) {



      var user = {
        authority: ident.authority,
        avatar: ident.avatar,
        email: ident.email,
        entityType: ident.entity_type,
        firstname: ident.first_name,
        fullname: ident.full_name,
        gender: ident.gender,
        id: ident.id,
        isAdmin: ident.is_admin,
        languages: ident.languages,
        lastname: ident.last_name,
        locale: ident.locale,
        location: ident.location,
        mediaPage: ident.media_page,
        middlename: ident.middle_name,
        privileges: ident.privileges,
        status: ident.status,
        timezone: ident.timezone,
        // type: ident.type,
      };

      console.log('Setting _currentUser to ', user);
      _currentUser = user;
      _currentEntityId = ident.id;
      _ttuat = jwt;
      _jwt = jwt;

      // Enable and display the UI
      $('.authservice-logged-in').show();
      $('.authservice-logged-out').hide();
      $('.authservice-current-user-firstname').text(user.firstname);
      $('.authservice-current-user-lastname').text(user.lastname);

      if (user.avatar) {
        $('.authservice-current-user-avatar').attr('src', user.avatar).show();
        $('.authservice-default-user-avatar').attr('src', user.avatar).hide();
      } else {
        $('.authservice-current-user-avatar').attr('src', user.avatar).hide();
        $('.authservice-default-user-avatar').attr('src', user.avatar).show();
      }

      if (_onUserChange) { // && oldCurrentUser==null) {

        var newUser = getCurrentUser(); // may be a clone
        var newTtuat = _ttuat;
        (_onUserChange)(newUser, newTtuat, fromCookie);
      }
      return true;

    } else {

      // No longer logged in
      _currentUser = null;
      _currentEntityId = -1;
      _ttuat = null;
      _jwt = null;

      // Remove the cookie
      console.log('Removing ' + LOGIN_DETAILS_COOKIE_NAME + ' (not sure why)')
      setCookie(LOGIN_DETAILS_COOKIE_NAME, null, 0);

      $('.authservice-logged-in').hide();
      $('.authservice-logged-out').show();
      $('.authservice-current-user-firstname').text('');
      $('.authservice-current-user-lastname').text('');
      $('.authservice-current-user-avatar').attr('src', '').hide();
      if (_onUserChange) { // && oldCurrentUser != null) {
        var fromCookie = false;
        _onUserChange(null, null, fromCookie);
      }

      return false;
    }
  }



  /*
  *  Set a cookie in the browser, for the entire site.
  */
  function setCookie(cname, cvalue, exdays) {
    // console.log('setCookie(' + cname + ', ' + cvalue + ')');
    console.log('setCookie(' + cname + ')');
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }// setCookie()

  function removeCookie(cname) {
    console.log('removeCookie(' + cname + ')');
    setCookie(cname, null, 0);
  }


  /*
  *  Get a cookie from the browser.
  */
  function getCookie(cname) {
    //console.log('getCookie(' + cname + ')')
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        //console.log('- found cookie')
        return c.substring(name.length, c.length);
      }
    }
    //console.log('- no cookie with this name')
    return "";
  }// getCookie()



  // Create a new user object from the server-returned identity record.
  function convertIdentityToUser(identity) {
    var user = {
      //ttuat: _currentUser.ttuat,
      id: identity.id,
      authority: identity.authority,
      avatar: identity.avatar,
      // not email, or email_status
      //entityType: identity.entity_type_description,
      fullname: identity.full_name,
      status: identity.status,
      type: identity.type
    };

    // Handle user specific fields
    if (user.type == 'user') {
      // user.fullname = identity.user.full_name;
      // user.firstname = identity.user.first_name;
      // user.lastname = identity.user.last_name;
      user.locale = identity.user.locale;
      user.location = identity.user.location;
      user.timezone = identity.user.timezone;
      user.firstname = identity.user.user_first_name;
      user.gender = identity.user.user_gender;
      user.languages = identity.user.user_languages;
      user.lastname = identity.user.user_last_name;
      user.mediaPage = identity.user.user_media_page;
      user.middlename = identity.user.user_middle_name;
    }

    // Copy over the relationships and properties
    user.properties = identity.properties;
    user.propertySummary = identity.propertySummary;
    user.relationships = identity.relationships;
    user.relationshipSummary = identity.relationshipSummary;
    //user.privileges = identity.privileges;
    //user.privilegeSummary = identity.privilegeSummary;
    return user;
  }



  /**
  ***
  ***   Now comes the actual object used by the application.
  ***
  ***/
  return {

    register: register,
    logout: logout,
    setCookie: setCookie,
    getCookie: getCookie,
    getCurrentUser: getCurrentUser,
    getCurrentUserId: getCurrentUserId,
    getUserAccessToken: getUserAccessToken,
    initiateOAuth2: initiateOAuth2,
    bounce: bounce,
    bounceURL: bounceURL,
    currentPageURL: currentPageURL,

    // admin_getUser: function(params, callback/*(err, user)*/) {
    //   authserviceApi.internal_admin_getUser(params).then(function(result){
    //     return callback(result);
    //   });
    // },

    init: function init(options) {
      console.log('authservice.init()', options)

      /*
      *  Check the input parameters.
      */
      _host = options.host ? options.host : 'authservice.io';
      _port = options.port ? options.port : 80;
      _version = options.version ? options.version : 'v1';
      _apikey = options.tenant;
      //host = 'http://' + _host + ':' + _port + '/' + _version + '/' + _apikey;
      ENDPOINT = '//' + _host + ':' + _port + '/' + _version + '/' + _apikey;
      //console.log('endpoint = ' + ENDPOINT);

      if (options.$http) {
        _$http = options.$http;
      }
      if (options.onUserChange) {
        _onUserChange = options.onUserChange;
      }


      // In pretend mode, we use hard coded usernames
      _pretend = (options.pretend) ? true : false;

      // See if we are currently logged in, based on the browser cookie.
      setCurrentUserFromCookie();


      /*
       *  Set up nice callbacks for buttons, etc.
       */
      $('#authservice-login-button').click(function(){
        $('#authservice-login-div').show();
        $('#authservice-forgot-div').hide();
        $('#authservice-register-div').hide();
        return false;
      });


      $('#authservice-forgot-button').click(function(){
        $('#authservice-login-button').hide();
        $('#authservice-login-div').hide();
        $('#authservice-forgot-div').show();
        $('#authservice-register-button').hide();
        $('#authservice-register-div').hide();
        return false;
      });



      $('#authservice-register-button').click(function(){
        $('#authservice-login-button').hide();
        $('#authservice-login-div').hide();
        $('#authservice-forgot-button').hide();
        $('#authservice-forgot-div').hide();
        $('#authservice-register-div').show();
        return false;
      });



      $('#authservice-forgot-cancel').click(authservice.resetLoginMenu);
      $('#authservice-forgot-ok').click(authservice.resetLoginMenu);
      $('#authservice-register-cancel').click(authservice.resetLoginMenu);
      $('#authservice-register-ok').click(authservice.resetLoginMenu);



      $('#authservice-logout-button').click(function(){
        authservice.logout();
      });




      $('#authservice-login-submit').click(function() {
         var username = $('#authservice-login-username').val();
         var password = $('#authservice-login-password').val();
         //				alert('login(' + username + ', ' + password + ')');

         authservice.login(username, password, function(user){
           // Success
           authservice.resetLoginMenu();
         }, function() {
           // Fail
           $('#authservice-login-errmsg').show();
         })

      });


      $('#authservice-forgot-submit').click(function() {
        var username = $('#authservice-forgot-username').val();
        alert('forgot(' + username + ')');

        var success = false;
        if (username == 'ok') success = true;
        if (success) {
          // Forward to some other page, or redraw this page
          $('#authservice-forgot-email2').val(username); // redisplay the email
          $('#authservice-forgot-button').hide();
          $('#authservice-forgot-div').hide();
          $('#authservice-forgot-done').show();
          return false;

        } else {
          // We don't tell the user if they have entered
          // an incorrect email address, as it could be used
          // by nasty people to fish for email addresses.
          // An error here indicates some sort of system error.
          $('#authservice-forgot-errmsg').show();
          return false;
        }
      });


      $('#authservice-register-submit').click(function() {
        var username = $('#authservice-register-username').val();
        var password = $('#authservice-register-password').val();
        //alert('authservice.register(' + username + ', ' + password + ')');

        var success = false;
        if (password == 'ok') success = true;
        if (success) {
          // Display the success message
          $('#authservice-register-button').hide();
          $('#authservice-register-div').hide();
          $('#authservice-register-done').show();
          return false;
        } else {
          // Display an error message
          $('#authservice-register-errmsg').show();
          return false;
        }
      });//- click
    },// init()


    login: function login(username, password, successCallback, failCallback) {
      console.log('authservice.login(username=' + username + ')');

      // If we are pretending, get the user details now.
      if (_pretend) {
        console.log('seems we are pretending')
        var user = getDummyUser(username);
        var isFromCookie = false;
        setCurrentUser(user, null, isFromCookie);
        //console.log('logged in now as', _currentUser);
        //authservice.resetLoginMenu();
        return successCallback(user);
      }

      /*
       *  Not pretending.
       *  Call the server to authenticate the username/password.
       */
      var params = {
        username: username,
        password: password
      };
      authservice_ajax_call('POST', '/login', params, function(response) {
        console.log('authservice.login() back from AJAX call with', response);

          if (response.status == 'ok') {

            // Logged in.
            console.log('Back from login:', response);
            // var user = convertIdentityToUser(response.identity);
            var jwt = response.jwt;
            var isFromCookie = false;
            if (setCurrentUserFromJWT(jwt, isFromCookie)) {
              // Good login
              setCookie(JWT_COOKIE_NAME, jwt, LOGIN_TIMEOUT_DAYS);
            } else {
              // Bad login
              removeCookie(JWT_COOKIE_NAME);
            }
            if (successCallback) {
              return successCallback(_currentUser);
            }
          } else {

            // We did not sucessfully login
            // Display an error message
            //$('#authservice-login-errmsg').show();
            var errmess = response.message;
            if (failCallback) {
              return failCallback(response.message);
            } else {
              alert('Login error:' + errmess)
            }
          }
      }, function(statusCode, statusText, error) {
        console.log('Login failed: ', statusCode, statusText, error);
        if (failCallback) {
          return failCallback(statusText);
        }
      });
    },


    reloadUser: function reloadUser(callback) {
      alert('authservice.reloadUser()')
      console.log('reloadUser');

      // See if there is a current user.
      if (_currentUser == null) {
        var user = null;
        var ttuat = null;
        var fromCookie = false;
        setCurrentUser(user, ttuat, fromCookie);
        if (callback) {
          callback(null);
        }
      }

      // Perhaps we're using dummy data.
      if (_pretend) {
        console.log('reloading dummy data')
        var user = getDummyUser(_currentUser.username);
        var ttuat = null;
        var isFromCookie = false;
        setCurrentUser(user, ttuat, isFromCookie);
        return callback(user);
      }


      // Get the current user from the database again
      var params = {
        ttuat: _ttuat,
        //entityId: _currentEntityId,
        needRelationships: true,
        needProperties: true
      };
      authservice_ajax_call('POST', '/getIdentityWithAuthtoken', params, function(identities) {

        // API call SUCCESS
        console.log('back from /getIdentityWithAuthtoken ', identities)
        if (identities && identities.length > 0) {

          // Got the user.
          console.log('User details reloaded.');
          var user = convertIdentityToUser(identities[0]);
          var ttuat = _ttuat;
          var fromCookie = false;
          setCurrentUser(user, ttuat, fromCookie);
          if (callback) {
            callback(user)
          }
        } else {

          // Could not get the user. Must be logged out.
          console.log('Could not reload user. Must have timed out.');
          setCurrentUser(null, null, fromCookie);
          if (callback) {
            callback(null)
          }
        }
      }, function(statusCode, statusText, error) {

        // API call FAIL
        console.log('Was not able to reload the user:', statusCode, statusText, console.error);
        setCurrentUser(null, null, fromCookie);
        if (callback) {
          callback(null)
        }
      });
    },// reloadUser



    /*
     *  Reset the login menu.
     */
    resetLoginMenu: function resetLoginMenu() {
      $('#authservice-login-button').show();
      $('#authservice-login-div').show();
      $('#authservice-forgot-button').show();
      $('#authservice-forgot-div').hide();
      $('#authservice-forgot-ok').hide();
      $('#authservice-register-button').show();
      $('#authservice-register-div').hide();
      $('#authservice-register-ok').hide();

      // Clear the username and password fields
      $('#authservice-login-username').val('');
      $('#authservice-login-password').val('');
      $('#authservice-forgot-username').val('');
      $('#authservice-register-username').val('');
      $('#authservice-register-password').val('');


      // hide the menu
      // $('#authservice-user-dropdown').dropdown('toggle');
      $('#authservice-user-dropdown').parent().removeClass('open');
      // $('[data-toggle="dropdown"]').parent().removeClass('open');
      return true;
    },


    getUser: function getUser(params, callback/*(user)*/) {
      console.log('getUser()');
      authservice_ajax_call('POST', '/admin/getUser', params, callback);
    }, //getUser


    /*
     *  Create a new auth_relationship
     */
    addRelationship: function addRelationship(params, callback/*(result)*/) {
      console.log('addRelationship()');
      authservice_ajax_call('POST', '/admin/addRelationship', params, callback);
    },// addRelationship


    /*
     *  Remove an auth_relationship
     */
    removeRelationship: function removeRelationship(params, callback/*(result)*/) {
      console.log('removeRelationship()');
      authservice_ajax_call('POST', '/admin/removeRelationship', params, callback);
    },// addRelationship



    /*
     *  Create a new auth_property
     */
    addProperty: function addProperty(params, callback/*(result)*/) {
      console.log('addProperty()');
      authservice_ajax_call('POST', '/admin/addProperty', params, callback);
    },// addRelationship


    /*
     *  Remove an auth_property
     */
    removeProperty: function removeProperty(params, callback/*(result)*/) {
      console.log('removeProperty()');
      authservice_ajax_call('POST', '/admin/removeProperty', params, callback);
    },// addRelationship


    nocomma: null


  };//- object

  // Start the OAuth2 login process with Facebook, Google, Github, etc.
  function initiateOAuth2(config) {
    //alert('authservice.initiateOAuth2():', config)

    if (typeof(config) == 'string') {
      var authority = config;
      var successURL = null;
      var failURL = null;
    } else {
      var authority = config.authority;
      var successURL = config.resume ? config.resume : null;
      var failURL = config.error ? config.error : null;
    }

    if (!authority) {
      alert('authservice.initiateOAuth2(): missing \'authority\' parameter');
      return;
    }
    if (!successURL) {
      successURL = currentPageURL();
    }
    if (!failURL) {
      failURL = successURL;
    }
    console.log('successURL=' + successURL)
    console.log('successURL=' + encodeURIComponent(successURL))
    console.log('failURL=' + failURL)

    var url = 'http://' + _host + ':' + _port + '/v2/oauth2/initiate/' + _apikey + '/' + authority;
    url += '?success=' + encodeURIComponent(successURL);
    url += '&fail=' + encodeURIComponent(failURL);
    // alert('Initiate URL:' + url)
    window.location = url;
  }

  function logout() {
    //alert('authservice.logout()')
    var isFromCookie = false;
    removeCookie(JWT_COOKIE_NAME);
    setCurrentUser(null, null, isFromCookie);
    authservice.resetLoginMenu();
    return false;
  }


  function register(options, successCallback, failCallback) {
    //alert('register()')
    var email = options.email;
    var username = options.username;
    var password = options.password;
    var first_name = options.first_name;
    var middle_name = options.middle_name;
    var last_name = options.last_name;
    var resume = options.resume;

    // If we are pretending, get the user details now.
    if (_pretend) {
      console.log('seems we are pretending')
      return successCallback();
    }

    /*
     *  Not pretending.
     *  Call the server to register.
     */
    // Check email and password is valid
    if (email==null || email.indexOf('@') < 1) {
      return failCallback('Please enter a valid email address');
    }
    var params = {
      email: email,
      username: email,
      resume: resume
    };
    if (password) {
      if (password.length < 5) {
        return failCallback('Please enter a longer password');
      }
      params.password = password;
    }
    if (first_name) {
      if (first_name.length < 5) {
        return failCallback('Please enter a first name');
      }
      params.first_name = first_name;
    }
    if (middle_name) {
      if (middle_name.length > 0) {
        params.middle_name = middle_name;
      }
    }
    if (last_name) {
      if (last_name.length < 1) {
        return failCallback('Please enter a last name');
      }
      params.last_name = last_name;
    }

    // Call the server
    console.log('params=', params);
    authservice_ajax_call('POST', '/email/register', params, function(response) {
      console.log('response is ', response)

        if (response && response.status == 'ok') {
          // Look successful
          if (successCallback) {
            return successCallback();
          }
        } else {
          // Display an error message
          //$('#authservice-login-errmsg').show();
          var err = (response && response.message) ? response.message : 'Error while registering';
          if (failCallback) {
            return failCallback(err);
          }
        }
    });
  }// register()

  // When this is called from a page, two things happen.
  //  1. If there is a 'jwt' parameter to the page it gets stored as a cookie.
  //  2. If there is a 'resume' parameter, we jump to that URL.
  function bounce() {
    var jwt = getURLParameterByName("AUTHSERVICE_JWT")
    if (jwt) {
      console.log("*** setting JWT cookie")
      setCookie(JWT_COOKIE_NAME, jwt, LOGIN_TIMEOUT_DAYS);
    }
    var resume = getURLParameterByName("resume")
    console.log('Redirect to ' + resume)
    alert('about to redirect')
    var debug = getURLParameterByName("debug")
    if (!debug) {
      window.location = resume;
    }
  }

  // Return the URL to jump to the bounce page.
  function bounceURL(bouncePageRelativePath, resumeURL) {
    if (!resumeURL) {
      resumeURL = currentPageURL();
    }
    l = window.location;
    var thisPageURL = l.protocol + "//" + l.host; // + l.pathname + s + l.hash;
    var url = thisPageURL + bouncePageRelativePath + '?resume=' + encodeURIComponent(resumeURL)
    return url;
  }


  /*
   *    Get the current URL, and remove any Authservice parameters.
   */
  function currentPageURL() {
    l = window.location;
    var s = l.search;//?....&....&....
    if (s != '') {
      s = '&' + s.substring(1); // Replace initial ? with &
      s = s
        .replace(/&AUTHSERVICE_JWT=[^&]*/, '')
        .replace(/&AUTHSERVICE_ERROR=[^&]*/, '');
      if (s != '') {
        s = '?' + s.substring(1); // Replace initial & with ?
      }
    }
    var thisPageURL = l.protocol + "//" + l.host + l.pathname + s + l.hash;
    return thisPageURL;
  }

})(); // authservice

var authservice = Authservice;

//tta2.init('http://localhost:9090', 'nodeclient');
//tta2.init('http://127.0.0.1:9090', 'nodeclient');
