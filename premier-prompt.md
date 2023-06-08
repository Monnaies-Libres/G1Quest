You are going to help me develop an app that looks a bit like Gchange, which code is here:
https://github.com/duniter-gchange/gchange-client

We will start by writing the app using only HTML, CSS and vanilla javascript.

The goal of the app is to display pages from Gchange on a display that looks like sonars used in submarines. Each page is represented as a dot. The center of the sonar is the user's location. The dot representing a page is position according to the position in real life of the page relatively to the user's position. The pages can be queried using a REST API. The node url for the REST API is:
https://data.gchange.fr
You are going to make Elastic Search queries to this API. The API documentation is here:
https://github.com/duniter-gchange/gchange-pod/blob/master/src/site/markdown/REST_API.md

The REST API endpoint for searching pages is /page/record/_search

You will use CSS properties to make the dots illuminate when the sonar rays passes on them. You can get inspiration from the CSS and Javascript files located here:
https://git.p2p.legal/La_Bureautique/zeg1jeux/src/branch/main/themes

When the app starts, the user first has to select a radius, among the following options: 15km, 50km, 150km, 500km. Then the user clicks on a button with the label "Lancer la détection". When this button is clicked, the browser asks the user to share their location with our app. Then the app queries the Elastic Search node to get the pages. When querying the pages, we want to minimize network usage, so we don't to query the pictures fields. Query only relevant fields (latitude, longitude and _id). We are going to need the _id field later, because I want you to make the dots on the sonar clickable. When the dots are clicked, a side pannel is opened. The side panel displays the detailed informations of the page (title, picture, description, address if present).

The radar display has to be of height 90vh and centered vertically.

When the pages are being queried, you have to display a loading icon at the center of the sonar display.

Make sure the user is being asked to share their location only once ; we don't need to ask each time the user clicks on the button.
