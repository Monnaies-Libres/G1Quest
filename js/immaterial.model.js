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
				,should: [
					{
						match: {
							'title': {query: "formation", boost: 2 }
						}
					}
					,{
						match: {
							'title': {query: "jours", boost: -40 }
						}
					}
					,{
						match: {
							'description': {query: "à distance", operator: "and", boost: 1.50 }
						}
					}
					,{
						match: {
							'description': {query: "visio", boost: 1.25 }
						}
					}
					,{
						match: {
							'description': {query: "par téléphone", operator: "and", boost: 1.20 }
						}
					}
					,{
						match: {
							'description': {query: "téléphonique", operator: "and", boost: 1.20 }
						}
					}
					,{
						match: {
							'description': {query: "formation", boost: 1.15 }
						}
					}
					,{
						match: {
							'description': {query: "jours", boost: -20 }
						}
					}
					,{
						match: {
							'description': {query: "à domicile", boost: -15 }
						}
					}
					,{
						match: {
							'description': {query: "en cabinet", boost: -25 }
						}
					}
					,{
						match: {
							'description': {query: "lieu", boost: -50 }
						}
					}
					,{
						match: {
							'description': {query: "adresse", boost: -50 }
						}
					}
					,{
						bool: {
							must_not: [
								{ exists : { field : 'geoPoint' } }
							]
						}
					}
				]
				,must_not: [
					{
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
								,{ match: { 'title': 'pendule' } }
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
				]
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
			'_score'
			,{ 'creationTime': 'desc'}
		]
	}

	console.log("immaterial query :\n", JSON.stringify(query))

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

		let records = await r.json();

		return records.hits.hits;
	}

	throw new Error(r.status)

};
