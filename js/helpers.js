function toRadians (degrees) {
	return degrees * (Math.PI / 180);
}

export function switchPage (currentScreen, radius) {

	const pages = document.querySelectorAll('.screen#'+currentScreen+' > .list');
	for (const p of pages) {
		p.style.display = 'none';
	}

	const page = document.querySelector('.screen#'+currentScreen+' > .list.radius-'+radius+'-km');
	page.style.display = 'block';
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

export const calculateRelativePosition = (userLocation, pageLocation, radius) => {
	// The number of km per degree of latitude is approximately constant
	const kmPerDegreeLat = 111;

	// The number of km per degree of longitude varies, but we'll take the value at the user's latitude
	const kmPerDegreeLon = 111 * Math.cos(toRadians(userLocation.lat));

	const deltaX = (pageLocation.lon - userLocation.lon) * kmPerDegreeLon;
	const deltaY = (pageLocation.lat - userLocation.lat) * kmPerDegreeLat;

	// We'll position the dot within a circle of radius 50% in the sonar div
	// So, we need to calculate the relative position of the dot in that circle
	const x = (deltaX / radius) * 50;
	const y = (deltaY / radius) * 50;

	return {x, y};
};
