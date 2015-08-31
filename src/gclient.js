angular.module('angular-google-gapi', [])
.factory('GClient', function ($document, $q, $timeout, $interval, $window) {
  var URL = 'https://apis.google.com/js/client.js';
  var apiKey,
      // The purpose of the isGaeApiLoaded flag is for not calling at each
      // request the loadGapiScript function, despite the fact it is a promise
      // function.
      isGaeApiLoaded = false;

  function loadScript(src) {
    var d = $q.defer();
    var script = $document[0].createElement('script');
    script.onload = function (e) {
      $timeout(function () {
          d.resolve(e);
      });
    };
    script.onerror = function (e) {
      $timeout(function () {
          d.reject(e);
      });
    };

    script.src = src;
    $document[0].body.appendChild(script);
    return d.promise;
  }

  function loadGapiScript() {
    var d = $q.defer();

    loadScript(URL).then(function() {
      var isGapClientExist = $interval(function(){
        if ($window.gapi.client !== undefined) {
          $interval.cancel(isGapClientExist);
          isGaeApiLoaded = true;
          d.resolve();
        }
      }, 10);
    }, function() {
      // A priori this case will never be
      d.reject();
    });

    return d.promise;
  }

  return {
    getApiClient: function() {
      var d = $q.defer();
      console.log(isGaeApiLoaded);
      if(isGaeApiLoaded) {
        d.resolve();
      }
      else {
        loadGapiScript().then(function(){
          d.resolve();
        });
      }

      return d.promise;
    },
    setApiKey: function(apiKey) {
      apiKey = apiKey;
      if(isGaeApiLoaded) {
        $window.gapi.client.setApiKey(apiKey);
      }
    },
    getApiKey: function() {
      return apiKey;
    }
  };
});
