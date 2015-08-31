angular.module('angular-google-gapi', [
  'angular-storage'
]);

angular.module('angular-google-gapi')
.factory('GData', function ($rootScope, store) {
  $rootScope.gapi = {};

  var isLogin = false;
  var user = null;

  return {
    isLogin : function(value) {
      return isLogin;
    },
    setLogin: function(flag) {
      isLogin = flag;
      $rootScope.gapi.login = flag;
    },
    getUser : function(value) {
      return user;
    },
    setUser: function(userResult) {
      user = (userResult) ? store.set('user', userResult) : store.remove('user');
    }
  };
});
