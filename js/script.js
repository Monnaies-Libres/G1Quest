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
import { fetchEvents } from './events.model.js'
import { displayEvents } from './events.view.js'
import { fetchLuxuries } from './luxuries.model.js'
import { displayLuxuries } from './luxuries.view.js'
import { fetchExchange } from './exchange.model.js'
import { displayExchange } from './exchange.view.js'
import { crowdfundings } from '../data/crowdfunding.js'
import { displayCrowdfundings } from './crowdfunding.view.js'
import { fetchDonations } from './crowdfunding.model.js'

const timestampBackThen_3_months = Math.floor((Date.now() - (     90 * 24 * 60 * 60 * 1000)) / 1000);
const timestampBackThen_2_years  = Math.floor((Date.now() - (2 * 365 * 24 * 60 * 60 * 1000)) / 1000);
const timestampBackThen_1_year   = Math.floor((Date.now() - (1 * 365 * 24 * 60 * 60 * 1000)) / 1000);

let userLocation = null;
// userLocation = {lat: 47.5, lon:-2.5}; // test values ; Theix
// userLocation = {lat: 43.5, lon:1.5}; // test values ; Toulouse
let radius = 150;
let currentScreen = 'crowdfunding';
const screensWithRadiusPagination = ['actu', 'dormant', 'marketResearch', 'events', 'luxuries'];

let radiusSelect = document.getElementById('radius');

let isLoadedContents = {
	 actu: {
		 km15:  false
		,km50:  false
		,km150: false
		,km500: false
	}
	,dormant: {
		 km15:  false
		,km50:  false
		,km150: false
		,km500: false
	}
	,marketResearch: {
		 km15:  false
		,km50:  false
		,km150: false
		,km500: false
	}
	,events: {
		 km15:  false
		,km50:  false
		,km150: false
		,km500: false
	}
	,luxuries: {
		 km15:  false
		,km50:  false
		,km150: false
		,km500: false
	}
	,shippable:  false
	,immaterial: false
	,crowdfunding: false
}

/*                      ---------------------------------
 *                       When the radar is clicked :
 *                      ---------------------------------
 *                       1. pause animation
 *                       2. unselect dot
 *                      ---------------------------------
 *                                     |
 *                                     |
 *                                     |
 *                                     V
 */
for (let list of document.querySelectorAll(':is(#actu, #dormant, #events) > .list')) {

	list.addEventListener('click', function (event) {

		console.log('event.target\n', event.target);

		if (event.target.classList.contains('list')) {

			event.target.classList.remove('has-ad-selected');

			const selectedDot = document.querySelector('.ad.selected');
			if (selectedDot) {
				selectedDot.classList.remove('selected');
			}
		}
	});
}

function proceedWithLocation (radius) {

	const buttonContainerElt = document.querySelector('.screen#'+currentScreen+' > .buttonContainer');

	// Show "Loading..."
	buttonContainerElt.style.display = 'block';
	document.querySelector('.screen#'+currentScreen).classList.add('loading');

	if (!isLoadedContents[currentScreen]['km'+ radius.toString()]) {

		switch (currentScreen) {
			case 'actu':
				getActu(userLocation, radius, timestampBackThen_3_months)
					.then(records => {

						document.querySelector('.screen#'+currentScreen).classList.remove('loading');

						displayActu(records, userLocation, radius, timestampBackThen_3_months);

						buttonContainerElt.style.display = 'none';

						isLoadedContents[currentScreen]['km'+ radius.toString()] = true;
					});
					break;
			case 'dormant':
				getDormant(userLocation, radius)
					.then(records => {

						document.querySelector('.screen#'+currentScreen).classList.remove('loading');

						displayDormant(records, userLocation, radius);

						buttonContainerElt.style.display = 'none';

						isLoadedContents[currentScreen]['km'+ radius.toString()] = true;
					});
				break;
			case 'marketResearch':
				getNeedsCategories(userLocation, radius)
					.then(categories => {

						document.querySelector('.screen#'+currentScreen).classList.remove('loading');

						displayCategories(categories, radius);

						buttonContainerElt.style.display = 'none';

						isLoadedContents[currentScreen]['km'+ radius.toString()] = true;
					});
					break;
			case 'events':
				fetchEvents(userLocation, radius, timestampBackThen_3_months)
				.then(records => {

					document.querySelector('.screen#'+currentScreen).classList.remove('loading');

					displayEvents(records, userLocation, radius, timestampBackThen_3_months);

					buttonContainerElt.style.display = 'none';

					isLoadedContents[currentScreen]['km'+ radius.toString()] = true;
				});
				break;
			case 'luxuries':
				fetchLuxuries(userLocation, radius, timestampBackThen_2_years, 30)
				.then(records => {

					console.log("luxuries records :\n", records);

					document.querySelector('.screen#'+currentScreen).classList.remove('loading');

					displayLuxuries(records, userLocation, radius, timestampBackThen_2_years);

					buttonContainerElt.style.display = 'none';

					isLoadedContents[currentScreen]['km'+ radius.toString()] = true;
				});
				break;
		}
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
			document.querySelector('.screen#'+currentScreen).classList.add('loading');
		}, {
			enableHighAccuracy: false,
			timeout: 15000,
			maximumAge: 0
		});
	}
}


