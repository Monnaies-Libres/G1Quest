export const fetchShippable = async function (minTimestamp, n) {

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
				filter: [
					{ term: { type: 'offer' } }

					,{
						range: {
							time: {
								gte: minTimestamp
							}
						}
					}

					,{

						range: {
							stock: {
								gte: 1
							}
						}
					}
				]
				,should: [
					{ match: { 'description': { query: 'envoi possible', operator: 'and' } } }
					,{ match: { 'description': { query: 'Mondial Relay', operator: 'and' } } }
					,{ match: { 'description': { query: 'mondiale relais', operator: 'and' } } }
					,{ match: { 'description': { query: 'frais de port', operator: 'and' } } }
					,{ match: { 'description': { query: 'La Poste', operator: 'and' } } }
					,{ match: { 'description': 'LaPoste' } }
					,{ match: { 'description': 'Chronopost' } }
					,{ match: { 'description': 'Colissimo' } }
					,{ match: { 'description': 'bordereau' } }
				]
				,minimum_should_match: 1
				,must_not:  {
					nested: {
						path: 'category',
						query: {
							bool: {
								should: [
									{ match: { 'category.id': 'cat81' } } // Filtre anti-Annunakis
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

	console.log('shippable query : ', JSON.stringify(query))

	var fetchOpts = {
		method: 'POST',
		headers: {
			'Accept': 'application/json'
		},
		body: JSON.stringify(query)
	}

	const r = await fetch('https://data.gchange.fr' + uri, fetchOpts)

	if (r.ok === true) {

		return r.json()
	}

	throw new Error(r.status)

};


