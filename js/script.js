import { getActu }	 from './actu.model.js'
import { displayActu } from './actu.view.js'
import { getDormant }	 from './dormant.model.js'
import { displayDormant } from './dormant.view.js'
import { getNeedsCategories, getNeedsInCategory, getNeeds }	 from './marketResearch.model.js'
import { displayCategories, displayNeeds } from './marketResearch.view.js'
import { displayRecordDetails, displayPageDetails } from './details.view.js'
import { switchPage } from './helpers.js'
import { fetchImmaterial } from './immaterial.model.js'
import { fetchShippable } from './shippable.model.js'
import { displayImmaterial } from './immaterial.view.js'
import { displayShippable } from './shippable.view.js'

const timestampBackThen_3_months = Math.floor((Date.now() - (     90 * 24 * 60 * 60 * 1000)) / 1000);
const timestampBackThen_2_years  = Math.floor((Date.now() - (2 * 365 * 24 * 60 * 60 * 1000)) / 1000);
const timestampBackThen_1_year   = Math.floor((Date.now() - (1 * 365 * 24 * 60 * 60 * 1000)) / 1000);

let userLocation = null;
let radius = 150;
let currentScreen = 'shippable';

let radiusSelect = document.getElementById('radius');

let data = {
	 actu: {
		 km15:  null
		,km50:  null
		,km150: null
		,km500: null
	}
	,dormant: {
		 km15:  null
		,km50:  null
		,km150: null
		,km500: null
	}
	,marketResearch: {
		 km15:  null
		,km50:  null
		,km150: null
		,km500: null
	}
}

// When the radar is clicked :
//	1. pause animation
//	2. unselect dot
for (let list of document.querySelectorAll('#actu > .list, #dormant > .list')) {

	list.addEventListener('click', function (event) {

		event.target.classList.remove('paused');

		const selectedDot = document.querySelector('.dot.selected');
		if (selectedDot) {
			selectedDot.classList.remove('selected');
		}
	});
}

function proceedWithLocation (radius) {

	const buttonContainerElt = document.querySelector('.screen#'+currentScreen+' > .buttonContainer');

	// Show "Loading..."
	buttonContainerElt.style.display = 'block';
	buttonContainerElt.querySelector('.loading').style.display = 'block';

	switch (currentScreen) {
		case 'actu':
			data[currentScreen]['km'+ radius.toString()] = getActu(userLocation, radius, timestampBackThen_3_months)
				.then(records => {

					document.querySelector('#actu .loading').style.display = 'none';

					displayActu(records, userLocation, radius, timestampBackThen_3_months);

					buttonContainerElt.style.display = 'none';
				});

				break;
		case 'dormant':
			data[currentScreen]['km'+ radius.toString()] = getDormant(userLocation, radius)
			.then(records => {

				document.querySelector('#dormant .loading').style.display = 'none';

				displayDormant(records, userLocation, radius);

				buttonContainerElt.style.display = 'none';
			});
			break;
		case 'marketResearch':
			data[currentScreen]['km'+ radius.toString()].categories = getNeedsCategories(userLocation, radius)
				.then(categories => {

					console.log(categories);

					document.querySelector('#marketResearch .loading').style.display = 'none';

					displayCategories(categories, radius);

					buttonContainerElt.style.display = 'none';
				});
			break;
	}
}