/*                      ---------------------------------
 *                       When "detect" button is clicked
 *                      ---------------------------------
 *                                     |
 *                                     |
 *                                     |
 *                                     V
 */

for (let button of document.getElementsByClassName('detect')) {

	button.addEventListener('click', function (buttonEvent) {

		detect(radius);
	});
}

/*                      ---------------------------------
 *                           When radius is changed…
 *                      ---------------------------------
 *                                     |
 *                                     |
 *                                     |
 *                                     V
 */
document.getElementById('radius').addEventListener('change', function () {

	radius = radiusSelect.options[radiusSelect.selectedIndex].value;

	switchPage(currentScreen, radius);

	if (!isLoadedContents[currentScreen]['km'+ radius.toString()]) {

		detect(radius);
	}
});

function switchScreen (newScreenId) {

	// Store the current screen id for use in other parts of the app
	currentScreen = newScreenId;

	// Store active screen in <body />
	// Used in CSS, typically to choose when to display the radius selector
	document.querySelector('body').dataset.activeScreen = newScreenId;

	// Handling menu item
	const activeScreenMenuItem = document.querySelector('#menu > ul > li > a.active');
	if (activeScreenMenuItem !== null) {
		activeScreenMenuItem.classList.remove('active');
	}
	document.querySelector('#menu > ul > li > a[href="#'+newScreenId+'"]').classList.add('active');

	// Change which screen is active
	const lastActiveScreen = document.querySelector('.screen.last-active-screen');
	if (lastActiveScreen !== null) {
		lastActiveScreen.classList.remove('last-active-screen');
	}
	const activeScreen = document.querySelector('.screen.active');
	if (activeScreen !== null) {
		activeScreen.classList.remove('active');
		activeScreen.classList.add('last-active-screen');
	}
	document.querySelector('.screen#'+newScreenId).classList.add('active');

	//
	if (screensWithRadiusPagination.includes(newScreenId)) {

		switchPage(newScreenId, radius);

	} else if (!isLoadedContents[newScreenId]) {

		switch (newScreenId) {
			case 'crowdfunding':
				(async () => {

					let donations = {};
					let totalAmounts = {};

					for (const pubkey in crowdfundings) {
						const result = await fetchDonations(pubkey);
						console.log('result: \n', result);
						donations[pubkey] = result.donations;
						totalAmounts[pubkey] = result.totalAmount;
					}
					displayCrowdfundings(crowdfundings, donations, totalAmounts);

					isLoadedContents[newScreenId] = true;
				})();
				break;
			case 'shippable':

				fetchShippable(timestampBackThen_3_months, 30)
				.then(records => {

					document.querySelector('.screen#'+newScreenId).classList.remove('loading');

					displayShippable(records);

					isLoadedContents[newScreenId] = true;
				})
				.catch(error => {
					if (error == 'Error: 400')
						console.error('Mauvaise requête')
					else
						console.error(error)
				})
				break;
			case 'immaterial':

				fetchImmaterial(timestampBackThen_1_year, 30)
				.then(records => {

					document.querySelector('.screen#'+newScreenId).classList.remove('loading');

					displayImmaterial(records);

					isLoadedContents[newScreenId] = true;
				})
				.catch(error => {
					if (error == 'Error: 400')
						console.error('Mauvaise requête')
					else
						console.error(error)
				})
				break;
			case 'exchange':

				fetchExchange(timestampBackThen_2_years, 60)
				.then(records => {

					console.log("exchange records :\n", records);

					document.querySelector('.screen#'+newScreenId).classList.remove('loading');

					displayExchange(records);

					isLoadedContents[newScreenId] = true;
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
}

window.addEventListener('DOMContentLoaded', (event) => {

	document.querySelector('body').classList.remove('starting');

	// Menu : changement d'écran
	const menuLinks = document.querySelectorAll('#menu a');
	menuLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();  // Prevent the default action (navigating to the link)

			// Get the screen name from the href attribute, excluding the "#"
			const screen = link.getAttribute('href').substring(1);
			switchScreen(screen);
		});
	});

	// Étude de marché : lorsqu'une catégorie est cliquée…
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
