const DU_2023_03 = 10.68;

export const crowdfundings = {
	"8ixG4xrHedh7wgpC2RLEyg7HzMWGPnC1FwFpLsb65XfF":
	{
		title: "Bouton pour fermer une annonce"
		,description: "Dans chaque annonce chargée dans le panneau latéral, un bouton sera affiché pour fermer une annonce qui ne vous intéresse pas."
		,conditions: [
			{
				type: 'nb'
				,nb: 40
				,minAmountPerDonor: 1 * DU_2023_03
			}
			,{
				type: 'sum'
				,amount: 70 * DU_2023_03
			}
		]
	}
};
