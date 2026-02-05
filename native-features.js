// Native Features Module
// Модуль для нативних функцій браузера

import { getState } from './state.js';

// 1. Web Share API - поділитися напоєм
function shareDrink() {
    const appState = getState();
    const drink = appState.currentDrink;
    if (!drink) return;

    if (navigator.share) {
        const shareData = {
            title: `Check out this drink: ${drink.strDrink}`,
            text: `Ingredients: ${getIngredientsText(drink)}`,
            url: window.location.href
        };

        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch((error) => {
                console.error('Share error:', error);
                copyToClipboard(`${drink.strDrink}\n${getIngredientsText(drink)}`);
            });
    } else {
        copyToClipboard(`${drink.strDrink}\n${getIngredientsText(drink)}`);
        alert('Copied to clipboard!');
    }
}

function getIngredientsText(drink) {
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient) {
            ingredients.push(`${measure || ''} ${ingredient}`.trim());
        }
    }
    return ingredients.join(', ');
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error('Copy error:', error);
    }
}

// 2. Notifications API
function initializeNotifications() {
    const enableBtn = document.getElementById('enable-notifications-btn');
    const dismissBtn = document.getElementById('dismiss-notifications-btn');

    if (enableBtn) {
        enableBtn.addEventListener('click', async () => {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    showNotification('Notifications enabled!', 'You will receive reminders about new drinks.');
                    scheduleNotification();
                    hideNotificationPrompt();
                }
            }
        });
    }

    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            hideNotificationPrompt();
            localStorage.setItem('notificationPromptDismissed', 'true');
        });
    }
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/icons/icon-192x192.svg',
            badge: '/icons/icon-192x192.svg'
        });
    }
}

function scheduleNotification() {
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            showNotification('🍹 Time for a drink!', 'Check out new drink recipes in the Drink Master app!');
        }
    }, 60000); 
}

function showNotificationPrompt() {
    const prompt = document.getElementById('notification-prompt');
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    if (!dismissed && Notification.permission === 'default') {
        prompt.classList.remove('hidden');
    }
}

function hideNotificationPrompt() {
    const prompt = document.getElementById('notification-prompt');
    prompt.classList.add('hidden');
}

// 3. Vibration API - вібрація при додаванні в улюблені
function vibrateOnFavorite() {
    if ('vibrate' in navigator) {
        // Коротка вібрація при додаванні в улюблені
        navigator.vibrate(50);
    }
}

// 4. Geolocation API - знайти найближчі бари
function findNearbyBars() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Відкрити Google Maps з пошуком барів
            const mapsUrl = `https://www.google.com/maps/search/bars/@${lat},${lon},15z`;
            window.open(mapsUrl, '_blank');
            
            showNotification('📍 Location found!', 'Opening nearby bars on Google Maps');
        },
        (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to get your location. Please enable location services.');
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Ініціалізація всіх нативних функцій
function initializeNativeFeatures() {
    initializeNotifications();
    
    // Додати кнопку для пошуку барів, якщо є кнопка share
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn && navigator.geolocation) {
        // Можна додати додаткову кнопку або використати існуючу
    }
}

// Експорт
export {
    shareDrink,
    initializeNativeFeatures,
    vibrateOnFavorite,
    findNearbyBars,
    showNotificationPrompt,
    hideNotificationPrompt
};
