// Views Module
// Модуль для роботи з відображенням UI

import { getState, setCurrentDrink, setCurrentView, toggleFavorite } from './state.js';
import { vibrateOnFavorite } from './native-features.js';

// Перемикання між видами
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    setCurrentView(viewId);
}

// Відображення списку напоїв
function renderDrinks(drinks) {
    const appState = getState();
    const drinksListEl = document.getElementById('drinks-list');
    const emptyStateEl = document.getElementById('empty-state');

    if (drinks.length === 0) {
        drinksListEl.innerHTML = '';
        emptyStateEl.classList.remove('hidden');
        return;
    }

    emptyStateEl.classList.add('hidden');
    drinksListEl.innerHTML = drinks.map(drink => {
        const isFavorite = appState.favorites.includes(drink.idDrink);
        return createDrinkCard(drink, isFavorite);
    }).join('');
    
    // Додавання обробників подій для карток
    drinksListEl.querySelectorAll('.drink-card').forEach(card => {
        card.addEventListener('click', () => {
            const drinkId = card.dataset.drinkId;
            showDrinkDetail(drinkId);
        });
    });

    // Додавання обробників для кнопок улюблених
    drinksListEl.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const drinkId = btn.dataset.drinkId;
            toggleFavorite(drinkId);
            vibrateOnFavorite();
            renderDrinks(drinks);
        });
    });
}

// Створення картки напою
function createDrinkCard(drink, isFavorite = false) {
    const emoji = getDrinkEmoji(drink.strCategory);
    
    return `
        <div class="drink-card" data-drink-id="${drink.idDrink}">
            <div class="drink-image">
                ${drink.strDrinkThumb ? 
                    `<img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" onerror="this.parentElement.innerHTML='${emoji}'">` : 
                    emoji
                }
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                        data-drink-id="${drink.idDrink}" 
                        aria-label="Add to favorites">
                    ${isFavorite ? '⭐' : '☆'}
                </button>
            </div>
            <div class="drink-content">
                <h3 class="drink-name">${drink.strDrink}</h3>
            </div>
        </div>
    `;
}

// Отримання емодзі для категорії
function getDrinkEmoji(category) {
    const emojiMap = {
        'Cocktail': '🍹',
        'Shot': '🥃',
        'Ordinary Drink': '🍸',
        'Punch / Party Drink': '🍻',
        'Beer': '🍺',
        'Soft Drink': '🥤'
    };
    return emojiMap[category] || '🍹';
}

// Відображення деталей напою
function showDrinkDetail(drinkId) {
    const appState = getState();
    const drink = appState.drinks.find(d => d.idDrink === drinkId);
    if (!drink) return;

    setCurrentDrink(drink);
    const detailView = document.getElementById('detail-view');
    const drinkDetailEl = document.getElementById('drink-detail');

    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient) {
            ingredients.push({ ingredient, measure: measure || '' });
        }
    }

    const isFavorite = appState.favorites.includes(drink.idDrink);
    const emoji = getDrinkEmoji(drink.strCategory);

    drinkDetailEl.innerHTML = `
        <div class="detail-header">
            <div class="detail-image">
                ${drink.strDrinkThumb ? 
                    `<img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="detail-image" onerror="this.parentElement.innerHTML='${emoji}'">` : 
                    emoji
                }
            </div>
            <h2 class="detail-name">${drink.strDrink}</h2>
            <p class="detail-category">${drink.strCategory || 'Cocktail'}</p>
        </div>

        <div class="detail-section">
            <h3>Ingredients</h3>
            <ul class="ingredients-list">
                ${ingredients.map(ing => `
                    <li>${ing.measure ? `<strong>${ing.measure}</strong> ` : ''}${ing.ingredient}</li>
                `).join('')}
            </ul>
        </div>

        <div class="detail-section">
            <h3>Instructions</h3>
            <p class="instructions">${drink.strInstructions || 'No instructions available'}</p>
        </div>

        <div class="detail-actions">
            <button class="btn-primary favorite-detail-btn ${isFavorite ? 'active' : ''}" 
                    data-drink-id="${drink.idDrink}">
                ${isFavorite ? '⭐ Remove from favorites' : '☆ Add to favorites'}
            </button>
        </div>
    `;

    const favoriteBtn = drinkDetailEl.querySelector('.favorite-detail-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
            toggleFavorite(drink.idDrink);
            vibrateOnFavorite();
            showDrinkDetail(drink.idDrink); 
        });
    }

    switchView('detail-view');
}

// Відображення улюблених
function showFavorites() {
    const appState = getState();
    const favoritesView = document.getElementById('favorites-view');
    const favoritesListEl = document.getElementById('favorites-list');
    const favoritesEmptyEl = document.getElementById('favorites-empty');

    if (appState.favorites.length === 0) {
        favoritesListEl.innerHTML = '';
        favoritesEmptyEl.classList.remove('hidden');
    } else {
        favoritesEmptyEl.classList.add('hidden');
        const favoriteDrinks = appState.drinks.filter(d => 
            appState.favorites.includes(d.idDrink)
        );
        favoritesListEl.innerHTML = favoriteDrinks.map(drink => {
            const isFavorite = appState.favorites.includes(drink.idDrink);
            return createDrinkCard(drink, isFavorite);
        }).join('');
        
        favoritesListEl.querySelectorAll('.drink-card').forEach(card => {
            card.addEventListener('click', () => {
                const drinkId = card.dataset.drinkId;
                showDrinkDetail(drinkId);
            });
        });

        favoritesListEl.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const drinkId = btn.dataset.drinkId;
                toggleFavorite(drinkId);
                vibrateOnFavorite();
                showFavorites(); 
            });
        });
    }

    switchView('favorites-view');
}

// Експорт
export {
    switchView,
    renderDrinks,
    createDrinkCard,
    showDrinkDetail,
    showFavorites
};
