/**
 * Created by Tyler on 7/31/2016.
 */
function HomeController(MapFactory, $rootScope){
  var ctrl = this;
  ctrl.toggleSection = true;
}

angular
  .module('app')
  .controller('HomeController', HomeController);