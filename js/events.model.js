export const fetchEvents = async (userLocation, radius, minTimestamp) => {

	// Form the query
	const body = {

		size: 90

		,_source: [
			'geoPoint',
			'_id',
			'time',
			'type',
			'title',
			'category.id'
		]

		,sort : [
			{ "time" : {"order" : "desc"}},
			"_score"
		]

		,query: {
			bool: {
				must: [
					 { exists : { field : 'geoPoint' } }
					,{
						nested: {
							path: "category",
							query: {
								bool: {
									must: [
										{ term: { "category.id": "cat49" } }  // Évènements
									]
								}
							}
						}
					}
				],
				filter: [
					{

						geo_distance: {
							distance: radius + 'km',
							geoPoint: {
								lat: userLocation.lat,
								lon: userLocation.lon
							}
						}

					},{

						range: {
							time: {
								gte: minTimestamp
							}
						}

					}, {

						range: {
							stock: {
								gte: 1
							}
						}
					}
				]
			}
		}
	};

	// Send the HTTP request
	return fetch('https://data.gchange.fr/market/record/_search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	})
	.then(data => {

		return data.hits.hits;
	})
	.catch(error => {
		console.error(error);
		throw error; // This is needed so the error can be caught outside this function
	});
};
