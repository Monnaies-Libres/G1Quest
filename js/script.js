import { getActu }     from './actu.model.js'
import { displayActu } from './actu.view.js'
import { getDormant }     from './dormant.model.js'
import { displayDormant } from './dormant.view.js'
import { displayRecordDetails, displayPageDetails } from './details.view.js'
import { switchPage } from './helpers.js'

const timestampBackThen_3_months = Math.floor((Date.now() - (90 * 24 * 60 * 60 * 1000)) / 1000);

let userLocation = null;
let radius = 150;
let currentScreen = 'dormant';  // Indicates the current screen ('actu' or 'dormant')

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
}

// When the radar is clicked :
//    1. pause animation
//    2. unselect dot
for (let list of document.querySelectorAll('#actu > .list, #dormant > .list')) {

    list.addEventListener('click', function (event) {

        event.target.classList.remove('paused');

        const selectedDot = document.querySelector('.dot.selected');
        if (selectedDot) {
            selectedDot.classList.remove('selected');
        }
    });
}

function proceedWithLocation(radius) {

    switch (currentScreen) {
        case 'actu':

            if (data[currentScreen]['km'+ radius.toString()] != null) {

                switchPage(currentScreen, radius);

            } else {

                data[currentScreen]['km'+ radius.toString()] = getActu(userLocation, radius, timestampBackThen_3_months)
                    .then(records => {

                        document.querySelector('#actu .loading').style.display = 'none';

                        displayActu(records, userLocation, radius, timestampBackThen_3_months);
                    });

            }

            break;
        case 'dormant':

            if (data[currentScreen]['km'+ radius.toString()] != null) {

                switchPage(currentScreen, radius);

            } else {

                data[currentScreen]['km'+ radius.toString()] = getDormant(userLocation, radius)
                    .then(records => {

                        document.querySelector('#dormant .loading').style.display = 'none';

                        displayDormant(records, userLocation, radius);
                    });

            }
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

        // Show "Loading..." after user allows to share their location
        buttonContainerElt.querySelector('.loading').style.display = 'block';

        navigator.geolocation.getCurrentPosition(function (position) {

            userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            proceedWithLocation(radius);

        }, function (error) {

            // Show error message if the user denies to share their location
            let errorElt = buttonContainerElt.querySelector('.errorMessage');
            errorElt.style.display = 'block';
            errorElt.innerHTML = '<p>Vous devez partager votre localisation pour que le sonar puisse scanner vos environs</p><p>Message d\'erreur : '+error.message+'</p>';
            console.log('Error:', error);
            // Hide the "Loading..." message
            buttonContainerElt.querySelector('.loading').style.display = 'none';
        });
    }

    buttonContainerElt.style.display = 'none';
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

    detect(radius);
});

function switchScreen (screenId) {

    // Hide all screens
    for (let elt of document.getElementsByClassName('screen')) {

        elt.style.display = 'none';
    }

    // Store the current screen id for use in other parts of the app
    currentScreen = screenId;

    // Change which screen is active
    const activeScreen = document.querySelector('#menu > ul > li > a.active');
    if (activeScreen !== null) {
        activeScreen.classList.remove('active');
    }
    document.querySelector('#menu > ul > li > a[href="#'+screenId+'"]').classList.add('active');

    // Show the selected screen
    document.getElementById(screenId).style.display = 'block';
}

// Add screen-switching mechanism
window.addEventListener('DOMContentLoaded', (event) => {
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
});

function startApp () {

    switchScreen(currentScreen);
}

document.addEventListener('DOMContentLoaded', function (event) {

    startApp();
});
