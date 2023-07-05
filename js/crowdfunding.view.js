import { DU } from '../data/g1.js';

export const displayCrowdfundings = (crowdfundings, donations, totalAmounts) => {

	let cfScreenElt = document.querySelector('#crowdfunding');

	for (const pubkey in crowdfundings) {

		console.log('donations : \n', donations[pubkey]);

		const cfElt = document.createElement('article');

		const titleElt = document.createElement('h2');
		titleElt.textContent = crowdfundings[pubkey].title;
		cfElt.append(titleElt);

		const descriptionElt = document.createElement('p');
		descriptionElt.classList.add('description');
		descriptionElt.textContent = crowdfundings[pubkey].description;
		cfElt.append(descriptionElt);

		const pubkeyElt = document.createElement('p');
		pubkeyElt.textContent = pubkey;

		const nbConditions = crowdfundings[pubkey].conditions.length;
		console.log('nbConditions : ', nbConditions);
		let portionReached = 0;

		for (const cond of crowdfundings[pubkey].conditions) {

			const condElt = document.createElement('p');
			condElt.classList.add('condition');

			// const progressElt = document.createElement('progress');

			if (cond.type == 'sum') {

				condElt.textContent = totalAmounts[pubkey] + ' DU / ' + (Math.round(cond.amount/DU*100)/100).toString() + ' DU';

				portionReached += Math.min(1, (totalAmounts[pubkey] / cond.amount)) / nbConditions;
				// progressElt.setAttribute('max', cond.amount);
				// progressElt.setAttribute('value', totalAmounts[pubkey]);

			} else if (cond.type == 'nb') {

				let nbDonors = Object.keys(donations[pubkey]).length;

				condElt.textContent = nbDonors + ' / ' + cond.nb.toString() + ' junistes × ' + (Math.round(cond.minAmountPerDonor/DU*100)/100).toString() + ' DU';

				portionReached += Math.min(1, (nbDonors / cond.nb)) / nbConditions;

				// progressElt.setAttribute('max', cond.nb);
				// progressElt.setAttribute('value', nbDonors);
			}

			cfElt.append(condElt);
			// cfElt.append(progressElt);
		}

		const progressElt = document.createElement('progress');
		progressElt.setAttribute('max', 1);
		progressElt.setAttribute('value', portionReached);
		cfElt.append(progressElt);
		cfElt.append(pubkeyElt);

		cfScreenElt.append(cfElt);
	}
};
