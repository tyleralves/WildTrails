/**
 * Created by Tyler on 7/30/2016.
 */
function MapFactory($http){
  var MapFactory = {};
  MapFactory.markers = [];
  var map, userLocationMarker, markersArray = [];

  //Fetches markers/ details from APIs
  MapFactory.getMarkers = function(){
    return $http.get('/markers')
      .then(function(response){
        angular.copy(response.data, MapFactory.markers);
        MapFactory.clearMarkers();
        MapFactory.placeMarkers();
      });
  };

  //Removes markers from map
  MapFactory.clearMarkers = function(){
    markersArray.forEach(function(item, index, array){
      item.setMap(null);
    });
    markersArray = [];
  };

  //Places markers on map
  MapFactory.placeMarkers = function(){
    //console.log(MapFactory.markers[0].trailhead);
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

      markersArray.push(marker);

      marker.setMap(map);
    });
  };

  MapFactory.initialize = function(){
    var centerLatLng = {lat:-41, lng: 173};
    var bounds = new google.maps.LatLngBounds();

    if(!map){
      map = new google.maps.Map(document.getElementById('map'), {
        center: centerLatLng,
        zoom: 5
      });
    }

    //Creates searchbox and links to UI element
    var input = document.getElementById('location-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    //Bias search results toward current map bounds
    map.addListener('bounds_changed', function(){
      searchBox.setBounds(map.getBounds());
    });

    //Fires when search box query changes
    searchBox.addListener('places_changed', function(){

      //Get places from search box
      var places = searchBox.getPlaces();
      if(!places || places.length === 0){
        return;
      }
      console.log('places changed');
      userLocation = places[0].geometry.location;

      //Adds marker to user location
      userLocationMarker = new google.maps.Marker({
        position: userLocation,
        title: 'User Location',
        map: map
      });

      //Sets bounds of user location
      if(places[0].geometry.viewport){
        bounds.union(places[0].geometry.viewport);
      }else{
        bounds.extend(places[0].geometry.location);
      }

      MapFactory.getMarkers(userLocation);

      //Pans/zooms to user location
      map.fitBounds(bounds);
    });

  };


  return MapFactory;

}

MapFactory.$inject = ['$http'];

angular
  .module('app')
  .factory('MapFactory', MapFactory);