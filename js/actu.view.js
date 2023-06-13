import { getBlinkDuration, calculateDotOpacity, calculateRelativePosition, switchPage } from './helpers.js'
import { displayRecordDetails, displayPageDetails } from './details.view.js'

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

        // Create a dot for each record
        const dot = document.createElement('li');

        dot.classList.add('dot');
        dot.classList.add('fa');
        dot.classList.add('record');
        dot.classList.add(recordType);
        dot.classList.add(recordCategory);

        dot.id = record._id;

        const blinkDuration = getBlinkDuration(
            record._source.time,
            minTimestamp,
            Math.floor(Date.now()/1000)
        );

        dot.style.animation = `blink-${recordType} ${blinkDuration}s infinite`;

        // Add event listener for when the dot is clicked
        dot.addEventListener('click', (event) => {

            event.currentTarget.parentElement.classList.add('paused');

            // Remove 'selected' class from any dot that might have it
            const selectedDot = document.querySelector('.dot.selected');
            if (selectedDot) {
                selectedDot.classList.remove('selected');
            }

            dot.classList.add('selected');
            dot.classList.add('visited');

            displayRecordDetails(record._id);

            event.stopPropagation();
        });

        // Position the dot according to the record's relative position to the user
        const recordLocation = {
            lat: record._source.geoPoint.lat,
            lon: record._source.geoPoint.lon
        };

        const {x, y} = calculateRelativePosition(userLocation, recordLocation, radius);

        dot.style.left = `calc(50% + ${x}%)`;
        dot.style.top = `calc(50% - ${y}%)`;

        let opacity = calculateDotOpacity(0.50, 1, minTime, maxTime, record._source.time)
        // dot.style.opacity = opacity.toString();

        dot.style.zIndex = currentRecordZIndex.toString();
        --currentRecordZIndex;

        newsDisplay.appendChild(dot);
    });
};
