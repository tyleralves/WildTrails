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
    var url = "https://www.doc.govt.nz/link/" + item.Id.toUpperCase() + ".aspx";
    indexObj[url] = index;
  });
  webData.unshift(indexObj);
  fs.writeFile('public/data/parks_data_indexed.json', JSON.stringify(webData), function(error){
    console.log(error);
  });
});


//Get markers
router.get('/getWebData', function(req, res, next){
  var webUrl = req.query.Web_URL;
  console.log(webUrl);

  var webDataIndex = DOC_WEB_JSON[0][webUrl];
  res.json({webData: DOC_WEB_JSON[webDataIndex + 1]});

});


module.exports = router;
