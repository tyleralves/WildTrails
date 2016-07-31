/**
 * Created by Tyler on 7/29/2016.
 */
function MapController(MapFactory, $scope){
  var ctrl = this;
  data = MapFactory;
  ctrl.proximity = 15;
  ctrl.markers = [];

  ctrl.addLocation = function(){
    MapFactory.addLocation();
  };

  ctrl.changeProximity = function(){
    console.log(ctrl.proximity);
    MapFactory.changeProximity(ctrl.proximity);
  };

  ctrl.initialize = function(){
    MapFactory.initialize();
  };

  ctrl.initialize();


}

MapController.$inject = ['MapFactory', '$scope'];

angular
  .module('app')
  .controller('MapController', MapController);