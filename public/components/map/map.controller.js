/**
 * Created by Tyler on 7/29/2016.
 */
function MapController(MapFactory, $rootScope){
  var ctrl = this;
  ctrl.proximity = 15;
  ctrl.message = 'Loading...';
  ctrl.markers = [];

  $rootScope.$on('$viewContentLoaded', function(){
    ctrl.mapresize();
  });
  ctrl.mapresize = function(){
    setTimeout(function(){ MapFactory.resize(); }, 10);
  };

  ctrl.addLocation = function(){
    MapFactory.addLocation();
  };

  ctrl.changeProximity = function(){
    console.log(ctrl.proximity);
    MapFactory.changeProximity(ctrl.proximity);
  };

  MapFactory.initialize();

}

MapController.$inject = ['MapFactory', '$rootScope'];

angular
  .module('app')
  .controller('MapController', MapController);