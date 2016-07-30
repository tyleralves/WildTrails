/**
 * Created by Tyler on 7/30/2016.
 */
function MapFactory($http){
  var MapFactory = {};
  MapFactory.markers = [];
  MapFactory.message = '';
  var map, userLocationMarker, markersArray = [];


  function drawCircle(point, radius, dir) {
    var d2r = Math.PI / 180;   // degrees to radians
    var r2d = 180 / Math.PI;   // radians to degrees
    var earthsradius = 3963; // 3963 is the radius of the earth in miles
    var start, end;
    var points = 32;

    // find the raidus in lat/lon
    var rlat = (radius / earthsradius) * r2d;
    var rlng = rlat / Math.cos(point.lat() * d2r);

    var extp = {};
    extp.rings = [];
    extp.rings.push([]);

    for (var i=0; i < points; i++) {
      var theta = Math.PI * (i / (points/2));
      ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
      ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
      extp.rings[0].push([ey, ex]);
    }
    return extp;
  }

  //Fetches markers/ details from APIs
  MapFactory.getMarkers = function(userLocationPolygon){
    return $http.get('/markers', {
      params: {userLocationPolygon: userLocationPolygon}
    })
      .then(function(response){
        if(response.data.hasOwnProperty('attributes')){
          angular.copy(response.data, MapFactory.markers);
          MapFactory.message = '';
          MapFactory.clearMarkers();
          MapFactory.placeMarkers();
        }else{
          MapFactory.message = response.data.message;
        }

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
      var infoContent = '<h4 class="info-window-heading">'+item.attributes.Name+'</h4>' +
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
    var userLocationPolygon;
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
      var userLocationCircle;
      //Get places from search box
      var places = searchBox.getPlaces();
      if(!places || places.length === 0){
        return;
      }
      userLocation = places[0].geometry.location;
      userLocationPolygon = drawCircle(userLocation, 10);
      console.log(userLocationPolygon);

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
      queryGIS(userLocationPolygon);
      MapFactory.getMarkers(userLocationPolygon);

      //Pans/zooms to user location
      map.fitBounds(bounds);
    });

  };


  var queryGIS = function(userLocationPolygon){
    require([
      "esri/map", "esri/layers/FeatureLayer",
      "esri/tasks/query", "esri/geometry/Circle", "esri/geometry/Polygon","esri/SpatialReference",
      "dojo/dom", "dojo/domReady!"
    ], function(map, FeatureLayer, Query, Circle, Polygon, SpatialReference){
      var featureLayer = new FeatureLayer("http://maps.doc.govt.nz/arcgis/rest/services/DTO/NamedExperiences/MapServer/0",{});
      console.log('in gis query');
      var query = new Query();
      userLocationPolygon.spatialReference={"wkid":4326};
      query.geometry = new Polygon(userLocationPolygon);
      query.outSpatialReference = new SpatialReference('4326');
      //query.text = 'water';
      featureLayer.queryFeatures(query, function(response){
        console.log(response);
      });
    });
  };


  return MapFactory;

}

MapFactory.$inject = ['$http'];

angular
  .module('app')
  .factory('MapFactory', MapFactory);