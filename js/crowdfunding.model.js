import { crowdfundings } from '../data/crowdfunding.js'

// Liste des noeuds
const DUNITER_G1_NODES = [
	"https://duniter.pini.fr/",
	"https://g1.asycn.io/",
	"https://g1.brussels.ovh/",
	"https://g1.madeirawonders.com/",
	"https://g1.rendall.fr/",
	"https://gibraleon.g1server.net/"
];

// Mélanger la liste des noeuds
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

export const fetchDonations = async (pubkey) => {

	shuffle(DUNITER_G1_NODES); // Mélanger la liste des noeuds

	for (let node of DUNITER_G1_NODES) {
		try {
			const url = `${node}tx/history/${pubkey}`; // URL de l'API
			const response = await fetch(url);
			const data = await response.json();

			const history = data.history;
			let cfDonations = {};
			let totalAmount = 0;
			let totalDonationsWithMinAmount = 0;

			for (const tx of history.received) {

				let donationAmount = 0;

				for (const output of tx.outputs) {

					const fields = output.split(':');

					if (fields[2] == 'SIG('+ pubkey + ')') {

						donationAmount += Number(fields[0]);

						if (!(tx.issuers[0] in cfDonations)) {

							cfDonations[tx.issuers[0]] = 0;
						}

						cfDonations[tx.issuers[0]] += donationAmount;
					}
				}

				totalAmount += donationAmount;
			}

			for (const tx of history.pending) {

				let donationAmount = 0;

				for (const output of tx.outputs) {

					const fields = output.split(':');

					if (fields[2] == 'SIG('+ pubkey + ')') {

						donationAmount += Number(fields[0]);

						if (!(tx.issuers[0] in cfDonations)) {

							cfDonations[tx.issuers[0]] = 0;
						}

						cfDonations[tx.issuers[0]] += donationAmount;
					}
				}

				totalAmount += donationAmount;
			}

			totalAmount = totalAmount/100;

			return {
				totalAmount: totalAmount
				,donations: cfDonations
			};
		} catch (error) {
			console.error(`Failed to fetch data from ${node}: ${error}`);
			// Si une erreur se produit, passez simplement au noeud suivant
		}
	}

	throw new Error("Failed to fetch data from all nodes");
};

