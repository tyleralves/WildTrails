/**
 * Created by Tyler on 7/30/2016.
 */
function MapFactory($http, $q){
  var MapFactory = {};
  MapFactory.markers = [];
  MapFactory.message = '';
  var map, userLocationMarker, userLocationPolygon, bounds, markersArray = [];


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
  MapFactory.getMarkers = function(response){

    if(response[0].hasOwnProperty('attributes')){
      angular.copy(response, MapFactory.markers);
      MapFactory.message = '';
      MapFactory.clearMarkers();
      MapFactory.placeMarkers();
    }else{
      MapFactory.message = 'No Results';
    }


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
    //console.log(MapFactory.markers);
    MapFactory.markers.forEach(function(item, index, array){
      var marker = new google.maps.Marker({
        position: MapFactory.markers[index].trailhead,
        title: item.attributes.Name
      });

      var introduction = item.webData.hasOwnProperty('Introduction')?item.webData.Introduction:'';
      var thumbnail = item.webData.hasOwnProperty('IntroductionThumbnail')?item.webData.IntroductionThumbnail:'';

      var infoContent = "<h4 class='info-window-heading'>"+item.attributes.Name+"</h4>" +
          "<div>"+introduction+"</div>" +
          "<img src='http://doc.govt.nz" + thumbnail + "'>";

      var infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });


      marker.addListener('click', function(){
        currentInfoWindow && currentInfoWindow.close();
        currentInfoWindow = infoWindow;
        infoWindow.open(map, marker);
      });

      markersArray.push(marker);
      console.log(markersArray);
      marker.setMap(map);

      bounds.extend(marker.getPosition());
    });
    bounds.fitBounds(bounds);
  };



  MapFactory.initialize = function(){
    var centerLatLng = {lat:-41, lng: 173};
    bounds = new google.maps.LatLngBounds();

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
      queryGIS();


    });

  };


  var queryGIS = function(){
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
      query.outSpatialReference = new SpatialReference(4326);
      query.outFields = ["*"];
      featureLayer.queryFeatures(query, function(response){
        var qPromises = [];
        if(response.hasOwnProperty('features')){
          response.features.forEach(function(item, index, array){
            item.trailhead = {lat: item.geometry.paths[0][0][1], lng:item.geometry.paths[0][0][0]};

            var newPromise = $http.get('/getWebData', {
                params:{Web_URL: item.attributes.Web_URL}
              }).then(function(response){
                if(response.data.hasOwnProperty('webData')){
                  item.webData = response.data.webData;
                }else{
                  item.webData = {

                  };
                }

              });
            qPromises.push(newPromise);

          });
          $q.all(qPromises)
            .then(function(){
              MapFactory.getMarkers(response.features);
            });

        }else{
          return;
        }
      });
    });
  };


  return MapFactory;

}

MapFactory.$inject = ['$http', '$q'];

angular
  .module('app')
  .factory('MapFactory', MapFactory);