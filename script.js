let userLocation = null;
let currentScreen = 'records';  // Indicates the current screen ('pages' or 'records')

document.getElementById('detect').addEventListener('click', function () {
    this.style.display = 'none'; // hide button

    navigator.geolocation.getCurrentPosition(function (position) {

        userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };

        // Show "Loading..." after user allows to share their location
        document.getElementById('loading').style.display = 'block';

        /*
        getPages(userLocation);
        */

        getRecords(userLocation);


    }, function (error) {
        // Show error message if the user denies to share their location
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = "Vous devez partager votre localisation pour que le sonar puisse scanner vos environs";
        console.log('Error:', error);
        // Hide the "Loading..." message
        document.getElementById('loading').style.display = 'none';
    });
});

document.getElementById('switchScreen').addEventListener('click', function () {
    const switchScreenButton = document.getElementById('switchScreen');
    if (currentScreen === 'records') {
        document.getElementById('recordsSonar').style.display = 'none';
        document.getElementById('sonar').style.display = 'block';
        switchScreenButton.textContent = 'actuel'; // Update button label
        currentScreen = 'pages';
        getPages(userLocation);
    } else {
        document.getElementById('sonar').style.display = 'none';
        document.getElementById('recordsSonar').style.display = 'block';
        switchScreenButton.textContent = 'latent'; // Update button label
        currentScreen = 'records';
        getRecords(userLocation);
    }
});

