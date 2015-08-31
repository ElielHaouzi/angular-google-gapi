/**
 * An AngularJS module for use all Google Apis and your Google Cloud Endpoints
 * @version v0.1.2
 * @link https://github.com/maximepvrt/angular-google-gapi
 */
'use strict';
/*global angular */
/*global console */
angular.module('angular-google-gapi', [])
.factory('GApi', function($q, GClient, GData, $window) {
  var apisLoad  = [];
  var observerCallbacks = [];

  function registerObserverCallback(api, method, params, auth, deferred) {
    var observerCallback = {};
    observerCallback.api = api;
    observerCallback.apiLoad = false;
    observerCallback.method = method;
    observerCallback.params = params;
    observerCallback.auth = auth;
    observerCallback.deferred = deferred;
    observerCallbacks.push(observerCallback);
  }

  function loadApi(api, version, url) {
    GClient.getApiClient().then(function (){
      $window.gapi.client.load(api, version, function() {
        console.log(api+" "+version+" api loaded");
        apisLoad.push(api);
        executeCallbacks(api);
      }, url);
    });
  }

  function executeCallbacks(api) {
    var apiName = api;

    for(var i= 0; i < observerCallbacks.length; i++){
      var observerCallback = observerCallbacks[i];
      if ((observerCallback.api == apiName || observerCallback.apiLoad) && (!observerCallback.auth || GData.isLogin())) {
        runGapi(observerCallback.api, observerCallback.method, observerCallback.params, observerCallback.deferred);
        if (i > -1) {
            observerCallbacks.splice(i--, 1);
        }
      } else {
        if (observerCallback.api == apiName) {
          observerCallbacks[i]['apiLoad'] = true;
        }
      }
    }
  }

  function runGapi(apiName, method, params, deferred) {
    var pathMethod = method.split('.');
    var api = $window.gapi.client[apiName];
    for(var i= 0; i < pathMethod.length; i++) {
        api = api[pathMethod[i]];
    }
    api(params).execute(function (response) {
      if (response.error) {
        deferred.reject(response);
      } else {
        deferred.resolve(response);
      }
    });
  }

  function execute(api, method, params, auth) {
    var deferred = $q.defer();
    if (apisLoad.indexOf(api) > -1) {
      runGapi(api, method, params, deferred);
    }
    else {
      registerObserverCallback(api, method, params, auth, deferred);
    }
    return deferred.promise;
  }

  return {
    executeCallbacks : function() {
        executeCallbacks();
    },
    load: function(name, version, url){
        loadApi(name, version, url);
    },
    execute: function(api, method, params){
      if(arguments.length == 3) {
          return execute(api, method, params, false);
      }
      if(arguments.length == 2) {
          return execute(api, method, null, false);
      }
    },
    executeAuth: function(api, method, params){
      if(arguments.length == 3) {
          return execute(api, method, params, true);
      }
      if(arguments.length == 2) {
          return execute(api, method, null, true);
      }
    }
  };
});
