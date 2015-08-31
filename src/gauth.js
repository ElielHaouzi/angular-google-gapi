angular.module('angular-google-gapi', [])
.factory('GAuth', function($rootScope, $q, GClient, GApi, GData, $interval,
                           $window, $location) {

  var domain; // For google apps use
  var isOAuth2Loaded = false;

  var config = {
    scope: 'email',
    response_type: 'token id_token'
  };

  function loadOAuth2() {
    var d = $q.defer();

    if (isOAuth2Loaded) {
      return d.resolve();
    }

    GClient.getApiClient().then(function() {
      $window.gapi.client.load('oauth2', 'v2', function() {
        isOAuth2Loaded = true;
        return d.resolve();
      });
    });

    return d.promise;
  }

  function signin(mode, handleAuthResultCallback) {
    loadOAuth2().then(function() {
      config.immediate = mode;

      if(domain !== undefined) {
        config.hd = DOMAIN;
      }

      $window.gapi.auth.authorize(config, handleAuthResultCallback);
    });
  }

  // function offline() {
  //   var deferred = $q.defer();
  //   var origin = $location.protocol + "//" + $location.hostname;
  //   if($location.port !== "") {
  //       origin = origin + ':' + $location.port;
  //   }
  //   var win =  $window.open('https://accounts.google.com/o/oauth2/auth?scope='+encodeURI(SCOPE)+'&redirect_uri=postmessage&response_type=code&client_id='+clientId+'&access_type=offline&approval_prompt=force&origin='+origin, null, 'width=800, height=600');
  //
  //   $window.addEventListener("message", getCode);
  //
  //   function getCode(event) {
  //     if (event.origin === "https://accounts.google.com") {
  //       var data = JSON.parse(event.data);
  //       $window.removeEventListener("message", getCode);
  //       data = gup(data.a[0], 'code');
  //       if (data === undefined) {
  //         deferred.reject();
  //       }
  //       else {
  //         deferred.resolve(data);
  //       }
  //     }
  //   }
  //
  //   function gup(url, name) {
  //       name = name.replace(/[[]/,"[").replace(/[]]/,"]");
  //       var regexS = name + "=([^&#]*)";
  //       var regex = new RegExp( regexS );
  //       var results = regex.exec( url );
  //       if( results == null ) {
  //         return undefined;
  //       }
  //       else {
  //         return results[1];
  //       }
  //   }
  //
  //   return deferred.promise;
  // }

  function getUser() {
    var d = $q.defer();

    loadOAuth2().then(function(){
      $window.gapi.client.oauth2.userinfo.get().execute(function(resp) {
        if (resp.code) {
          d.reject();
        } else {
          GData.isLogin(true);
          GApi.executeCallbacks();

          var user = {};
          user.email = resp.email;
          user.picture = resp.picture;
          user.id = resp.id;
          if (!resp.name || 0 === resp.name.length) {
              user.name = resp.email;
          }
          else {
              user.name = resp.name;
          }
          user.link = resp.link;
          GData.getUser(user);
          d.resolve(user);
        }
      });
    });

    return d.promise;
  }

  return {
    setClient: function(clientId) {
      config.clientId = clientId;
    },
    setDomain: function(domainApp) {
      domain = domainApp;
    },
    setScope: function(scope) {
      config.scope = scope;
    },
    checkAuth: function(){
      var d = $q.defer();
      signin(true, function() {
        getUser().then(function (user) {
            d.resolve(user);
        }, function () {
            d.reject();
        });
      });
      return d.promise;
    },
    login: function(){
      var d = $q.defer();
      signin(false, function() {
        getUser().then(function (user) {
          d.resolve();
        }, function () {
          d.reject();
        });
      });
      return d.promise;
    },
    setToken: function(token){
      var d = $q.defer();
      loadOAuth2().then(function (){
        $window.gapi.auth.setToken(token);
        getUser().then(function () {
          d.resolve();
        }, function () {
          d.reject();
        });
      });
      return d.promise;
    },
    getToken: function(){
      var d = $q.defer();
      loadOAuth2().then(function (){
          d.resolve($window.gapi.auth.getToken());
      });
      return d.promise;
    },
    logout: function(){
      var d = $q.defer();
      loadOAuth2().then(function() {
        $window.gapi.auth.setToken(null);
        GData.isLogin(false);
        GData.getUser(null);
        $rootScope.$broadcast('google:signed-out');
        d.resolve();
      });
      return d.promise;
    }
    // offline: function(){
    //   var deferred = $q.defer();
    //   offline().then( function(code){
    //           deferred.resolve(code);
    //   }, function(){
    //       deferred.reject();
    //   });
    //   return deferred.promise;
    // }
  };
});
