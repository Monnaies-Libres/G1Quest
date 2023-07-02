import { categoriesNames } from './categoriesNames.js'


export const finishPanel = () => {

	panel.classList.remove('loading');
};


export const preparePanel = () => {

	let panel = document.getElementById('panel');
	const panelDetails = document.getElementById('panel-details');
	panelDetails.scrollTop = 0;

	let previousLastArticleFullyLoaded = null;
	previousLastArticleFullyLoaded = panelDetails.querySelector('article.last-fully-loaded');
	if (previousLastArticleFullyLoaded != null) {

		previousLastArticleFullyLoaded.classList.remove('last-fully-loaded');
	}

	let lastArticleFullyLoaded = null;
	lastArticleFullyLoaded = panel.querySelector('article:first-of-type');
	if (lastArticleFullyLoaded != null) {

		lastArticleFullyLoaded.classList.add('last-fully-loaded');
	}

	let article = document.createElement('article');
	panelDetails.prepend(article);

	panel.classList.add('loading');
};

export const displayPageDetails = (data) => {

	console.log(data);

	// Get the panel element
	let panelDetails = document.getElementById('panel-details');

	let article_outer_outer = panelDetails.querySelector('article:first-of-type');

	if (data._source.category !== undefined && data._source.category.id !== undefined) {

		article_outer_outer.classList.add('page-cat-' + data._source.category.id);
	}

	article_outer_outer.classList.add('page');

	let article_outer = document.createElement('div');
	let article = document.createElement('div');

	article_outer.appendChild(article);
	article_outer_outer.appendChild(article_outer);

	// Send a GET request to the Elastic Search endpoint /page/record/{id}
	console.log('page data : ', data);

	// Create elements for the page details
	const title = document.createElement('h2');
	title.classList.add('title');
	title.textContent = data._source.title;


	let image = null;
	let image_outer = null;

	if (   typeof data._source.picturesCount !== 'undefined'
		&& data._source.picturesCount > 0) {

		image = document.createElement('img');
		image_outer = document.createElement('p');
		image_outer.classList.add('pictures');

		image.src = 'data:' + data._source.pictures[0].file._content_type + ';base64, ' + data._source.pictures[0].file._content;

		image_outer.append(image);
	}

	const description = document.createElement('p');
	description.classList.add('description');
	description.textContent = data._source.description;

	const gchangeLink	   = document.createElement('a');
	gchangeLink.href = 'https://www.gchange.fr/#/app/page/view/' + data._id + '/';
	gchangeLink.textContent = 'Voir sur Gchange'
	gchangeLink.addEventListener('click', (event) => {
		window.open(event.target.href);
		return false;
	});
	const gchangeLink_outer = document.createElement('p');
	gchangeLink_outer.classList.add('link-to-gchange');
	gchangeLink_outer.appendChild(gchangeLink);

	const address_outer = document.createElement('address');
	const address = document.createElement('p');
	address.classList.add('address');
	address.textContent  = data._source.address;
	const city = document.createElement('p');
	city.classList.add('city');
	city.textContent  = data._source.city;
	address_outer.append(address);
	address_outer.append(city);

	// Append the elements to the article

	article.appendChild(title);

	if (typeof image !== 'undefined'
		&&	 image !== null) {

		article.appendChild(image);
	}

	article.appendChild(description);
	article.appendChild(address_outer);
	article.appendChild(gchangeLink_outer);
};

export const displayRecordDetails = (data) => {

	// Get the panel element
	let panelDetails = document.getElementById('panel-details');

	let article_outer_outer = panelDetails.querySelector('article:first-of-type');
	article_outer_outer.classList.add(data._source.category.id );

	let article_outer = document.createElement('div');
	let article = document.createElement('div');

	article_outer.appendChild(article);
	article_outer_outer.appendChild(article_outer);

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
	description.classList.add('description');
	description.textContent = data._source.description;

	const gchangeLink	   = document.createElement('a');
	gchangeLink.href = 'https://www.gchange.fr/#/app/market/view/' + data._id + '/';
	gchangeLink.textContent = 'Voir sur Gchange'
	gchangeLink.addEventListener('click', (event) => {
		window.open(event.target.href);
		return false;
	});
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

	const address_outer = document.createElement('address');
	const address = document.createElement('p');
	address.classList.add('address');
	address.textContent  = data._source.address;
	const city = document.createElement('p');
	city.classList.add('city');
	city.textContent  = data._source.city;
	address_outer.append(address);
	address_outer.append(city);

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
	article.appendChild(address_outer);
};
