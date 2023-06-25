import { fetchRecordDetails } from './details.model.js'
import { displayRecordDetails } from './details.view.js'

export const displayShippable = function (records) {

	let offersElt = document.querySelector('#shippable .list');

	for (const record of records) {

		let offerLi = document.createElement('li')

		let offerLink = document.createElement('a')

		let offerTxt = document.createElement('span')

		let offerImgContainer = document.createElement('span')

		let offerImg = document.createElement('img')

		offerLi.classList.add('ad');
		offerLi.classList.add('record');
		offerLi.classList.add(record._source.category.id);

		/*
		if (record._source.picturesCount > 0) {

			offerImg.src = 'data:' + (record._source.thumbnail._content_type) + ';base64,' + (record._source.thumbnail._content)

		} else {

			offerImg.src = 'games/space/img/default-shippable.256.png'
		}
		*/

		offerTxt.textContent = record._source.title

		offerImg.alt = record._source.title
		offerImg.title = record._source.title

		offerLink.dataset.recordId = record._id;

		// offerLink.innerHTML = record._source.title
		// offerLink.href = 'https://www.gchange.fr/#/app/market/view/' + record._id + '/'
		offerLink.href = '#' + record._id;

		// Add event listener for when the dot is clicked
		offerLink.addEventListener('click', (event) => {

			let panel = document.getElementById('panel');
			let panelDetails = panel.querySelector('#panel-details');
			panelDetails.innerHTML = '';
			panel.classList.add('loading');

			fetchRecordDetails(record._id)
			.then(details => {

					panel.classList.remove('loading');

					displayRecordDetails(details);
				})
				.catch(error => {
					console.error('Error:', error)
					panel.classList.remove('loading');
				})

			event.stopPropagation();

			return false;
		});

		offerImgContainer.append(offerImg)
		// offerLink.append(offerImgContainer)

		offerLink.append(offerTxt)

		offerLi.append(offerLink)

		offersElt.append(offerLi)
	}
};