function getRecords(userLocation) {
    const radiusSelect = document.getElementById('radius');
    const radius = radiusSelect.options[radiusSelect.selectedIndex].value;

    const threeMonthsAgoTimestamp = Date.now() - 7776000;  // 3 months in seconds

    // Form the query
    const body = {
        query: {
            bool: {
                must: {
                    exists : { field : 'geoPoint' }
                },
                filter: [
                    {

                        geo_distance: {
                            distance: radius + 'km',
                            geoPoint: {
                                lat: userLocation.lat,
                                lon: userLocation.lon
                            }
                        }

                    },{

                        range: {
                            time: {
                                gte: threeMonthsAgoTimestamp
                            }
                        }

                    }
                ],

                should: [
                    {
                        bool: {
                            must: [
                                { term: { type: "offer" } },
                                { nested: {
                                    path: "category",
                                    query: {
                                        bool: { must_not: [
                                            { term: { "category.id": "cat81" } },  // Filtre anti-Annunakis ; celle-là elle est pour pour toi, FredB ;-)
                                            { term: { "category.id": "cat31" } }, // Prestation de services
                                            { term: { "category.parent": "cat31" } }
                                        ] }
                                    }
                                } }
                            ]
                        }
                    },
                    {
                        bool: {
                            must: [
                                { term: { type: "need" } },
                                { nested: {
                                    path: "category",
                                    query: {
                                        bool: { should: [
                                            { term: { "category.parent": "cat31" } },
                                            { term: { "category.id": "cat31" } },
                                            { term: { "category.parent": "cat56" } }, // Matériel professionnel
                                            { term: { "category.id": "cat56" } }
                                        ] }
                                    }
                                } }
                            ]
                        }
                    }
                ],
                minimum_should_match: 1
            }
        },

        sort : [
            { "time" : {"order" : "desc"}},
            "_score"
        ],

        _source: ['geoPoint', '_id', 'time'],

        size: 500
    };

    // Send the HTTP request
    fetch('https://data.gchange.fr/market/record/_search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Find the maximum and minimum timestamp values
        let maxTime = 0, minTime = Infinity;
        maxTime = data.hits.hits.slice(1)[0]._source.time;
        minTime = data.hits.hits.slice(-1)[0]._source.time;

        displayRecords(data.hits.hits, userLocation, radius, minTime, maxTime);
    })
    .catch(error => console.error(error))
    .finally(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function displayRecords(records, userLocation, radius, minTime, maxTime) {
    const sonar = document.getElementById('recordsSonar');
    sonar.innerHTML = '';  // Clear the sonar for new display

    records.forEach(record => {
        // Create a dot for each record
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.id = record._id;

        // Add event listener for when the dot is clicked
        dot.addEventListener('click', () => {
            displayRecordDetails(record._id);
        });

        // Position the dot according to the record's relative position to the user
        const recordLocation = {
            lat: record._source.geoPoint.lat,
            lon: record._source.geoPoint.lon
        };

        const {x, y} = calculateRelativePosition(userLocation, recordLocation, radius);

        dot.style.left = `calc(50% + ${x}%)`;
        dot.style.top = `calc(50% - ${y}%)`;

        let opacity = calculateDotOpacity(0.10, 1, minTime, maxTime, record._source.time)
        dot.style.opacity = opacity.toString();

        // Add the dot to the sonar
        sonar.appendChild(dot);
    });
}

function displayRecordDetails(recordId) {
    // Get the panel element
    const panel = document.getElementById('panel-details');

    // Show the loading icon
    let loadingIcon_elt = document.getElementById('loading-icon');
    loadingIcon_elt.style.display = 'block';

    // Clear any existing content in the panel
    panel.innerHTML = '';

    // Remove 'selected' class from any dot that might have it
    const selectedDot = document.querySelector('.dot.selected');
    if (selectedDot) {
        selectedDot.classList.remove('selected');
    }

    // Add 'selected' class to the clicked dot
    const clickedDot = document.getElementById(recordId);
    if (clickedDot) {
        clickedDot.classList.add('selected');
    }

    // Send a GET request to the Elastic Search endpoint /market/record/{id}
    fetch(`https://data.gchange.fr/market/record/${recordId}`)
        .then(response => response.json())
        .then(data => {
            console.log('record data : ', data);

            // Hide the loading icon
            loadingIcon_elt.style.display = 'none';

            // Create elements for the record details
            const title = document.createElement('h2');
            title.textContent = data._source.title;

            let image = null;

            if (data._source.picturesCount > 0) {
                image = document.createElement('img');
                image.src = 'data:' + data._source.pictures[0].file._content_type + ';base64, ' + data._source.pictures[0].file._content;
            }

            const description = document.createElement('p');
            description.textContent = data._source.description;

            const gchangeLink       = document.createElement('a');
            gchangeLink.href = 'https://www.gchange.fr/#/app/market/view/' + data._id + '/';
            gchangeLink.textContent = 'Voir sur Gchange'
            const gchangeLink_outer = document.createElement('p');
            gchangeLink_outer.appendChild(gchangeLink);

            const address = document.createElement('p');
            address.textContent = data._source.address;

            // Append the elements to the panel
            panel.appendChild(title);
            panel.appendChild(gchangeLink_outer);

            if (image !== null) {
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

document.getElementById('radius').addEventListener('change', function () {
    if (userLocation) {
        document.getElementById('detect').style.display = 'none';
        document.getElementById('loading').style.display = 'block';

        switch (currentScreen) {

            case 'pages':
                getPages(userLocation);
                break;
            case 'records':
                getRecords(userLocation);
                break;
        }
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

        sort : [
            { "time" : {"order" : "desc"}},
            "_score"
        ],

        _source: ['geoPoint', '_id', 'time'],

        size: 50
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
        // Find the maximum and minimum timestamp values
        let maxTime = 0, minTime = Infinity;
        maxTime = data.hits.hits.slice(1)[0]._source.time;
        minTime = data.hits.hits.slice(-1)[0]._source.time;

        displayPages(data.hits.hits, userLocation, radius, minTime, maxTime);
    })
    .catch(error => console.error(error))
    .finally(() => {
        document.getElementById('loading').style.display = 'none';
    });
}




function displayPageDetails(pageId) {
    // Get the panel element
    const panel = document.getElementById('panel-details');

    // Show the loading icon
    let loadingIcon_elt = document.getElementById('loading-icon');
    loadingIcon_elt.style.display = 'block';

    // Clear any existing content in the panel
    panel.innerHTML = '';

    // Remove 'selected' class from any dot that might have it
    const selectedDot = document.querySelector('.dot.selected');
    if (selectedDot) {
        selectedDot.classList.remove('selected');
    }

    // Add 'selected' class to the clicked dot
    const clickedDot = document.getElementById(pageId);
    if (clickedDot) {
        clickedDot.classList.add('selected');
    }

    // Send a GET request to the Elastic Search endpoint /page/record/{id}
    fetch(`https://data.gchange.fr/page/record/${pageId}`)
        .then(response => response.json())
        .then(data => {
            console.log('page data : ', data);

            // Hide the loading icon
            loadingIcon_elt.style.display = 'none';

            // Create elements for the page details
            const title = document.createElement('h2');
            title.textContent = data._source.title;


            let image = null;

            if (   typeof data._source.picturesCount !== 'undefined'
                && data._source.picturesCount > 0) {

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

function calculateDotOpacity(minOpacity, maxOpacity, minTime, maxTime, dotTime) {

    let relativeTime = (dotTime - minTime) / (maxTime - minTime);
    let opacity = minOpacity + (relativeTime * (maxOpacity - minOpacity));

    return opacity;
}

function displayPages(pages, userLocation, radius, minTime, maxTime) {

    const sonar = document.getElementById('sonar');
    sonar.innerHTML = '';  // Clear the sonar for new display

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
