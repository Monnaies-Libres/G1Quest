import { getBlinkDuration, calculateDotOpacity, calculateRelativePosition, getDirection, switchPage } from './helpers.js'
import { fetchRecordDetails, fetchPageDetails } from './details.model.js'
import { displayRecordDetails, displayPageDetails, preparePanel, finishPanel } from './details.view.js'

export const displayDormant = (pages, userLocation, radius) => {

	switchPage('dormant', radius);

	const pagesNb = pages.length;

	// Find the maximum and minimum timestamp values
	let maxTime = 0, minTime = Infinity;

	if (pagesNb != 0) {

		maxTime = pages.slice(0)[0]._source.time;
		minTime = pages.slice(-1)[0]._source.time;
	}

	const dormantDisplay = document.querySelector('#dormant > .list.radius-'+radius+'-km');
	dormantDisplay.innerHTML = '';

	pages.forEach(page => {

		const ad = document.createElement('li');
		ad.classList.add('ad');
		ad.classList.add('page');
		ad.id = page._id;

		ad.addEventListener('click', (event) => {

			preparePanel();

			event.currentTarget.parentElement.classList.add('has-ad-selected');

			// Remove 'selected' class from any ad that ad have it
			const selectedAd = document.querySelector('.ad.selected');
			if (selectedAd) {
				selectedAd.classList.remove('selected');
			}

			ad.classList.add('visited');
			ad.classList.add('selected');
			/*
			// Add 'selected' class to the clicked dot
			const clickedDot = document.getElementById(page._id);
			if (clickedDot) {
				clickedDot.classList.add('selected');
			}
			*/

			fetchPageDetails(page._id)
			.then(details => {

				displayPageDetails(details);

				finishPanel();
			})
			.catch(error => {
				console.error('Error:', error)

				finishPanel();
			})
		});

		// Position the dot according to the page's relative position to the user
		const pageLocation = {
			lat: page._source.geoPoint.lat,
			lon: page._source.geoPoint.lon
		};

		const {x, y} = calculateRelativePosition(userLocation, pageLocation, radius);

		const dir = getDirection(x, y);
		ad.classList.add('dir-' + dir);

		ad.style.top  = (50 - y).toString() + '%';
		ad.style.left = (50 + x).toString() + '%';

		// Map the page's timestamp to an opacity value between 0.25 and 1
		let opacity = calculateDotOpacity(0.25, 1, minTime, maxTime, page._source.time);

		// Set the dot's opacity
		ad.style.opacity = opacity.toString();

		// Add the dot to the sonar
		dormantDisplay.appendChild(ad);
	});
};
