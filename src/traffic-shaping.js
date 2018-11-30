(function () {
'use strict';

  var App = angular.module('ado.traffic-shaping', [
    'ado.save-config-btn',
    'ado.traffic-shaping.tpls'
  ]);

  App.component('adoTrafficShaping', {
    bindings: {
      device: '<'
    },
    controller: 'AdoTrafficShapingCtrl',
    templateUrl: './traffic-shaping.html'
  });

  App.controller('AdoTrafficShapingCtrl', [
    '$window',
    'adoConfigService',
    function($window, adoConfigService) {

      var $ctrl = this;

      $ctrl.protocols = ['tcp', 'udp'];

      $ctrl.$onInit = function () {

        $ctrl.inserted = null;

        $ctrl.device = $ctrl.device || {};

        adoConfigService.get({id: $ctrl.device.id})
          .then(function (res) {
            $ctrl.settings = res.data;
          });

        function update(ports) {

          ports = ports.filter(function (p) {
            return p.protocol && p.port_from && p.port_to;
          })
            .map(function(p) {
              if (p.description)
                delete p.description;
              return p;
            });

          return adoConfigService.update({port_priorities: ports}, {id: $ctrl.device.id})
            .then(function (res) {
              $ctrl.settings = res.data;
              return true;
            })
            .catch(function (res) {
              toastr.error('Something went wrong. Please reload the page and try again', 'Error');
              return res;
            });
        }

        $ctrl.updatePorts = function (index, port) {
          var ports = angular.copy($ctrl.settings.port_priorities);
          ports[index] = angular.extend(ports[index], port);
          return update(ports);
        };

        $ctrl.addPort = function () {
          $ctrl.inserted = {
            protocol: '',
            port_from: 0,
            port_to: 0,
            desc: 'New port priority'
          };
          $ctrl.settings.port_priorities.unshift($ctrl.inserted);
        };

        $ctrl.removePort = function (i) {
          if ($window.confirm('Are you sure?')) {
            var ports = angular.copy($ctrl.settings.port_priorities);
            ports.splice(i, 1);
            return update(ports);
          }
        };

      };


    }
  ]);

})();
