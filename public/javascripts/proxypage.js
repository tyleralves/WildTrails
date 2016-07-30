var request = require('request');

exports.proxy = function(req, res) {
	var url, query, query_params, full_url;

	if (req.method == 'GET') {
		url = req.url.split('?')[1];
		query = req.url.split('?')[2];
		query_params = '';
		if (typeof query !== 'undefined') {
			query_params = '?' + query;
		}
		full_url = url + query_params;
		request.get(full_url, function(error, response, body){
			if(error){
				if(error.code==='ECONNREFUSED'){
					console.log('Connection refused');
				}else{
					console.log(error);
				}
			}else{
				console.log(body.indexOf('features'));
			}
		})
			.on('error', function(err){
				//
			})
			.pipe(res);
	} else if (req.method == 'POST') {
		url = req.url.split('?')[1];
		request({
			method: 'POST',
			url: url,
			form: req.body
		}, function(error, response, body){
			if(error.code==='ECONNREFUSED'){
				console.log('Connection refused');
			}else{
				throw error;
			}
		}).pipe(res);
	} else {
		res.jsonp({
			error: 'Http method not supported use GET or POST'
		});
	}
};
