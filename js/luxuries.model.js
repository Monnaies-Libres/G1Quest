export const fetchLuxuries = async function (userLocation, radius, minTimestamp, n) {

	// var uri = '/market/record/_search?size='+ n +'&_source=title,description&q=description:envoi+possible%20type=offer'

	var uri = '/market/record/_search'

	var query = {
		  size: n
		,_source: [
			  'title'
			, 'description'
			, 'id'
			, 'category.id'
			//, 'picturesCount'
			//, 'thumbnail'
		]
		,query: {
			bool: {
				must: [
					{
						exists : { field : 'geoPoint' }
					},
					{
						exists : { field : 'price' }
					}
				],

				filter: [
					{ term: { type: 'offer' } }

					,{

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
				],
				should: [
					{
						bool: {
							must: [
								{
									range: {
										"price": {
											gte: 100000
										}
									}
								}
								, {
									term: {
										"unit": "unit"
									}
								}
							]
						}
					},
					{
						bool: {
							must: [
								{
									range: {
										"price": {
											gte: 10000
										}
									}
								}
								, {
									term: {
										"unit": "ud"
									}
								}
							]
						}
					}
				],
				minimum_should_match: 1
				,must_not:  {
					nested: {
						path: 'category',
						query: {
							bool: {
								should: [
									{ match: { 'category.id': 'cat81' } } // Filtre anti-Annunakis
									,{ match: { 'category.id': 'cat74' } } // Formations
								]
							}
						}
					}
				}
			}
		}
		,sort: [
			// { 'time': 'desc'}
			{ 'creationTime': 'desc'}
		]
	}

	console.log("luxury query :\n", JSON.stringify(query))

	var fetchOpts = {
		method: 'POST',
		headers: {
			'Accept': 'application/json'
		},
		body: JSON.stringify(query)
	}

	// Send the HTTP request
	return fetch('https://data.gchange.fr/market/record/_search', fetchOpts)
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


