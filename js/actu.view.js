import { getBlinkDuration, calculateDotOpacity, calculateRelativePosition, switchPage, toRadians } from './helpers.js'
import { fetchRecordDetails } from './details.model.js'
import { displayRecordDetails, preparePanel, finishPanel } from './details.view.js'

const getDirection = (x, y) => {

	let angle = Math.atan2(y, x);
	let dir = null;
	console.log(angle)

	if ((angle > (-1 * Math.PI/8)) && angle <= (1 * Math.PI/8)) {
		dir = 'E';
	} else if ((angle > (1 * Math.PI/8)) && angle <= (3 * Math.PI/8)) {
		dir = 'NE';
	} else if ((angle > (3 * Math.PI/8)) && angle <= (5 * Math.PI/8)) {
		dir = 'N';
	} else if ((angle > (5 * Math.PI/8)) && angle <= (7 * Math.PI/8)) {
		dir = 'NW';
	} else if ((angle > (7 * Math.PI/8)) || angle <= (-7 * Math.PI/8)) {
		dir = 'W';
	} else if ((angle > (-7 * Math.PI/8)) && angle <= (-5 * Math.PI/8)) {
		dir = 'SW';
	} else if ((angle >= (-5 * Math.PI/8)) && angle <= (-3 * Math.PI/8)) {
		dir = 'S';
	} else if ((angle >= (-3 * Math.PI/8)) && angle <= (-1 * Math.PI/8)) {
		dir = 'SE';
	}

	console.log(dir);

	return dir;
}

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

			preparePanel();

			event.currentTarget.parentElement.classList.add('paused');

			// Remove 'selected' class from any ad that ad have it
			const selectedAd = document.querySelector('.ad.selected');
			if (selectedAd) {
				selectedAd.classList.remove('selected');
			}

			ad.classList.add('selected');
			ad.classList.add('visited');

			fetchRecordDetails(record._id)
			.then(details => {

				displayRecordDetails(details);

				finishPanel();
			})
			.catch(error => {
				console.error('Error:', error)

				finishPanel();
			})

			event.stopPropagation();
		});

		// Position the dot according to the record's relative position to the user
		const adLocation = {
			lat: record._source.geoPoint.lat,
			lon: record._source.geoPoint.lon
		};

		const {x, y} = calculateRelativePosition(userLocation, adLocation, radius);

		const dir = getDirection(x, y);

		ad.classList.add('dir-' + dir);

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
