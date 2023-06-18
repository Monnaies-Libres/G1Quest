
export const displayPageDetails = (pageId) => {
	// Get the panel element
	const panel = document.getElementById('panel-details');

	// Show the loading icon
	let loadingIcon_elt = document.getElementById('loading-icon');
	loadingIcon_elt.style.display = 'block';

	// Clear any existing content in the panel
	panel.innerHTML = '';

	// Remove 'selected' class from any dot that might have it
	const selectedDot = document.querySelector('.dot.selected');
	if (selectedDot) {
		selectedDot.classList.remove('selected');
	}

	// Add 'selected' class to the clicked dot
	const clickedDot = document.getElementById(pageId);
	if (clickedDot) {
		clickedDot.classList.add('selected');
	}

	// Send a GET request to the Elastic Search endpoint /page/record/{id}
	fetch(`https://data.gchange.fr/page/record/${pageId}`)
		.then(response => response.json())
		.then(data => {
			console.log('page data : ', data);

			// Hide the loading icon
			loadingIcon_elt.style.display = 'none';

			// Create elements for the page details
			const title = document.createElement('h2');
			title.textContent = data._source.title;


			let image = null;

			if (   typeof data._source.picturesCount !== 'undefined'
				&& data._source.picturesCount > 0) {

				image = document.createElement('img');
				image.src = 'data:' + data._source.pictures[0].file._content_type + ';base64, ' + data._source.pictures[0].file._content;
			}

			const description = document.createElement('p');
			description.textContent = data._source.description;

			const address = document.createElement('p');
			address.textContent = data._source.address;

			// Append the elements to the panel
			panel.appendChild(title);

			if (typeof image !== 'undefined'
				&&	 image !== null) {

				panel.appendChild(image);
			}

			panel.appendChild(description);
			panel.appendChild(address);
		})
		.catch(error => {
			// If there's an error, also hide the loading icon
			loadingIcon_elt.style.display = 'none';

			console.error('Error:', error)
		});
};


export const displayRecordDetails = (recordId) => {

	// Get the panel element
	const panel = document.getElementById('panel-details');

	// Show the loading icon
	let loadingIcon_elt = document.getElementById('loading-icon');
	loadingIcon_elt.style.display = 'block';

	// Clear any existing content in the panel
	panel.innerHTML = '';

	// Send a GET request to the Elastic Search endpoint /market/record/{id}
	fetch(`https://data.gchange.fr/market/record/${recordId}`)
		.then(response => response.json())
		.then(data => {
			console.log('record data : ', data);

			// Hide the loading icon
			loadingIcon_elt.style.display = 'none';

			// Create elements for the record details
			const title = document.createElement('h2');
			title.textContent = data._source.title;

			let image = null;

			if (data._source.picturesCount > 0) {
				image = document.createElement('img');
				image.src = 'data:' + data._source.pictures[0].file._content_type + ';base64, ' + data._source.pictures[0].file._content;
			}

			const description = document.createElement('p');
			description.textContent = data._source.description;

			const gchangeLink	   = document.createElement('a');
			gchangeLink.href = 'https://www.gchange.fr/#/app/market/view/' + data._id + '/';
			gchangeLink.textContent = 'Voir sur Gchange'
			const gchangeLink_outer = document.createElement('p');
			gchangeLink_outer.appendChild(gchangeLink);


			let now = moment();
			let recordDate = moment(data._source.time*1000);

			// Set the locale to French
			recordDate.locale(navigator.language);  // Replace 'fr' with the desired locale

			const lastEditDate = document.createElement('p');
			lastEditDate.textContent = recordDate.from(now);

			const category = document.createElement('p');
			category.textContent = data._source.category.id + ' : ' + data._source.category.name;

			const address = document.createElement('p');
			address.textContent = data._source.address;

			// Append the elements to the panel
			panel.appendChild(title);
			panel.appendChild(lastEditDate);
			panel.appendChild(category);
			panel.appendChild(gchangeLink_outer);

			if (image !== null) {
				panel.appendChild(image);
			}

			panel.appendChild(description);
			panel.appendChild(address);
		})
		.catch(error => {
			// If there's an error, also hide the loading icon
			loadingIcon_elt.style.display = 'none';

			console.error('Error:', error)
		});
};
