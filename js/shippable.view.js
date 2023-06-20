export const displayShippable = function (records) {

	let offersElt = document.querySelector('#shippable .list');

	for (const record of records) {

		let offerLi = document.createElement('li')

		let offerLink = document.createElement('a')

		let offerTxt = document.createElement('span')

		let offerImgContainer = document.createElement('span')

		let offerImg = document.createElement('img')
		/*
		if (record._source.picturesCount > 0) {

			offerImg.src = 'data:' + (record._source.thumbnail._content_type) + ';base64,' + (record._source.thumbnail._content)

		} else {

			offerImg.src = 'games/space/img/default-shippable.256.png'
		}
		*/

		offerTxt.textContent = record._source.title

		offerImg.alt = record._source.title
		offerImg.title = record._source.title

		// offerLink.innerHTML = record._source.title
		offerLink.href = 'https://www.gchange.fr/#/app/market/view/' + record._id + '/'

		offerImgContainer.append(offerImg)
		// offerLink.append(offerImgContainer)

		offerLink.append(offerTxt)

		offerLi.append(offerLink)

		offersElt.append(offerLi)
	}
};
