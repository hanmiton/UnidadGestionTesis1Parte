
angular.module('ingedex.controllers', [])

.controller('IngenieroController', function () {
      this.ingeniero = {
        id: "001",
        name: "Nombre001",
        ingenieria: "Ingenieria001",
        tipo: [ "Tipo1", "Tipo2" ],
        edad: "40",
        facultad: "facultad001",
        habilidades: [ "habilidad1", "habilidad2"],
         stats: {
          st1: 45,
          st2: 49,
          st3: 49,
          "sp.st4": 65,
          "sp.st5": 65,
          st6: 45,
          total: 318
        },
        evolution: [ "Ingeniero", "Masterado", "Doctorado" ]
      };

    })

    .controller('TabsController', function () {
      this.tab = 1;

      this.selectTab = function (tab) {
        this.tab = tab;
    };
});