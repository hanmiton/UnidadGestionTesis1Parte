angular.module('ingedex.filters', [])
    .filter('imageify', function () {
    return function (input) {
      var url = "img/ingenieros/" + input.toLowerCase() + ".jpg";
      return url;
    };
  });
