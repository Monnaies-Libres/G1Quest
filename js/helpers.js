export const toRadians = function (degrees) {
	return degrees * (Math.PI / 180);
}

export const switchPage = function (currentScreen, radius) {

	const pages = document.querySelectorAll('.screen#'+currentScreen+' > .list');

	for (const page of pages) {

		if (page.classList.contains('active')) {

			page.classList.remove('active');
		}
	}

	const newPage = document.querySelector('.screen#'+currentScreen+' > .list.radius-'+radius+'-km');
	newPage.classList.add('active');
}

export const getBlinkDuration = (timestamp, minTime, maxTime) => {
	const maxDuration = 10; // blink duration for oldest record
	const minDuration = 0.3; // blink duration for most recent record

	// The ratio of how far the timestamp is in the range from minTime to maxTime
	let ratio = (timestamp - minTime) / (maxTime - minTime);

	// Calculate the blink duration by interpolating between minDuration and maxDuration
	let blinkDuration = minDuration + ((1 - ratio) * (maxDuration - minDuration));

	return blinkDuration;
};

export const calculateDotOpacity = (minOpacity, maxOpacity, minTime, maxTime, dotTime) => {

	let relativeTime = (dotTime - minTime) / (maxTime - minTime);
	let opacity = minOpacity + (relativeTime * (maxOpacity - minOpacity));

	return opacity;
};

export const getDirection = (x, y) => {

	let angle = Math.atan2(y, x);
	let dir = null;
	// console.log(angle)

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

	// console.log(dir);

	return dir;
}

export const calculateRelativePosition = (userLocation, adLocation, radius) => {
	// The number of km per degree of latitude is approximately constant
	const kmPerDegreeLat = 111;

	// The number of km per degree of longitude varies, but we'll take the value at the user's latitude
	const kmPerDegreeLon = 111 * Math.cos(toRadians(userLocation.lat));

	const deltaX = (adLocation.lon - userLocation.lon) * kmPerDegreeLon;
	const deltaY = (adLocation.lat - userLocation.lat) * kmPerDegreeLat;

	// We'll position the dot within a circle of radius 50% in the sonar div
	// So, we need to calculate the relative position of the dot in that circle
	const x = (deltaX / radius) * 50;
	const y = (deltaY / radius) * 50;

	return {x, y};
};
