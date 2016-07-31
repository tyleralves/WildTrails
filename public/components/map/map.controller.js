/**
 * Created by Tyler on 7/29/2016.
 */
function MapController(MapFactory){
  var ctrl = this;
  ctrl.proximity = 15;
  ctrl.message = 'Loading...';
  ctrl.markers = [];

  ctrl.addLocation = function(){
    MapFactory.addLocation();
  };

  ctrl.changeProximity = function(){
    console.log(ctrl.proximity);
    MapFactory.changeProximity(ctrl.proximity);
  };

  MapFactory.initialize();


}

MapController.$inject = ['MapFactory'];

angular
  .module('app')
  .controller('MapController', MapController);