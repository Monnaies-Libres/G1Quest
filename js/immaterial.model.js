export const fetchImmaterial = async function (minTimestamp, n) {

	// var uri = '/market/record/_search?size='+ n +'&_source=title,description&q=description:envoi+possible%20type=offer'

	var uri = '/market/record/_search'

	var query = {
		  size: n
		, _source: [
			  'title'
			, 'description'
			, 'id'
			, 'price'
			, 'unit'
			, 'category.id'

			//, 'picturesCount'
			//, 'thumbnail'
		]
		, query: {
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
				,must_not: {
					bool: {
						should: [
							// Filtres anti-Annunakis :
							 { match: { 'title': 'soin' } }
							,{ match: { 'title': 'massage' } }
							,{ match: { 'title': 'sophro' } }
							,{ match: { 'title': 'relaxation' } }
							,{ match: { 'title': 'réflexologie' } }
							,{ match: { 'title': 'hypnose' } }
							,{ match: { 'title': 'ésotérique' } }
							,{ match: { 'title': 'yoga' } }
							,{ match: { 'title': 'voyance' } }
							,{ match: { 'title': 'astrologie' } }
							,{ match: { 'title': 'radiesthesie' } }
							,{ match: { 'title': 'chakras' } }
							,{ match: { 'title': 'tarot' } }
							,{ match: { 'title': 'numérologie' } }
							,{ match: { 'description': 'chakras' } }
							,{ match: { 'title': { query: 'thème astral', operator: 'and' } } }

							// Filtres anti-événementiel :
							,{ match: { 'title': 'janvier' } }
							,{ match: { 'title': 'février' } }
							,{ match: { 'title': 'mars' } }
							,{ match: { 'title': 'avril' } }
							,{ match: { 'title': 'mai' } }
							,{ match: { 'title': 'juin' } }
							,{ match: { 'title': 'juillet' } }
							,{ match: { 'title': 'août' } }
							,{ match: { 'title': 'septembre' } }
							,{ match: { 'title': 'octobre' } }
							,{ match: { 'title': 'novembre' } }
							,{ match: { 'title': 'décembre' } }
						]
					}
				}
				,must: {
					nested: {
						path: 'category'
						,query: {
							bool: {
								must_not: [
									 { term: { 'category.id': 'cat49' } } // Évènement
									,{ term: { 'category.id': 'cat65' } } // Covoiturage
									,{ term: { 'category.id': 'cat81' } },  // Filtre anti-Annunakis
								]
								,should: [
									 { term: { 'category.parent': 'cat31' } } // Services
									,{ term: { 'category.id': 'cat74' } } // Formations
								]
								,minimum_should_match: 1
							}
						}
					}
				}

			}

		}
		, sort: [
			// { 'time': 'desc'}
			{ 'creationTime': 'desc'}
		]
	}

	console.log(JSON.stringify(query))

	var fetchOpts = {
		method: 'POST',
		headers: {
			'Accept': 'application/json'
		},
		body: JSON.stringify(query)
	}

	const r = await fetch('https://data.gchange.fr' + uri, fetchOpts)

	console.log(r);

	if (r.ok === true) {

		var obj = r.json()
		console.log(obj)
		return obj
	}

	throw new Error(r.status)

};
