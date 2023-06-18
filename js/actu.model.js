

export const getActu = async (userLocation, radius, minTimestamp) => {

	// Form the query
	const body = {
		query: {
			bool: {
				must: {
					exists : { field : 'geoPoint' }
				},
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
				],

				should: [
					{
						bool: {
							must: [
								{ term: { type: "offer" } },
								{ nested: {
									path: "category",
									query: {
										bool: { must_not: [
											{ term: { "category.id": "cat81" } },  // Filtre anti-Annunakis ; celle-là elle est pour pour toi, FredB ;-)
											{ term: { "category.id": "cat31" } }, // Prestation de services
											{ term: { "category.parent": "cat31" } }
										] }
									}
								} }
							]
						}
					},
					{
						bool: {
							must: [
								{ term: { type: "need" } },
								{ nested: {
									path: "category",
									query: {
										bool: { should: [
											{ term: { "category.parent": "cat31" } },
											{ term: { "category.id": "cat31" } },
											{ term: { "category.parent": "cat56" } }, // Matériel professionnel
											{ term: { "category.id": "cat56" } }
										] }
									}
								} }
							]
						}
					}
				],
				minimum_should_match: 1
			}
		},

		sort : [
			{ "time" : {"order" : "desc"}},
			"_score"
		],

		_source: ['geoPoint', '_id', 'time', 'category.id', 'category.parent', 'type'],

		size: 90
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
