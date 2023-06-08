let userLocation = null;

document.getElementById('detect').addEventListener('click', function () {
    this.style.display = 'none'; // hide button

    navigator.geolocation.getCurrentPosition(function (position) {

        userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };
        // Show "Loading..." after user allows to share their location
        document.getElementById('loading').style.display = 'block';
        getPages(userLocation);
    }, function (error) {
        // Show error message if the user denies to share their location
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = "Vous devez partager votre localisation pour que le sonar puisse scanner vos environs";
        console.log('Error:', error);
        // Hide the "Loading..." message
        document.getElementById('loading').style.display = 'none';
    });
});

document.getElementById('radius').addEventListener('change', function () {
    if (userLocation) {
        document.getElementById('detect').style.display = 'none';
        document.getElementById('loading').style.display = 'block';
        getPages(userLocation);
    }
});



function getPages(userLocation) {
    const radiusSelect = document.getElementById('radius');
    const radius = radiusSelect.options[radiusSelect.selectedIndex].value;

    // Form the query
    const body = {
        query: {
            bool: {
                must: {
                    match_all: {}
                },
                filter: {
                    geo_distance: {
                        distance: radius + 'km',
                        'geoPoint': {
                            lat: userLocation.lat,
                            lon: userLocation.lon
                        }
                    }
                }
            }
        },
        _source: ['geoPoint', '_id'],
        size: 1000
    };

    // Send the HTTP request
    fetch('https://data.gchange.fr/page/record/_search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(data => {
            displayPages(data.hits.hits, userLocation, radius);
        })
        .catch(error => console.error(error))
        .finally(() => {
            document.getElementById('loading').style.display = 'none';
        });
}




function displayPageDetails(pageId) {
    // Get the panel element
    const panel = document.getElementById('pageDetails');

    // Show the loading icon
    let loadingIcon_elt = document.getElementById('loading-icon');
    loadingIcon_elt.style.display = 'block';

    // Clear any existing content in the panel
    panel.innerHTML = '';

    // Send a GET request to the Elastic Search endpoint /page/record/{id}
    fetch(`https://data.gchange.fr/page/record/${pageId}`)
        .then(response => response.json())
        .then(data => {
            // Hide the loading icon
            loadingIcon_elt.style.display = 'none';

            // Create elements for the page details
            const title = document.createElement('h2');
            title.textContent = data._source.title;


            let image = null;

            if (   typeof data._source.pictures !== 'undefined'
                && typeof data._source.pictures[0] !== 'undefined'
                && typeof data._source.pictures[0].file !== 'undefined') {

                image = document.createElement('img');
                image.src = 'data:' + data._source.pictures[0].file._content_type + ';base64, ' + data._source.pictures[0].file._content;
            }

            const description = document.createElement('p');
            description.textContent = data._source.description;

            const address = document.createElement('p');
            address.textContent = data._source.address;

            // Append the elements to the panel
            panel.appendChild(title);

            if (typeof image !== 'undefined'
                &&     image !== null) {

                panel.appendChild(image);
            }

            panel.appendChild(description);
            panel.appendChild(address);
        })
        .catch(error => {
            // If there's an error, also hide the loading icon
            loadingIcon_elt.style.display = 'none';

            console.error('Error:', error)
        });
}

function displayPages(pages, userLocation, radius) {
    const sonar = document.getElementById('sonar');
    sonar.innerHTML = '';  // Clear the sonar for new display

    pages.forEach(page => {
        // Create a dot for each page
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.id = page._id;

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
        sonar.appendChild(dot);
    });
}


/*
document.getElementById('sonar').addEventListener('click', function (e) {
    if (e.target.classList.contains('dot')) {
        displayPageDetails(e.target.dataset.id);
    }
});
*/


/*
function calculateRelativePosition(userLocation, pageLocation, radius) {
    const x = (pageLocation.lat - userLocation.lat) * (Math.PI / 180);
    const y = (pageLocation.lon - userLocation.lon) * (Math.PI / 180) * Math.cos((userLocation.lat + pageLocation.lat) / 2 * (Math.PI / 180));
    const distance = Math.sqrt(x * x + y * y) * 6371;
    return {
        x: (x * distance / radius) * 100,
        y: (y * distance / radius) * 100
    };
}

*/

function calculateRelativePosition(userLocation, pageLocation, radius) {
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
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
