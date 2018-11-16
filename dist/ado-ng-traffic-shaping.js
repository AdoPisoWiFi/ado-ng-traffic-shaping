angular.module('ado.traffic-shaping.tpls', []).run(['$templateCache', function($templateCache) {$templateCache.put('./traffic-shaping.html','  <div class="row">\n    <div class="col-md-4">\n      <form name="prioForm">\n\n        <div class="form-group" ng-class="{\'has-error\': prioForm.$invalid}">\n          <label for="games_traffic_percent">How many percent of global bandwidth to allocate for prioritized ports?</label>\n\n          <div class="input-group">\n            <input type="number" name="games_traffic_percent" class="form-control" ng-model="$ctrl.settings.games_traffic_percent" min="1" max="99" required>\n            <div class="input-group-addon">%</div>\n          </div>\n\n          <span class="help-block" ng-show="prioForm.games_traffic_percent.$error.min">Minimum is 1%</span>\n          <span class="help-block" ng-show="prioForm.games_traffic_percent.$error.max">Maximum is 99%</span>\n          <span class="help-block" ng-show="prioForm.games_traffic_percent.$error.required">Required</span>\n\n        </div>\n        <save-config-btn config="{games_traffic_percent: $ctrl.settings.games_traffic_percent}" ng-disabled="prioForm.$invalid">\n          Save\n        </save-config-btn>\n      </form>\n    </div>\n  </div>\n\n  <hr>\n\n  <p>The ports listed in the table (no particular order) will have higher priority in the network traffic. This helps prevent lags in competitive games and applications.</p>\n\n  <a class="btn btn-primary" ng-click="$ctrl.addPort()">\n    <i class="glyphicon glyphicon-plus"></i>\n    Add New Port Priority\n  </a>\n  <hr>\n\n  <table class="table">\n    <thead>\n      <tr>\n        <th>Protocol</th>\n        <th>From port</th>\n        <th>To port</th>\n        <th>Description</th>\n        <th>Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-show="$ctrl.settings.port_priorities.length == 0">\n        <td colspan="5">\n          No port is prioritized.\n        </td>\n      </tr>\n\n      <tr ng-repeat="pp in $ctrl.settings.port_priorities" class="editable-row">\n        <td>\n          <span editable-select="pp.protocol" e-ng-options="p as p.toUpperCase() for p in $ctrl.protocols" e-name="protocol" e-form="rowform" e-required e-class="form-control">\n            {{pp.protocol | uppercase}}\n          </span>\n        </td>\n        <td>\n          <span editable-number="pp.port_from" e-name="port_from" e-form="rowform" e-required e-class="form-control">\n            {{pp.port_from}}\n          </span>\n        </td>\n        <td>\n          <span editable-number="pp.port_to" e-name="port_to" e-form="rowform" e-required e-class="form-control">\n            {{pp.port_to}}\n          </span>\n        </td>\n        <td>\n          <span editable-textarea="pp.desc" e-name="description" e-form="rowform" e-required e-class="form-control">\n            {{pp.desc}}\n          </span>\n        </td>\n        <td>\n          <form onbeforesave="$ctrl.updatePorts($index, $data)" editable-form name="rowform" ng-show="rowform.$visible" class="form-buttons form-inline" shown="$ctrl.inserted === pp">\n            <button type="submit" ng-disabled="rowform.$waiting" class="btn btn-primary editable-table-button btn-xs">\n              Save\n            </button>\n            <button type="button" ng-disabled="rowform.$waiting" ng-click="rowform.$cancel()" class="btn btn-default editable-table-button btn-xs">\n              Cancel\n            </button>\n          </form>\n          <div class="buttons" ng-show="!rowform.$visible">\n            <button class="btn btn-primary editable-table-button btn-xs" ng-click="rowform.$show()">Edit</button>\n            <button class="btn btn-danger editable-table-button btn-xs" ng-click="$ctrl.removePort($index)">Delete</button>\n          </div>\n        </td>\n      </tr>\n\n    </tbody>\n  </table>\n\n\n');}]);
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
