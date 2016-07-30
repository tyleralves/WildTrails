/**
 * Created by Tyler on 7/29/2016.
 */
function MapController(MapFactory){
  var ctrl = this;
  ctrl.message = 'Loading...';
  ctrl.markers = [];

  ctrl.getMarkers = function(){
    console.log('getMarkers');
    ctrl.message = 'Loading...';
    MapFactory.getMarkers()
      .then(function(){
        ctrl.message = MapFactory.message
        ctrl.markers = MapFactory.markers;
      });
  };

  ctrl.addLocation = function(){
    console.log(ctrl.userLocation);
    MapFactory.addLocation();
  };

  MapFactory.initialize();
  ctrl.getMarkers();

}

MapController.$inject = ['MapFactory'];

angular
  .module('app')
  .controller('MapController', MapController);