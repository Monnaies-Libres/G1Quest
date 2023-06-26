export const fetchExchange = async function (minTimestamp, n) {

	let validTitlesRegexes = [
		  /billets? de [0-9]+\s*(euros|€|UNL)/i
		, /(euros|€|UNL) contre/i
		, /contre( des)? ([0-9]+)?(euros|€|UNL)/i
	];

	let validRecords = [];

	var uri = '/market/record/_search'

	var query = {
		  size: n
		,_source: [
			  'title'
			, 'description'
			, 'id'
			, 'category.id'
			, 'price'
			, 'unit'
			//, 'picturesCount'
			//, 'thumbnail'
		]
		,query: {
			bool: {
				filter: [
					{
						range: {
							time: {
								gte: minTimestamp
							}
						}
					}

					,{

						range: {
							'stock': {
								gte: 1
							}
						}
					}
				]
				,should: [
					  { term: { 'title': 'euro' } }
					, { term: { 'title': 'euros' } }
					, { term: { 'title': '€' } }
					, { term: { 'title': 'UNL' } }
					, { term: { 'title': 'billet' } }
					, { term: { 'title': 'billets' } }
				]
				, minimum_should_match: 1
			}
		}
		,sort: [
			// { 'time': 'desc'}
			{ 'creationTime': 'desc'}
		]
	}

	console.log("exchange query :\n", JSON.stringify(query))

	var fetchOpts = {
		method: 'POST',
		headers: {
			'Accept': 'application/json'
		},
		body: JSON.stringify(query)
	}

	const r = await fetch('https://data.gchange.fr' + uri, fetchOpts)

	if (r.ok === true) {

		let records = await r.json();

		for (const record of records.hits.hits) {

			for (const regex of validTitlesRegexes){

				if (regex.test(record._source.title)) {

					validRecords.push(record);
				}
			}
		}

		return validRecords;
	}

	throw new Error(r.status)

};


