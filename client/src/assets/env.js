// This file is just for tests, it will be override by the dockerfile
// More info in: https://nkpremices.com/dynamically-set-angular-env-variables-in-docker/
(function (window) {
  window['env'] = window['env'] || {};

  // Environment variables
  window['env']['apiUrl'] = '<will-be-replaced-automatically>';
})(this);