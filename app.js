const API_KEY = "18cd1be5cf232951049c682b310b81f0";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");
const forecastDisplay = document.getElementById("forecastDisplay");
const locationBtn = document.getElementById("locationBtn");
const recentCities = document.getElementById("recentCities");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city); // fetch weather data
    addRecentCity(city); // add city to recent list
    cityInput.value = ""; // clear input field
  }
});

// when "Use My Location" button is clicked
locationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => showError("Location access denied.")
  );
});

// when a city is selected from the dropdown
recentCities.addEventListener("change", () => {
  const city = recentCities.value;
  if (city) fetchWeather(city);
});

// fetch current weather and 5-day forecast
function fetchWeather(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  Promise.all([
    fetch(weatherUrl).then((res) => res.json()),
    fetch(forecastUrl).then((res) => res.json()),
  ])
    .then(([weatherData, forecastData]) => {
      if (weatherData.cod !== 200 || forecastData.cod !== "200") {
        showError("City not found!");
        return;
      }
      renderCurrentWeather(weatherData);
      renderForecast(forecastData.list);
    })
    .catch(() => showError("Error fetching weather data."));
}

// fetch current weather and forecast by coordinates (for my location button)
function fetchWeatherByCoords(lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  Promise.all([
    fetch(weatherUrl).then((res) => res.json()),
    fetch(forecastUrl).then((res) => res.json()),
  ])
    .then(([weatherData, forecastData]) => {
      renderCurrentWeather(weatherData);
      renderForecast(forecastData.list);
    })
    .catch(() => showError("Error fetching location weather."));
}

// display the current weather section
function renderCurrentWeather(data) {
  const { name, weather, main, wind } = data;
  const now = new Date();
  const day = now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  weatherDisplay.innerHTML = `
    <div class="w-full bg-green-200/70 text-green-900 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center gap-6 text-base">
      <div class="text-center sm:text-left space-y-2">
        <h2 class="text-2xl font-bold">${name}</h2>
        <p class="text-sm">${day}</p>
        <p class="capitalize text-sm font-medium">${weather[0].description}</p>
      </div>
      <div class="flex flex-col items-center">
        <img src="https://openweathermap.org/img/wn/${
          weather[0].icon
        }@2x.png" class="w-20 h-20" />
        <p class="text-3xl font-extrabold">${Math.floor(main.temp)}°C</p>
        <p class="text-sm">Feels like: ${Math.floor(main.feels_like)}°C</p>
      </div>
      <div class="text-center sm:text-right space-y-2 text-sm">
        <p>💧 Humidity: ${main.humidity}%</p>
        <p>💨 Wind: ${wind.speed} km/h</p>
      </div>
    </div>
  `;
}

// display the 5-day forecast
function renderForecast(forecastList) {
  // filter to get one forecast per day
  const daily = forecastList
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  // create forecast card for each day
  forecastDisplay.innerHTML = `
    <div class="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
      ${daily
        .map((item) => {
          const date = new Date(item.dt * 1000);
          const day = date.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          });

          return `
          <div class="bg-green-100 hover:bg-green-200 text-green-900 rounded-xl shadow p-4 flex flex-col items-center space-y-2 transition-all text-sm">
            <p class="font-medium">${day}</p>
            <img src="https://openweathermap.org/img/wn/${
              item.weather[0].icon
            }@2x.png" class="w-14 h-14" />
            <p class="text-xl font-bold">${Math.floor(item.main.temp)}°C</p>
            <p class="capitalize text-sm">${item.weather[0].description}</p>
            <p class="text-xs">💧 ${item.main.humidity}%</p>
            <p class="text-xs">💨 ${item.wind.speed} km/h</p>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

const errorMessage = document.getElementById("errorMessage");

// show error message in UI
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");

  // auto-hide after 5 seconds
  setTimeout(() => {
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";
  }, 5000);
}

// save recent searched cities to local storage
function addRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  cities = [city, ...cities.filter((c) => c !== city)].slice(0, 5); // keep only 5 unique recent cities
  localStorage.setItem("recentCities", JSON.stringify(cities));
  loadRecentCities();
}

// load recent cities into the dropdown
function loadRecentCities() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  // show or hide the dropdown
  if (cities.length) {
    recentCities.classList.remove("hidden");
  } else {
    recentCities.classList.add("hidden");
  }

  // fill the dropdown options
  recentCities.innerHTML = `<option disabled selected>Recent Cities</option>`;
  cities.forEach((city) => {
    recentCities.innerHTML += `<option value="${city}">${city}</option>`;
  });
}

// load cities from localStorage when the page load
loadRecentCities();







