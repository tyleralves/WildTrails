/**
 * Created by Tyler on 7/30/2016.
 */
function MapFactory($http){
  var MapFactory = {};
  MapFactory.markers = [];
  var map;



  MapFactory.getMarkers = function(){
    return $http.get('/markers')
      .then(function(response){
        angular.copy(response.data, MapFactory.markers);
        MapFactory.placeMarkers();
      });
  };

  MapFactory.placeMarkers = function(){
    console.log(MapFactory.markers[0].trailhead);
    var currentInfoWindow;
    MapFactory.markers.forEach(function(item, index, array){
      var marker = new google.maps.Marker({
        position: MapFactory.markers[index].trailhead,
        title: 'item.attributes.name'
      });
      var infoContent = '<h4>'+item.attributes.Name+'</h4>' +
          '<div>'+item.webData.Introduction+'</div>' +
          "<img src='http://doc.govt.nz" +item.webData.IntroductionThumbnail + "'>";

      var infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });


      marker.addListener('click', function(){
        currentInfoWindow && currentInfoWindow.close();
        currentInfoWindow = infoWindow;
        infoWindow.open(map, marker);
      });

      marker.setMap(map);
    });
  };

  MapFactory.initialize = function(){
    var centerLatLng = {lat:-41, lng: 173};

    if(!map){
      map = new google.maps.Map(document.getElementById('map'), {
        center: centerLatLng,
        zoom: 5
      });
    }
  };

  return MapFactory;

}

MapFactory.$inject = ['$http'];

angular
  .module('app')
  .factory('MapFactory', MapFactory);