
const timestampBackThen_2_years = Math.floor((Date.now() - (2 * 365 * 24 * 60 * 60 * 1000)) / 1000);

export const getNeedsCategories = async function (userLocation, radius) {

	const validParentCategories = [
		'cat71', // Emploi
		'cat1',  // Véhicules
		'cat18', // Maison
		'cat56', // Matériel professionnel
		'cat31', // Services
		'cat90'  // Alimentation
	];

	const specificCategory = 'cat11'; // Colocations

	const response = await fetch('https://data.gchange.fr/market/record/_search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			size: 0,
			query: {
				bool: {
					must: [

						{ match_all: {} }

						,{ exists : { field : 'geoPoint' } }
						/*

						,{
							nested: {
								path: "category",
								query: {
									bool: {
										should: [
											...validParentCategories.map(category => ({ term: { 'category.parent': category } })),

											{ term: { 'category.id': specificCategory } }
										],
										minimum_should_match: 1
									}
								}
							}
						}
						*/
					]

					,filter: [
						{ term: { 'type': 'need' } }

						,{
							geo_distance: {
								'distance': radius + 'km',
								'geoPoint': {
									'lat': userLocation.lat,
									'lon': userLocation.lon
								}
							}
						}

						,{
							range: {
								"creationTime": {
									gte: timestampBackThen_2_years
								}
							}
						}
					]
				}
			},
			aggs: {
				"categories": {
					nested: {
						path: "category"
					},
					aggs: {
						"category_ids": {
							terms: {
								field: "category.id"
							},
							aggs: {
								"ads_details": {
									reverse_nested: {},
									aggs: {
										"total_price": {
											sum: {
												field: "price"
											}
										},
										"count_ads": {
											value_count: {
												field: "hash"
											}
										}
									}
								}
							}
						}
					}
				}
			}
		})
	});


	const data = await response.json();
	//console.log('data : ', data);
	return data.aggregations.categories.category_ids.buckets;
};


export const getNeedsInCategory = async function (userLocation, radius, category) {
	const response = await fetch('https://data.gchange.fr/market/record/_search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			size: 1000,
			query: {
				bool: {
					must: [
						{ term: { 'type': 'need' } },
						{
							nested: {
								path: "category",
								query: {
									bool: {
										must: [
											{ term: { 'category.id': category } }
										]
									}
								}
							}
						},
						{
							range: {
								"creationTime": {
									gte: timestampBackThen_2_years
								}
							}
						},
						{
							geo_distance: {
								'distance': radius + 'km',
								'geoPoint': {
									'lat': userLocation.lat,
									'lon': userLocation.lon
								}
							}
						}
					]
				}
			}
		})
	});

	const data = await response.json();
	return data.hits.hits;
};

export const getNeeds = async function (userLocation, radius) {

	const validParentCategories = ['cat71', 'cat1', 'cat18', 'cat56', 'cat31', 'cat90'];
	const specificCategory = 'cat11';

	const response = await fetch('https://data.gchange.fr/market/record/_search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			sort : [
				{ "time" : {"order" : "desc"}},
				"_score"
			],

			_source: ['geoPoint', '_id', 'time', 'category.id', 'category.name', 'category.parent', 'type', 'title'],

			size: 30,

			query: {
				bool: {
					must: [
						{ exists : { field : 'geoPoint' } }

						,{
							nested: {
								path: "category",
								query: {
									bool: {
										should: [
											...validParentCategories.map(category => ({ term: { 'category.parent': category } })),
											/*
											{ term: { 'category.parent': 'cat71' } },
											{ term: { 'category.parent': 'cat1' } },
											{ term: { 'category.parent': 'cat18' } },
											{ term: { 'category.parent': 'cat56' } },
											{ term: { 'category.parent': 'cat31' } },
											{ term: { 'category.parent': 'cat90' } },
											*/
											{ term: { 'category.id': specificCategory } }
										],
										minimum_should_match: 1
									}
								}
							}
						}
					]

					,filter: [
						{ term: { 'type': 'need' } },
						{
							geo_distance: {
								'distance': radius + 'km',
								'geoPoint': {
									'lat': userLocation.lat,
									'lon': userLocation.lon
								}
							}
						}
					]
				}
			}
		})
	});

	const data = await response.json();
	return data.hits.hits;
};

// La fonction pour regrouper les records par catégorie
function groupByCategory (records) {
	const categories = {};

	for (const record of records) {
		const category = record._source.category.name;

		if (!categories[category]) {
			categories[category] = [];
		}

		categories[category].push(record);
	}

	return categories;
}
