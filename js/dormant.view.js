import { getBlinkDuration, calculateDotOpacity, calculateRelativePosition, switchPage } from './helpers.js'
import { displayRecordDetails, displayPageDetails } from './details.view.js'

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

		// Create a dot for each page
		const dot = document.createElement('div');
		dot.classList.add('dot');
		dot.id = page._id;

		// Map the page's timestamp to an opacity value between 0.25 and 1
		let opacity = calculateDotOpacity(0.25, 1, minTime, maxTime, page._source.time);

		// Set the dot's opacity
		dot.style.opacity = opacity.toString();

		// Add event listener for when the dot is clicked
		dot.addEventListener('click', () => {
			displayPageDetails(page._id);
		});

		// Position the dot according to the page's relative position to the user
		const pageLocation = {
			lat: page._source.geoPoint.lat,
			lon: page._source.geoPoint.lon
		};

		const {x, y} = calculateRelativePosition(userLocation, pageLocation, radius);

		dot.style.left = `calc(50% + ${x}%)`;
		dot.style.top = `calc(50% - ${y}%)`;

		// Add the dot to the sonar
		dormantDisplay.appendChild(dot);
	});
};
