var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var DOC_WEB_JSON = require('../public/data/tracks_data_indexed.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*Get website data
//One time use utility used to download doc website json to public/data/parks_data.json
router.get('/webdata', function(req, res, next){
  var DOC_WEB_URL = 'http://www.doc.govt.nz/api/profiles/tracks';

  request({
    url: DOC_WEB_URL,
    json: true,
    method: 'GET'
  }, function(error, response, body){
    res.json(body);
  })
});
 */

/*Index parks_data.json*/
//Single-use utility function that added index object to parks_data.json and outputting to parks_data_indexed.json
router.get('/indexWebData', function(req, res, next){
  var webData = require('../public/data/parks_data.json');
  var indexObj = {};
  webData.forEach(function(item, index, array){
    var url = "http://www.doc.govt.nz/link/" + item.Id.toUpperCase() + ".aspx";
    indexObj[url] = index;
  });
  webData.unshift(indexObj);
  fs.writeFile('public/data/parks_data_indexed.json', JSON.stringify(webData), function(error){
    console.log(error);
  });
});


//Get markers
router.get('/markers', function(req, res, next){
  var textQuery = '';
  var locationQuery = '';
  var proximityQuery = req.query.userLocationPolygon?JSON.stringify(req.query.userLocationPolygon):'';
  console.log(proximityQuery);
  var DOC_GIS_URL = 'http://maps.doc.govt.nz/arcgis/rest/services/DTO/NamedExperiences/MapServer/0/query?where=&text=' + textQuery + '&objectIds=&time=&geometry='+proximityQuery+'&geometryType=esriGeometryPolygon&inSR=4326&spatialRel=esriSpatialRelContains&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json';
  //Get DOC GIS geometry
  request({
    url: DOC_GIS_URL,
    json: true,
    method: 'GET'
  },function(error, response, body){
    if(body.hasOwnProperty('features')){
      body.features.forEach(function(item, index, array){
        console.log('index route got some features!');
        item.trailhead = {lat: item.geometry.paths[0][0][1], lng:item.geometry.paths[0][0][0]};
        var webDataIndex = DOC_WEB_JSON[0][item.attributes.Web_URL];
        item.webData = DOC_WEB_JSON[webDataIndex + 1];
      });
      res.json(body.features);
    }else{
      res.json({message:'No results'});
    }

  });
});


module.exports = router;
