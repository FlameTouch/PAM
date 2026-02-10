// API Module
// Модуль для роботи з API напоїв

// Використовуємо CORS-проксі allorigins.win для обходу CORS обмежень
// Запит з frontendu йде на allorigins, який з бекенду підтягує dane z TheCocktailDB

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';

// Отримання drinków по nazwie через проксі
async function fetchDrinkByName(drinkName) {
    try {
        const targetUrl = `${API_BASE}${encodeURIComponent(drinkName)}`;
        const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.drinks || [];
    } catch (error) {
        console.error(`Помилка завантаження ${drinkName} через CORS-проксі:`, error);
        return [];
    }
}

// Завантаження списку drinków для wielu nazw (у нас popularDrinks w app.js)
async function fetchDrinksList(drinkNames) {
    const allDrinks = [];
    const uniqueIds = new Set();

    for (const drinkName of drinkNames) {
        try {
            const drinks = await fetchDrinkByName(drinkName);
            for (const drink of drinks) {
                if (!uniqueIds.has(drink.idDrink)) {
                    uniqueIds.add(drink.idDrink);
                    allDrinks.push(drink);
                }
            }
        } catch (error) {
            console.error(`Помилка завантаження ${drinkName}:`, error);
        }
    }

    return allDrinks;
}

// Експорт функцій
export {
    fetchDrinkByName,
    fetchDrinksList,
    API_BASE,
    CORS_PROXY
};
