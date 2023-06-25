export const fetchPageDetails = async (pageId) => {

	return fetch(`https://data.gchange.fr/page/record/${pageId}`)
	.then(response => response.json())
	.then(data => {
		console.log('page data : ', data);
		return data;
	})
	.catch(error => {

		console.error('Error:', error)

		throw error;
	});
};

export const fetchRecordDetails = async (recordId) => {

	return fetch(`https://data.gchange.fr/market/record/${recordId}`)
	.then(response => response.json())
	.then(data => {
		console.log('record data : ', data);
		return data;
	})
	.catch(error => {

		console.error('Error:', error)

		throw error;
	});
};

