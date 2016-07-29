var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Get markers

router.get('/markers', function(req, res, next){
  var textQuery = 'water';
  var DOC_GIS_URL = 'http://maps.doc.govt.nz/arcgis/rest/services/DTO/NamedExperiences/MapServer/0/query?where=&text=' + textQuery + '&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json';
  //Get DOC GIS geometry
  request({
    url: DOC_GIS_URL,
    json: true,
    method: 'GET'
  },function(error, response, body){
    body.features.forEach(function(item, index, array){
      item.trailhead = {lat: item.geometry.paths[0][0][1], lng:item.geometry.paths[0][0][0]};
    });
    res.json(body.features);
  });
});


module.exports = router;
