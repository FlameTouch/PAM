# 🍹 Drink Master - Progressive Web App

Aplikacja Progressive Web App (PWA) do wyboru i zapisywania ulubionych drinków alkoholowych. Aplikacja działa offline, wykorzystuje natywne funkcje urządzenia i oferuje responsywny interfejs użytkownika.

## 📋 Wymagania

Aplikacja spełnia wszystkie wymagania projektu:

1. ✅ **Instalowalność** - Posiada plik `manifest.json` z metadanymi aplikacji
2. ✅ **Natywne funkcje urządzenia** - Wykorzystuje geolokalizację, Web Share API i powiadomienia push
3. ✅ **Działanie offline** - Service Worker z Cache API zapewnia działanie bez internetu
4. ✅ **3 widoki** - Lista drinków, szczegóły drinka, ulubione drinki
5. ✅ **Hosting HTTPS** - Gotowa do wdrożenia na hostingu z HTTPS
6. ✅ **Responsywność** - Dostosowuje się do różnych rozmiarów ekranu
7. ✅ **Wydajność** - Zoptymalizowana strategia buforowania
8. ✅ **Strategia buforowania** - Różne strategie dla różnych typów zasobów
9. ✅ **Jakość kodu** - Czytelny, dobrze zorganizowany kod
10. ✅ **Dokumentacja** - Ten plik README oraz komentarze w kodzie

## 🚀 Instalacja i uruchomienie

### Lokalne uruchomienie (development)

1. **Sklonuj repozytorium** lub pobierz pliki projektu

2. **Uruchom lokalny serwer HTTP** (wymagany dla Service Worker):

   **Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```

3. **Otwórz przeglądarkę** i przejdź do:
   ```
   http://localhost:8000
   ```

### Wdrożenie na produkcję

1. **Wymagania hostingu:**
   - HTTPS (wymagane dla Service Worker i PWA)
   - Obsługa plików statycznych

2. **Prześlij wszystkie pliki** na serwer:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.json`
   - `sw.js`
   - Folder `icons/` z ikonami

3. **Sprawdź konfigurację:**
   - Service Worker musi być dostępny pod ścieżką `/sw.js`
   - Manifest musi być dostępny pod ścieżką `/manifest.json`

## 📱 Instalacja jako aplikacja

### Android (Chrome)
1. Otwórz aplikację w Chrome
2. Kliknij menu (trzy kropki)
3. Wybierz "Dodaj do ekranu głównego" lub "Zainstaluj aplikację"

### iOS (Safari)
1. Otwórz aplikację w Safari
2. Kliknij przycisk "Udostępnij"
3. Wybierz "Dodaj do ekranu głównego"

### Desktop (Chrome/Edge)
1. Otwórz aplikację w przeglądarce
2. Kliknij ikonę instalacji w pasku adresu
3. Potwierdź instalację

## 🎯 Funkcjonalności

### Widoki aplikacji

1. **Lista drinków (główny widok)**
   - Wyświetla dostępne drinki
   - Wyszukiwanie po nazwie i składnikach
   - Filtrowanie po kategoriach (Wszystkie, Koktajle, Shoty, Mocktaile)
   - Wskaźnik trybu offline

2. **Szczegóły drinka**
   - Pełne informacje o drinku
   - Lista składników z miarami
   - Instrukcje przygotowania
   - Możliwość dodania do ulubionych
   - Udostępnianie drinka

3. **Ulubione drinki**
   - Lista zapisanych ulubionych drinków
   - Zarządzanie ulubionymi
   - Szybki dostęp do ulubionych przepisów

### Natywne funkcje urządzenia

1. **Web Share API** 📤
   - Udostępnianie drinków innym aplikacjom
   - Fallback do kopiowania do schowka
   - Implementacja: `navigator.share()`
   - Lokalizacja: `app.js` - funkcja `shareDrink()`

2. **Powiadomienia Push** 🔔
   - Prośba o zgodę na powiadomienia
   - Powiadomienia o nowych drinkach
   - Implementacja: `Notification API`
   - Lokalizacja: `app.js` - funkcje `initializeNotifications()` i `showNotification()`

### Tryb offline

- **Service Worker** (`sw.js`) zapewnia:
  - Buforowanie zasobów statycznych
  - Buforowanie odpowiedzi API
  - Działanie bez połączenia z internetem
  - Wskaźnik statusu online/offline

- **Strategie buforowania:**
  - **Cache First** - dla plików statycznych (HTML, CSS, JS)
  - **Network First** - dla żądań API (dynamiczne dane)
  - **Stale While Revalidate** - dla obrazów (szybki dostęp + aktualizacja w tle)

## 🛠️ Technologie

- **HTML5** - Struktura aplikacji
- **CSS3** - Stylowanie z CSS Variables, Flexbox, Grid
- **JavaScript (ES6+)** - Logika aplikacji
- **Service Worker API** - Działanie offline
- **Cache API** - Buforowanie zasobów
- **Web Share API** - Udostępnianie
- **Notification API** - Powiadomienia
- **LocalStorage API** - Przechowywanie ulubionych

## 📁 Struktura projektu

```
drink-master/
├── index.html          # Główny plik HTML
├── styles.css          # Style CSS
├── app.js              # Logika aplikacji
├── manifest.json       # Manifest PWA
├── sw.js               # Service Worker
├── icons/              # Ikony aplikacji
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── README.md           # Dokumentacja
```

### Zmiana API drinków

W pliku `app.js` zmień zmienną:
```javascript
const DRINKS_API = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';
```

### Dostosowanie kolorów

W pliku `styles.css` zmień zmienne CSS:
```css
:root {
    --primary-color: #4a5568;
    --accent-color: #ed8936;
    /* ... */
}
```

## 🐛 Rozwiązywanie problemów

### Service Worker nie działa
- Upewnij się, że aplikacja działa na HTTPS (lub localhost)
- Sprawdź konsolę przeglądarki pod kątem błędów
- Wyczyść cache przeglądarki i zarejestruj Service Worker ponownie

### Powiadomienia nie działają
- Sprawdź uprawnienia przeglądarki
- Niektóre przeglądarki wymagają interakcji użytkownika przed wyświetleniem promptu

## 🔮 Możliwe rozszerzenia

- Integracja z mapami (Google Maps) dla lokalizacji barów
- Synchronizacja ulubionych między urządzeniami
- Tryb ciemny
- Więcej filtrów (alkoholowe/bezalkoholowe, typ szkła)
- Historia przeglądanych drinków
- Generowanie listy zakupów na podstawie ulubionych drinków
- Kalkulator alkoholu w drinku

---

**Uwaga:** Aplikacja wykorzystuje zewnętrzne API (TheCocktailDB) do pobierania danych o drinkach. W trybie offline aplikacja korzysta z zbuforowanych danych lub przykładowych danych.

