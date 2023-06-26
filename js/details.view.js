import { categoriesNames } from './categoriesNames.js'

export const displayPageDetails = (data) => {

	const panelDetails = document.getElementById('panel-details');

	let article = document.createElement('article');

	// panelDetails.innerHTML = '';

	// Remove 'selected' class from any dot that might have it
	const selectedDot = document.querySelector('.dot.selected');
	if (selectedDot) {
		selectedDot.classList.remove('selected');
	}

	// Add 'selected' class to the clicked dot
	const clickedDot = document.getElementById(data._id);
	if (clickedDot) {
		clickedDot.classList.add('selected');
	}

	// Send a GET request to the Elastic Search endpoint /page/record/{id}
	console.log('page data : ', data);

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

	// Append the elements to the article

	article.appendChild(title);

	if (typeof image !== 'undefined'
		&&	 image !== null) {

		article.appendChild(image);
	}

	article.appendChild(description);
	article.appendChild(address);

	panelDetails.prepend(article);
};

export const displayRecordDetails = (data) => {

	// Get the panel element
	let panelDetails = document.getElementById('panel-details');

	let article = document.createElement('article');
	article.classList.add(data._source.category.id );

	// Clear any existing content in the panel
	// panelDetails.innerHTML = '';

	// Send a GET request to the Elastic Search endpoint /market/record/{id}
	console.log('record data : ', data);

	// Create elements for the record details
	const title = document.createElement('h2');
	title.classList.add('title');
	title.textContent = data._source.title;

	let image = null;
	let image_outer = null;

	if (data._source.picturesCount > 0) {

		image = document.createElement('img');
		image_outer = document.createElement('p');
		image_outer.classList.add('pictures');

		image.src = 'data:' + data._source.pictures[0].file._content_type + ';base64, ' + data._source.pictures[0].file._content;

		image_outer.append(image);
	}

	const description = document.createElement('p');
	description.textContent = data._source.description;

	const gchangeLink	   = document.createElement('a');
	gchangeLink.href = 'https://www.gchange.fr/#/app/market/view/' + data._id + '/';
	gchangeLink.textContent = 'Voir sur Gchange'
	const gchangeLink_outer = document.createElement('p');
	gchangeLink_outer.classList.add('link-to-gchange');
	gchangeLink_outer.appendChild(gchangeLink);

	let priceElt = null;

	if (data._source.price != null) {

		priceElt = document.createElement('p');
		priceElt.classList.add('price');

		if (data._source.unit == 'UD') {

			priceElt.textContent  = (data._source.price).toString() + ' ';
			priceElt.textContent += 'DUĞ1';

		} else {

			priceElt.textContent  = Math.floor(data._source.price / 100).toString() + ' ';
			priceElt.textContent += 'Ğ1';
		}
	}

	let now = moment();
	let recordDate = moment(data._source.time*1000);

	// Set the locale to French
	recordDate.locale(navigator.language);  // Replace 'fr' with the desired locale

	const lastEditDate = document.createElement('time');
	lastEditDate.textContent = recordDate.from(now);
	const lastEditDate_outer = document.createElement('p');
	lastEditDate_outer.classList.add('last-edit-date');
	lastEditDate_outer.append(lastEditDate);

	const category = document.createElement('p');
	category.classList.add('category');
	category.textContent = categoriesNames[data._source.category.id].localizedNames['fr-FR'];

	const address = document.createElement('address');
	address.textContent = data._source.address;

	// Append the elements to the article
	article.appendChild(title);
	article.appendChild(lastEditDate_outer);
	if (priceElt != null) {

		article.appendChild(priceElt);
	}
	article.appendChild(category);
	article.appendChild(gchangeLink_outer);

	if (image_outer !== null) {
		article.appendChild(image_outer);
	}

	article.appendChild(description);
	article.appendChild(address);

	panelDetails.prepend(article);
};