async function detect (radius) {

	const buttonContainerElt = document.querySelector('.screen#'+currentScreen+' > .buttonContainer');

	const buttonElt = buttonContainerElt.querySelector('.detect');

	// Hide button
	buttonElt.style.display = 'none';

	if (userLocation !== null) {

		proceedWithLocation(radius);

	} else {
		let errorElt = buttonContainerElt.querySelector('.errorMessage');
		errorElt.style.display = 'block';
		errorElt.innerHTML = '<p>Donnez votre position.</p>';

		navigator.geolocation.getCurrentPosition(function (position) {

			errorElt.style.display = 'none';

			userLocation = {
				lat: position.coords.latitude,
				lon: position.coords.longitude
			};

			console.log('userLocation :', userLocation);

			proceedWithLocation(radius);

		}, function (error) {

			// Show error message if the user denies to share their location
			// let errorElt = buttonContainerElt.querySelector('.errorMessage');
			errorElt.style.display = 'block';
			errorElt.innerHTML = '<p>Vous devez partager votre localisation pour que le sonar puisse scanner vos environs</p><p>Message d\'erreur : '+error.message+'</p>';
			console.log('Error:', error);
			// Hide the "Loading..." message
			buttonContainerElt.querySelector('.loading').style.display = 'none';
		}, {
			enableHighAccuracy: false,
			timeout: 15000,
			maximumAge: 0
		});
	}
}

// When "detect" button is clicked
for (let button of document.getElementsByClassName('detect')) {

	button.addEventListener('click', function (buttonEvent) {

		detect(radius);
	});
}

// When radius is changed…
document.getElementById('radius').addEventListener('change', function () {

	radius = radiusSelect.options[radiusSelect.selectedIndex].value;

	switchPage(currentScreen, radius);

	if (data[currentScreen]['km'+ radius.toString()] == null) {

		detect(radius);
	}
});

function switchScreen (newScreenId) {

	// Hide all screens
	for (let elt of document.getElementsByClassName('screen')) {

		elt.style.display = 'none';
	}

	// Store the current screen id for use in other parts of the app
	currentScreen = newScreenId;

	// Change which screen is active
	const activeScreen = document.querySelector('#menu > ul > li > a.active');
	if (activeScreen !== null) {
		activeScreen.classList.remove('active');
	}
	document.querySelector('#menu > ul > li > a[href="#'+newScreenId+'"]').classList.add('active');

	// Show the selected screen
	document.getElementById(newScreenId).style.display = 'block';

	document.querySelector('body').dataset.activeScreen = newScreenId;

	switch (newScreenId) {
		case 'actu':
			switchPage(newScreenId, radius);
			break;
		case 'dormant':
			switchPage(newScreenId, radius)
				break;
		case 'marketResearch':
			switchPage(newScreenId, radius)
				break;
		case 'shippable':
			fetchShippable(timestampBackThen_3_months, 20)
			.then(records => {

				document.querySelector('#shippable .loading').style.display = 'none';

				displayShippable(records.hits.hits);
			})
			.catch(error => {
				if (error == 'Error: 400')
					console.error('Mauvaise requête')
					else
						console.error(error)
			})
			break;
		case 'immaterial':
			fetchImmaterial(timestampBackThen_1_year, 10)
			.then(records => {

				document.querySelector('#immaterial .loading').style.display = 'none';

				displayImmaterial(records.hits.hits);
			})
			.catch(error => {
				if (error == 'Error: 400')
					console.error('Mauvaise requête')
					else
						console.error(error)
			})
			break;
	}
}

window.addEventListener('DOMContentLoaded', (event) => {
	// Add screen-switching mechanism

	// Get all the anchor tags inside the navigation menu
	const menuLinks = document.querySelectorAll('#menu a');

	// Add an event listener to each of them
	menuLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();  // Prevent the default action (navigating to the link)

			// Get the screen name from the href attribute, excluding the "#"
			const screen = link.getAttribute('href').substring(1);
			switchScreen(screen);
		});
	});

	// Lorsqu'une catégorie est cliquée
	const categoriesLists = document.querySelectorAll('#marketResearch .list .categories');

	categoriesLists.forEach(categoriesList => {
		categoriesList.addEventListener('click', function (event) {
			if (event.target.tagName === 'LI') {
				const category = event.target.dataset.category;
				getNeedsInCategory(userLocation, radius, category)
					.then(needs => displayNeeds(needs, radius));
			}
		})
	});
});

function startApp () {

	switchScreen(currentScreen);
}

document.addEventListener('DOMContentLoaded', function (event) {

	startApp();
});
