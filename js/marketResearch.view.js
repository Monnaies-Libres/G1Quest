import { categoriesNames } from './categoriesNames.js'


export const displayCategories = function (categories, radius) {
        console.log('categoriesNames :', categoriesNames);
    const list = document.querySelector(`#marketResearch .list.radius-${radius}-km .categories`);
    list.innerHTML = '';  // Clear the list

    // Sort categories by number of ads
    categories.sort((a, b) => b.ads_details.count_ads.value - a.ads_details.count_ads.value);

    for (const category of categories) {
        const li = document.createElement('li');
        li.textContent = categoriesNames[category.key].name + `: ${category.ads_details.count_ads.value} annonces`;
        li.dataset.category = category.key;  // Store the category id in a data attribute
        list.appendChild(li);
    }
};

/*
// La fonction pour afficher les catégories
function displayCategories (categories, radius) {
    const list = document.getElementById('categories-list');
    list.innerHTML = '';
    // Convertir l'objet categories en un tableau de paires [clé, valeur]
    const entries = Object.entries(categories);

    // Trier le tableau par nombre d'annonces (en ordre décroissant)
    entries.sort((a, b) => b[1].length - a[1].length);

    for (const [category, records] of entries) {
        const li = document.createElement('li');
        li.textContent = records.length + ' ' + category;
        li.addEventListener('click', () => displayAds(records));
        list.appendChild(li);
    }

    // Afficher la liste des catégories et cacher la liste des annonces
    list.style.display = 'block';
    document.getElementById('ads-list').style.display = 'none';
}
*/

export const displayNeeds = function (needs, radius) {
    const list = document.querySelector(`#marketResearch .list.radius-${radius}-km .ads`);
    list.innerHTML = '';  // Clear the list

    for (const need of needs) {
        const li = document.createElement('li');
        li.textContent  = `${need._source.title}`;

        if (need._source.price != null) {

            li.textContent += `: ${need._source.price}`;

            if (need._source.unit == 'UD') {

                li.textContent += 'DU';

            } else {

                li.textContent += 'Ğ1';
            }
        }

        list.appendChild(li);
    }
};

// La fonction pour afficher les annonces
function displayAds (records) {
    const categoriesList = document.getElementById('categories-list');
    const adsList = document.getElementById('ads-list');
    const backButton = document.createElement('button');

    backButton.textContent = 'Retour';
    backButton.addEventListener('click', () => {
        adsList.innerHTML = '';
        categoriesList.style.display = 'block';
        backButton.remove();
    });

    adsList.appendChild(backButton);

    for (const record of records) {
        const li = document.createElement('li');
        li.textContent = record._source.title;
        adsList.appendChild(li);
    }

    // Cacher la liste des catégories et afficher la liste des annonces
    categoriesList.style.display = 'none';
    adsList.style.display = 'block';
}
