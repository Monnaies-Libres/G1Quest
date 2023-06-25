import { getBlinkDuration, calculateDotOpacity, calculateRelativePosition, switchPage, toRadians } from './helpers.js'
import { fetchRecordDetails } from './details.model.js'
import { displayRecordDetails } from './details.view.js'

export const displayActu = (records, userLocation, radius, minTimestamp) => {

	switchPage('actu', radius);

	const recordsNb = records.length;

	// Find the maximum and minimum timestamp values
	let maxTime = 0, minTime = Infinity;

	if (recordsNb != 0) {

		maxTime = records.slice(0)[0]._source.time;
		minTime = records.slice(-1)[0]._source.time;
	}

	const newsDisplay = document.querySelector('#actu > .list.radius-'+radius+'-km');
	newsDisplay.innerHTML = '';

	const baseZIndex = 100;
	let currentRecordZIndex = baseZIndex + recordsNb;

	records.forEach(record => {

		const recordType = record._source.type;

		const recordCategory = record._source.category.id;;

		const ad = document.createElement('li');

		ad.classList.add('ad');
		ad.classList.add('record');
		ad.classList.add(recordType);
		ad.classList.add(recordCategory);

		const adLink = document.createElement('a');
		adLink.href = '#/record/' + record._id;

		const adTitleElt = document.createElement('span');
		adTitleElt.textContent = record._source.title;
		adTitleElt.classList.add('title');

		ad.id = record._id;

		const blinkDuration = getBlinkDuration(
			record._source.time,
			minTimestamp,
			Math.floor(Date.now()/1000)
		);

		ad.style.animation = `blink-${recordType} ${blinkDuration}s infinite`;

		// Add event listener for when the ad is clicked
		ad.addEventListener('click', (event) => {

			console.log('event.currentTarget.parentElement : ', event.currentTarget.parentElement);
			event.currentTarget.parentElement.classList.add('paused');

			// Remove 'selected' class from any ad that ad have it
			const selectedDot = document.querySelector('.ad.selected');
			if (selectedDot) {
				selectedDot.classList.remove('selected');
			}

			ad.classList.add('selected');
			ad.classList.add('visited');

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
		});

		// Position the dot according to the record's relative position to the user
		const adLocation = {
			lat: record._source.geoPoint.lat,
			lon: record._source.geoPoint.lon
		};

		const {x, y} = calculateRelativePosition(userLocation, adLocation, radius);

		ad.style.top  = (50 - y).toString() + '%';
		ad.style.left = (50 + x).toString() + '%';

		let opacity = calculateDotOpacity(0.50, 1, minTime, maxTime, record._source.time)
		// ad.style.opacity = opacity.toString();

		ad.style.zIndex = currentRecordZIndex.toString();
		--currentRecordZIndex;

		adLink.appendChild(adTitleElt);
		ad.appendChild(adLink);
		newsDisplay.appendChild(ad);
	});
};
