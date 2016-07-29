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
        ctrl.message = false;
        ctrl.markers = MapFactory.markers;
        console.log('controller');
      });
  };

  MapFactory.initialize();
  ctrl.getMarkers();

}

MapController.$inject = ['MapFactory'];

angular
  .module('app')
  .controller('MapController', MapController);