/**
 * Created by Tyler on 7/29/2016.
 */
function MapController(MapFactory){
  var ctrl = this;
  ctrl.message = 'Loading...';
  ctrl.markers = [];

  ctrl.addLocation = function(){
    console.log(ctrl.userLocation);
    MapFactory.addLocation();
  };

  MapFactory.initialize();

}

MapController.$inject = ['MapFactory'];

angular
  .module('app')
  .controller('MapController', MapController);