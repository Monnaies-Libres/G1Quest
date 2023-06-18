
export const getDormant = (userLocation, radius) => {

	// Form the query
	const body = {
		query: {
			bool: {
				must: {
					match_all: {}
				},
				filter: {
					geo_distance: {
						distance: radius + 'km',
						'geoPoint': {
							lat: userLocation.lat,
							lon: userLocation.lon
						}
					}
				}
			}
		},

		sort : [
			{ "time" : {"order" : "desc"}},
			"_score"
		],

		_source: ['geoPoint', '_id', 'time'],

		size: 30
	};

	// Send the HTTP request
	return fetch('https://data.gchange.fr/page/record/_search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
	.then(response => response.json())
	.then(data => {

		return data.hits.hits;
	})
	.catch(error => {
		console.error(error);
		throw error; // This is needed so the error can be caught outside this function
	});
};
