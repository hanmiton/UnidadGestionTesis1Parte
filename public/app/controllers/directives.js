angular.module('ingedex.directives', [])

    .directive('ingenieroName', function () {
        return {
          restrict: 'E',
          templateUrl: 'partials/ingeniero-name.html'
        };
      })

    .directive('ingenieroImage', function () {
        return {
          restrict: 'E',
          templateUrl: 'partials/ingeniero-image.html'
        };
      })

    .directive('ingenieroData', function () {
        return {
          restrict: 'E',
          templateUrl: 'partials/ingeniero-data.html'
        };
      })

     .directive('ingenieroStats', function () {
        return {
          restrict: 'E',
          templateUrl: 'partials/ingeniero-stats.html'
        };
      })

     .directive('ingenieroEvolution', function () {
        return {
          retrict: 'E',
          templateUrl: 'partials/ingeniero-evolution.html'
        };
      })

     .directive('ingenieroSolicitudes', function () {
        return {
          restrict: 'E',
          templateUrl: 'partials/ingeniero-solicitudes.html',
          controller: function () {
             this.solicitudes = [];
              this.solicitud = {};
              this.show = false;

              this.toggle = function () {
                this.show = !this.show;
              };

              this.anonymousChanged = function () {
                if (this.solicitud.anonymous) {
                  this.solicitud.email = "";
                }
              };

              this.addSolicitud = function () {
                this.solicitud.date = Date.now();
                this.solicitudes.push(this.solicitud);
                this.solicitud = {};
            };
          },
          controllerAs: 'sltsCtrl'
        };
      });