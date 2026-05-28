// SkyPulse - Real-time Weather App Logic

// App State
let appState = {
  currentLocationName: '서울',
  currentCoords: { lat: 37.566, lon: 126.978 },
  weatherData: null,
  airQualityData: null,
  tempUnit: 'C', // 'C' or 'F'
  favorites: []
};

// WMO Weather Interpretation Codes Map
const WEATHER_CODES = {
  0: { label: '맑음', icon: 'sun', theme: 'weather-clear-day', iconNight: 'moon', themeNight: 'weather-clear-night' },
  1: { label: '대체로 맑음', icon: 'cloud-sun', theme: 'weather-clear-day', iconNight: 'cloud-moon', themeNight: 'weather-clear-night' },
  2: { label: '구름 조금', icon: 'cloud-sun', theme: 'weather-clear-day', iconNight: 'cloud-moon', themeNight: 'weather-clear-night' },
  3: { label: '흐림', icon: 'cloud', theme: 'weather-cloudy', iconNight: 'cloud', themeNight: 'weather-cloudy' },
  45: { label: '안개', icon: 'cloud-fog', theme: 'weather-foggy', iconNight: 'cloud-fog', themeNight: 'weather-foggy' },
  48: { label: '침적 안개', icon: 'cloud-fog', theme: 'weather-foggy', iconNight: 'cloud-fog', themeNight: 'weather-foggy' },
  51: { label: '가벼운 이슬비', icon: 'cloud-drizzle', theme: 'weather-rainy', iconNight: 'cloud-drizzle', themeNight: 'weather-rainy' },
  53: { label: '이슬비', icon: 'cloud-drizzle', theme: 'weather-rainy', iconNight: 'cloud-drizzle', themeNight: 'weather-rainy' },
  55: { label: '강한 이슬비', icon: 'cloud-drizzle', theme: 'weather-rainy', iconNight: 'cloud-drizzle', themeNight: 'weather-rainy' },
  56: { label: '가벼운 결빙 이슬비', icon: 'cloud-snow', theme: 'weather-snowy', iconNight: 'cloud-snow', themeNight: 'weather-snowy' },
  57: { label: '강한 결빙 이슬비', icon: 'cloud-snow', theme: 'weather-snowy', iconNight: 'cloud-snow', themeNight: 'weather-snowy' },
  61: { label: '약한 비', icon: 'cloud-rain', theme: 'weather-rainy', iconNight: 'cloud-rain', themeNight: 'weather-rainy' },
  63: { label: '보통 비', icon: 'cloud-rain', theme: 'weather-rainy', iconNight: 'cloud-rain', themeNight: 'weather-rainy' },
  65: { label: '강한 비', icon: 'cloud-rain', theme: 'weather-rainy', iconNight: 'cloud-rain', themeNight: 'weather-rainy' },
  66: { label: '가벼운 결빙 비', icon: 'cloud-snow', theme: 'weather-snowy', iconNight: 'cloud-snow', themeNight: 'weather-snowy' },
  67: { label: '강한 결빙 비', icon: 'cloud-snow', theme: 'weather-snowy', iconNight: 'cloud-snow', themeNight: 'weather-snowy' },
  71: { label: '약한 눈', icon: 'snowflake', theme: 'weather-snowy', iconNight: 'snowflake', themeNight: 'weather-snowy' },
  73: { label: '보통 눈', icon: 'snowflake', theme: 'weather-snowy', iconNight: 'snowflake', themeNight: 'weather-snowy' },
  75: { label: '강한 눈', icon: 'snowflake', theme: 'weather-snowy', iconNight: 'snowflake', themeNight: 'weather-snowy' },
  77: { label: '싸락눈', icon: 'snowflake', theme: 'weather-snowy', iconNight: 'snowflake', themeNight: 'weather-snowy' },
  80: { label: '약한 소나기', icon: 'cloud-rain', theme: 'weather-rainy', iconNight: 'cloud-rain', themeNight: 'weather-rainy' },
  81: { label: '보통 소나기', icon: 'cloud-rain', theme: 'weather-rainy', iconNight: 'cloud-rain', themeNight: 'weather-rainy' },
  82: { label: '강한 소나기', icon: 'cloud-rain', theme: 'weather-rainy', iconNight: 'cloud-rain', themeNight: 'weather-rainy' },
  85: { label: '약한 소낙눈', icon: 'snowflake', theme: 'weather-snowy', iconNight: 'snowflake', themeNight: 'weather-snowy' },
  86: { label: '강한 소낙눈', icon: 'snowflake', theme: 'weather-snowy', iconNight: 'snowflake', themeNight: 'weather-snowy' },
  95: { label: '뇌우', icon: 'cloud-lightning', theme: 'weather-stormy', iconNight: 'cloud-lightning', themeNight: 'weather-stormy' },
  96: { label: '우박을 동반한 약한 뇌우', icon: 'cloud-lightning', theme: 'weather-stormy', iconNight: 'cloud-lightning', themeNight: 'weather-stormy' },
  99: { label: '우박을 동반한 강한 뇌우', icon: 'cloud-lightning', theme: 'weather-stormy', iconNight: 'cloud-lightning', themeNight: 'weather-stormy' }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Render initial static page icons immediately
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  loadFavorites();
  initUnitToggle();
  initSearch();
  initGPS();
  initFavoriteAction();

  // Load initial location
  const lastCity = localStorage.getItem('skyPulse_lastCity');
  const lastCoords = localStorage.getItem('skyPulse_lastCoords');

  if (lastCity && lastCoords) {
    appState.currentLocationName = lastCity;
    appState.currentCoords = JSON.parse(lastCoords);
    fetchWeatherAndAQI(appState.currentCoords.lat, appState.currentCoords.lon);
  } else {
    // If no cache, try GPS, fallback to Seoul
    getCurrentLocationGPS(true);
  }

  // Update time display every minute
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 60000);
});

// Update Header local time clock
function updateTimeDisplay() {
  const timeEl = document.getElementById('current-time');
  if (!timeEl) return;
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Convert temperature Celsius <=> Fahrenheit
function convertTemp(celsius) {
  if (appState.tempUnit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

// Get Weather interpretation object
function getWeatherInfo(code, isDay) {
  const config = WEATHER_CODES[code];
  if (!config) {
    return { label: '흐림', icon: 'cloud', theme: 'weather-cloudy' };
  }

  const isNight = isDay === 0;
  return {
    label: config.label,
    icon: isNight && config.iconNight ? config.iconNight : config.icon,
    theme: isNight && config.themeNight ? config.themeNight : config.theme
  };
}

// Format date into Korean Day string
function formatDay(dateStr) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateStr);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  }

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return '내일';

  return `${days[date.getDay()]}요일`;
}

// Load Favorites from LocalStorage
function loadFavorites() {
  const saved = localStorage.getItem('skyPulse_favorites');
  if (saved) {
    appState.favorites = JSON.parse(saved);
  } else {
    // Default initial favorites
    appState.favorites = [
      { name: '서울', lat: 37.566, lon: 126.978 },
      { name: '도쿄', lat: 35.689, lon: 139.691 },
      { name: '뉴욕', lat: 40.712, lon: -74.006 },
      { name: '파리', lat: 48.856, lon: 2.352 }
    ];
    saveFavorites();
  }
  renderFavoritesList();
}

// Save Favorites to LocalStorage
function saveFavorites() {
  localStorage.setItem('skyPulse_favorites', JSON.stringify(appState.favorites));
}

// Render Favorite Cities Bar with their real-time temp (queried in background)
async function renderFavoritesList() {
  const container = document.getElementById('favorites-list');
  if (!container) return;

  if (appState.favorites.length === 0) {
    container.innerHTML = `<p class="no-favorites">즐겨찾는 도시가 없습니다. 날씨 카드에서 별을 눌러 추가해보세요!</p>`;
    return;
  }

  container.innerHTML = '';

  // Create pills first
  appState.favorites.forEach((fav, index) => {
    const pill = document.createElement('div');
    pill.className = 'favorite-pill';
    pill.dataset.index = index;
    pill.innerHTML = `
      <span class="fav-title">${fav.name}</span>
      <span class="fav-temp" id="fav-temp-${index}">--°</span>
    `;
    pill.addEventListener('click', () => {
      appState.currentLocationName = fav.name;
      appState.currentCoords = { lat: fav.lat, lon: fav.lon };
      fetchWeatherAndAQI(fav.lat, fav.lon);
    });
    container.appendChild(pill);
  });

  // Background fetch temperatures
  appState.favorites.forEach(async (fav, index) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${fav.lat}&longitude=${fav.lon}&current=temperature_2m&timezone=auto`);
      if (res.ok) {
        const data = await res.json();
        const tempVal = convertTemp(data.current.temperature_2m);
        const tempEl = document.getElementById(`fav-temp-${index}`);
        if (tempEl) tempEl.textContent = `${tempVal}°`;
      }
    } catch (e) {
      console.error('Error fetching favorite temperature: ', e);
    }
  });
}

// Setup C/F Toggle Switch
function initUnitToggle() {
  const toggle = document.getElementById('unit-toggle');
  if (!toggle) return;

  // Load preferred unit
  const savedUnit = localStorage.getItem('skyPulse_unit');
  if (savedUnit) {
    appState.tempUnit = savedUnit;
    toggle.checked = (savedUnit === 'F');
  }

  toggle.addEventListener('change', (e) => {
    appState.tempUnit = e.target.checked ? 'F' : 'C';
    localStorage.setItem('skyPulse_unit', appState.tempUnit);
    renderAll();
    renderFavoritesList();
  });
}

// Setup Location Add/Remove Favorite Action
function initFavoriteAction() {
  const favBtn = document.getElementById('add-favorite-btn');
  if (!favBtn) return;

  favBtn.addEventListener('click', () => {
    const name = appState.currentLocationName;
    const { lat, lon } = appState.currentCoords;

    const existingIndex = appState.favorites.findIndex(fav =>
      (Math.abs(fav.lat - lat) < 0.05 && Math.abs(fav.lon - lon) < 0.05) || fav.name === name
    );

    if (existingIndex > -1) {
      // Remove
      appState.favorites.splice(existingIndex, 1);
      favBtn.classList.remove('active');
    } else {
      // Add
      appState.favorites.push({ name, lat, lon });
      favBtn.classList.add('active');
    }

    saveFavorites();
    renderFavoritesList();
  });
}

// Check if current location is in favorites
function checkFavoriteStatus() {
  const favBtn = document.getElementById('add-favorite-btn');
  if (!favBtn) return;

  const { lat, lon } = appState.currentCoords;
  const isFav = appState.favorites.some(fav =>
    (Math.abs(fav.lat - lat) < 0.05 && Math.abs(fav.lon - lon) < 0.05) || fav.name === appState.currentLocationName
  );

  if (isFav) {
    favBtn.classList.add('active');
  } else {
    favBtn.classList.remove('active');
  }
}

// Fetch Weather & Air Quality Data
async function fetchWeatherAndAQI(lat, lon) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum&timezone=auto`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10&timezone=auto`;

  // Cache coordinates
  localStorage.setItem('skyPulse_lastCity', appState.currentLocationName);
  localStorage.setItem('skyPulse_lastCoords', JSON.stringify({ lat, lon }));

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl)
    ]);

    if (!weatherRes.ok || !aqiRes.ok) throw new Error('API fetch failed');

    appState.weatherData = await weatherRes.json();
    appState.airQualityData = await aqiRes.json();

    renderAll();
  } catch (error) {
    console.error('Error fetching data: ', error);
    alert('날씨 데이터를 가져오는 중 오류가 발생했습니다.');
  }
}

// Render everything on screen
function renderAll() {
  if (!appState.weatherData || !appState.airQualityData) return;

  renderCurrentWeather();
  renderDetailedMetrics();
  renderHourlyForecast();
  renderDailyForecast();
  renderAqiDetails();
  renderLifeIndices();
  renderSunriseSunset();
  generateAIBriefing();
  checkFavoriteStatus();

  // Re-trigger lucide icons
  lucide.createIcons();
}

// 1. Current Weather Card
function renderCurrentWeather() {
  const current = appState.weatherData.current;
  const daily = appState.weatherData.daily;
  const isDay = current.is_day;

  const info = getWeatherInfo(current.weather_code, isDay);

  // Update dynamic body class for theme background
  document.body.className = info.theme;

  // Update values
  document.getElementById('location-name').textContent = appState.currentLocationName;
  document.getElementById('weather-description').textContent = info.label;
  document.getElementById('current-temp').textContent = convertTemp(current.temperature_2m);

  // Set Large Icon
  const iconWrapper = document.getElementById('weather-icon-large');
  iconWrapper.innerHTML = `<i data-lucide="${info.icon}" class="animated-icon"></i>`;

  // Ranges
  document.getElementById('today-min-temp').textContent = `${convertTemp(daily.temperature_2m_min[0])}°`;
  document.getElementById('today-max-temp').textContent = `${convertTemp(daily.temperature_2m_max[0])}°`;
}

// 2. Detailed Metrics Panel
function renderDetailedMetrics() {
  const current = appState.weatherData.current;
  const daily = appState.weatherData.daily;

  // Apparent Temp
  const feelsLike = convertTemp(current.apparent_temperature);
  const actTemp = convertTemp(current.temperature_2m);
  document.getElementById('apparent-temp').textContent = `${feelsLike}°`;

  const diff = feelsLike - actTemp;
  let feelSub = '실제 기온과 비슷하게 느껴집니다.';
  if (diff > 1) {
    feelSub = `습도 등으로 인해 실제 기온보다 약 ${Math.abs(diff)}° 높게 느껴집니다.`;
  } else if (diff < -1) {
    feelSub = `바람 등으로 인해 실제 기온보다 약 ${Math.abs(diff)}° 쌀쌀하게 느껴집니다.`;
  }
  document.getElementById('apparent-temp-sub').textContent = feelSub;

  // Humidity
  const humidity = current.relative_humidity_2m;
  document.getElementById('humidity-val').textContent = `${humidity}%`;
  document.getElementById('humidity-progress').style.width = `${humidity}%`;

  let humiditySub = '적정 습도 범위 내에 있습니다.';
  if (humidity < 30) {
    humiditySub = '매우 건조합니다. 실내 가습을 권장합니다.';
  } else if (humidity > 70) {
    humiditySub = '매우 습합니다. 환기 또는 제습이 필요할 수 있습니다.';
  }
  document.getElementById('humidity-sub').textContent = humiditySub;

  // Wind
  const speed = current.wind_speed_10m;
  const dir = current.wind_direction_10m;
  document.getElementById('wind-speed').textContent = `${speed.toFixed(1)} m/s`;

  // Rotate compass arrow (Open-Meteo gives direction in degrees from North, wind arrow points to direction it goes, i.e. opposite, or we just point arrow to direction of wind)
  const arrow = document.getElementById('wind-arrow');
  if (arrow) {
    arrow.style.transform = `rotate(${dir}deg)`;
  }

  // Compass direction text
  let dirText = '북';
  if (dir >= 22.5 && dir < 67.5) dirText = '북동';
  else if (dir >= 67.5 && dir < 112.5) dirText = '동';
  else if (dir >= 112.5 && dir < 157.5) dirText = '남동';
  else if (dir >= 157.5 && dir < 202.5) dirText = '남';
  else if (dir >= 202.5 && dir < 247.5) dirText = '남서';
  else if (dir >= 247.5 && dir < 292.5) dirText = '서';
  else if (dir >= 292.5 && dir < 337.5) dirText = '북서';
  document.getElementById('wind-direction-text').textContent = `${dirText}풍 (${dir}°)`;

  // UV Index
  const uv = current.uv_index;
  document.getElementById('uv-index').textContent = uv.toFixed(1);
  const uvProgress = Math.min((uv / 12) * 100, 100);
  document.getElementById('uv-progress').style.width = `${uvProgress}%`;

  const uvStatusEl = document.getElementById('uv-status');
  let uvStatus = '낮음';
  let uvClass = 'good';
  let uvAdvice = '자외선 지수가 안전 범위에 있습니다.';

  if (uv >= 3 && uv < 6) {
    uvStatus = '보통';
    uvClass = 'moderate';
    uvAdvice = '선크림을 바르고 모자를 챙기는 것이 좋습니다.';
  } else if (uv >= 6 && uv < 8) {
    uvStatus = '높음';
    uvClass = 'poor';
    uvAdvice = '오전 10시~오후 3시 사이에 외출을 자제하세요.';
  } else if (uv >= 8) {
    uvStatus = '매우 높음';
    uvClass = 'danger';
    uvAdvice = '피부 화상을 입을 수 있으니 실내 활동을 권장합니다.';
  }

  uvStatusEl.textContent = uvStatus;
  uvStatusEl.className = `badge ${uvClass}`;
  document.getElementById('uv-advice').textContent = uvAdvice;
}

// 3. Hourly Forecast
function renderHourlyForecast() {
  const hourly = appState.weatherData.hourly;
  const container = document.getElementById('hourly-forecast-list');
  if (!container) return;

  container.innerHTML = '';

  // Find current hour index
  const now = new Date();
  const currentHour = now.getHours();

  // Show next 24 hours starting from current hour
  for (let i = currentHour; i < currentHour + 24; i++) {
    if (i >= hourly.time.length) break;

    const timeStr = hourly.time[i];
    const time = new Date(timeStr);
    const hourLabel = time.getHours() === currentHour ? '지금' : `${time.getHours()}시`;

    const temp = convertTemp(hourly.temperature_2m[i]);
    const code = hourly.weather_code[i];

    // Check hourly rain probability if available (Open-Meteo has precipitation_probability)
    const pop = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

    // Icon
    // Determine day or night for hourly icon: hours between 6am and 6pm are day, else night
    const isDayHr = time.getHours() >= 6 && time.getHours() < 18 ? 1 : 0;
    const info = getWeatherInfo(code, isDayHr);

    const item = document.createElement('div');
    item.className = 'hourly-item';
    item.innerHTML = `
      <span class="hourly-time">${hourLabel}</span>
      <div class="hourly-icon-wrapper">
        <i data-lucide="${info.icon}"></i>
      </div>
      <span class="hourly-temp">${temp}°</span>
      ${pop > 0 ? `<span class="hourly-pop" title="강수확률"><i data-lucide="droplet"></i>${pop}%</span>` : ''}
    `;
    container.appendChild(item);
  }
}

// 4. Daily Forecast (7-day)
function renderDailyForecast() {
  const daily = appState.weatherData.daily;
  const container = document.getElementById('daily-forecast-list');
  if (!container) return;

  container.innerHTML = '';

  // Find overall min and max for rendering relative temperature bar charts
  const allMins = daily.temperature_2m_min;
  const allMaxs = daily.temperature_2m_max;
  const absoluteMin = Math.min(...allMins);
  const absoluteMax = Math.max(...allMaxs);
  const tempRange = absoluteMax - absoluteMin;

  for (let i = 0; i < 7; i++) {
    const dateStr = daily.time[i];
    const dayName = formatDay(dateStr);
    const maxTemp = convertTemp(daily.temperature_2m_max[i]);
    const minTemp = convertTemp(daily.temperature_2m_min[i]);
    const code = daily.weather_code[i];
    const info = getWeatherInfo(code, 1); // standard day icons for daily list

    // Rain sum or probability
    const rainSum = daily.precipitation_sum[i];

    // Bar dimensions
    const minPct = ((daily.temperature_2m_min[i] - absoluteMin) / tempRange) * 100;
    const maxPct = ((daily.temperature_2m_max[i] - absoluteMin) / tempRange) * 100;
    const barWidth = maxPct - minPct;

    const item = document.createElement('div');
    item.className = 'daily-item';
    item.innerHTML = `
      <span class="daily-day">${dayName}</span>
      <div class="daily-icon-desc">
        <i data-lucide="${info.icon}"></i>
        <span class="daily-desc">${info.label}</span>
      </div>
      <span class="daily-pop-col" title="예상 강수량">
        ${rainSum > 0 ? `<i data-lucide="droplet"></i>${rainSum.toFixed(1)}mm` : ''}
      </span>
      <div class="daily-temp-bar-container">
        <span class="daily-temp-bar-label min">${minTemp}°</span>
        <div class="temp-bar-track">
          <div class="temp-bar-fill" style="left: ${minPct}%; width: ${barWidth}%;"></div>
        </div>
        <span class="daily-temp-bar-label max">${maxTemp}°</span>
      </div>
    `;
    container.appendChild(item);
  }
}

// 5. Air Quality & Particles
function renderAqiDetails() {
  const currentAqi = appState.airQualityData.current;
  const aqiVal = currentAqi.european_aqi;
  const pm25 = currentAqi.pm2_5;
  const pm10 = currentAqi.pm10;

  document.getElementById('aqi-value').textContent = aqiVal;
  document.getElementById('pm25-val').textContent = pm25.toFixed(1);
  document.getElementById('pm10-val').textContent = pm10.toFixed(1);

  // European AQI ranges: 0-20(Good), 20-40(Fair), 40-60(Moderate), 60-80(Poor), 80-100(Very Poor)
  const aqiStatusEl = document.getElementById('aqi-status');
  let aqiText = '아주 좋음';
  let aqiClass = 'good';

  if (aqiVal > 20 && aqiVal <= 40) {
    aqiText = '좋음/보통';
    aqiClass = 'moderate';
  } else if (aqiVal > 40 && aqiVal <= 60) {
    aqiText = '나쁨';
    aqiClass = 'poor';
  } else if (aqiVal > 60) {
    aqiText = '매우 나쁨';
    aqiClass = 'danger';
  }

  aqiStatusEl.textContent = aqiText;
  aqiStatusEl.className = `badge ${aqiClass}`;

  // PM2.5 Status (WHO criteria: 15 good, 35 moderate, 75 poor, 75+ danger)
  const pm25El = document.getElementById('pm25-status');
  let pm25Text = '좋음';
  let pm25Class = 'good';
  if (pm25 > 15 && pm25 <= 35) { pm25Text = '보통'; pm25Class = 'moderate'; }
  else if (pm25 > 35 && pm25 <= 75) { pm25Text = '나쁨'; pm25Class = 'poor'; }
  else if (pm25 > 75) { pm25Text = '매우 나쁨'; pm25Class = 'danger'; }
  pm25El.textContent = pm25Text;
  pm25El.className = `particle-badge ${pm25Class}`;

  // PM10 Status (WHO criteria: 45 good, 80 moderate, 150 poor, 150+ danger)
  const pm10El = document.getElementById('pm10-status');
  let pm10Text = '좋음';
  let pm10Class = 'good';
  if (pm10 > 45 && pm10 <= 80) { pm10Text = '보통'; pm10Class = 'moderate'; }
  else if (pm10 > 80 && pm10 <= 150) { pm10Text = '나쁨'; pm10Class = 'poor'; }
  else if (pm10 > 150) { pm10Text = '매우 나쁨'; pm10Class = 'danger'; }
  pm10El.textContent = pm10Text;
  pm10El.className = `particle-badge ${pm10Class}`;
}

// 6. Sunrise & Sunset with path visualization
function renderSunriseSunset() {
  const daily = appState.weatherData.daily;
  const sunriseStr = daily.sunrise[0];
  const sunsetStr = daily.sunset[0];

  const riseDate = new Date(sunriseStr);
  const setDate = new Date(sunsetStr);

  const riseTime = riseDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const setTime = setDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

  document.getElementById('sunrise-time').textContent = riseTime;
  document.getElementById('sunset-time').textContent = setTime;

  // Day length
  const durationMs = setDate.getTime() - riseDate.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  document.getElementById('sun-duration-sub').textContent = `오늘의 낮 길이는 ${hours}시간 ${minutes}분입니다.`;

  // Sun Node Position on path
  const now = new Date();
  const totalDayMs = setDate.getTime() - riseDate.getTime();
  const curDayMs = now.getTime() - riseDate.getTime();

  const node = document.getElementById('sun-path-node');
  if (node) {
    if (now < riseDate) {
      // Before Sunrise
      node.style.left = '0%';
      node.style.bottom = '0px';
    } else if (now > setDate) {
      // After Sunset
      node.style.left = '100%';
      node.style.bottom = '0px';
    } else {
      // Sun is in the sky
      const ratio = curDayMs / totalDayMs; // 0 to 1
      const percent = ratio * 100;

      // Calculate arc coordinates using sine wave
      // x from 0 to 100, y = sin(x * PI / 100) * 100 (relative to container height)
      const radians = (percent * Math.PI) / 100;
      const heightOffset = Math.sin(radians) * 45; // peak height is 45px

      node.style.left = `${percent}%`;
      node.style.bottom = `${heightOffset}px`;
    }
  }
}

// 7. Life Indices Calculations
function renderLifeIndices() {
  const current = appState.weatherData.current;
  const daily = appState.weatherData.daily;
  const aqi = appState.airQualityData.current.european_aqi;
  const pm25 = appState.airQualityData.current.pm2_5;
  const uv = current.uv_index;
  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;

  // Predict precipitation count in next 3 days
  let rainSumNextDays = 0;
  for (let i = 0; i < 3; i++) {
    rainSumNextDays += daily.precipitation_sum[i];
  }

  // a) Car wash index
  const carEl = document.getElementById('carwash-status');
  const carScoreEl = document.getElementById('carwash-score');
  let carScore = 95;
  let carText = '추천';

  if (current.precipitation > 0) {
    carScore = 15;
    carText = '최악 (비 내리는 중)';
  } else if (rainSumNextDays > 8) {
    carScore = 40;
    carText = '비추천 (며칠 내 비 소식)';
  } else if (rainSumNextDays > 1) {
    carScore = 65;
    carText = '보통 (약한 강우 예보)';
  } else if (aqi > 40) {
    carScore = 75;
    carText = '보통 (대기 먼지 많음)';
  }

  carEl.textContent = carText;
  carScoreEl.textContent = `지수: ${carScore}/100`;

  // Set class styling for color depending on score
  setLifeIndexClass(carEl, carScore);

  // b) Laundry index
  const laundryEl = document.getElementById('laundry-status');
  const laundryScoreEl = document.getElementById('laundry-score');

  let laundryScore = 100;
  if (current.precipitation > 0) {
    laundryScore = 10;
  } else {
    laundryScore -= humidity * 0.6; // heavy humidity reduces drying
    laundryScore += Math.max(0, temp * 0.8); // heat helps drying
    laundryScore += Math.min(10, wind * 2); // wind helps drying
    laundryScore = Math.max(10, Math.min(100, Math.round(laundryScore)));
  }

  let laundryText = '실내 건조';
  if (laundryScore >= 85) laundryText = '최상 (야외 건조)';
  else if (laundryScore >= 65) laundryText = '좋음';
  else if (laundryScore >= 45) laundryText = '보통';

  laundryEl.textContent = laundryText;
  laundryScoreEl.textContent = `지수: ${laundryScore}/100`;
  setLifeIndexClass(laundryEl, laundryScore);

  // c) Outdoor activity index
  const actEl = document.getElementById('activity-status');
  const actScoreEl = document.getElementById('activity-score');

  let actScore = 100;
  if (current.precipitation > 0) {
    actScore = 20;
  } else {
    if (pm25 > 35) actScore -= 30;
    else if (pm25 > 75) actScore -= 60;

    if (uv > 7) actScore -= 20;
    if (temp > 33 || temp < 0) actScore -= 25;
    if (wind > 8) actScore -= 15;

    actScore = Math.max(10, Math.min(100, actScore));
  }

  let actText = '실내 활동 추천';
  if (actScore >= 80) actText = '최적';
  else if (actScore >= 60) actText = '좋음';
  else if (actScore >= 40) actText = '보통 (가벼운 산책)';

  actEl.textContent = actText;
  actScoreEl.textContent = `지수: ${actScore}/100`;
  setLifeIndexClass(actEl, actScore);
}

function setLifeIndexClass(el, score) {
  el.className = 'life-status';
  if (score >= 80) el.classList.add('status-good');
  else if (score >= 50) el.classList.add('status-moderate');
  else el.classList.add('status-poor');
}

// 8. AI Assistant Dynamic Weather Commentary / Briefing
function generateAIBriefing() {
  const current = appState.weatherData.current;
  const aqi = appState.airQualityData.current.european_aqi;
  const pm25 = appState.airQualityData.current.pm2_5;
  const uv = current.uv_index;
  const hourly = appState.weatherData.hourly;
  const briefingEl = document.getElementById('assistant-briefing');

  const weatherText = WEATHER_CODES[current.weather_code] ? WEATHER_CODES[current.weather_code].label : '흐림';
  const tempVal = convertTemp(current.temperature_2m);
  const feelsLike = convertTemp(current.apparent_temperature);

  let brief = `안녕하세요! 현재 <strong>${appState.currentLocationName}</strong>의 날씨는 <strong>${weatherText}</strong> 상태이며 기온은 <strong>${tempVal}°${appState.tempUnit}</strong> (체감 ${feelsLike}°${appState.tempUnit})입니다. `;

  // Air Quality
  let aqiComment = '대기질이 매우 쾌적하여 마음껏 환기하셔도 좋습니다. ';
  if (pm25 > 35 || aqi > 50) {
    aqiComment = '초미세먼지 수준이 높아 창문을 닫으시고 외출 시 마스크를 챙기세요. ';
  } else if (pm25 > 15 || aqi > 25) {
    aqiComment = '대기질은 보통 수준입니다. ';
  }

  // Future Rain (next 8 hours)
  const now = new Date();
  const startHour = now.getHours();
  let rainHoursAhead = -1;

  if (hourly && hourly.precipitation_probability) {
    for (let h = startHour; h < startHour + 8; h++) {
      if (h < hourly.precipitation_probability.length && hourly.precipitation_probability[h] > 35) {
        rainHoursAhead = h - startHour;
        break;
      }
    }
  }

  let rainComment = '';
  if (current.precipitation > 0) {
    rainComment = '현재 비가 내리고 있어 야외활동을 삼가시고 우산을 휴대하십시오. ';
  } else if (rainHoursAhead === 0) {
    rainComment = '곧 비가 시작될 예정이니 우산을 준비해두세요. ';
  } else if (rainHoursAhead > 0) {
    rainComment = `향후 ${rainHoursAhead}시간 이내에 강수 소식이 있으니 외출 시 우산을 미리 챙기세요. `;
  }

  // Temperature recommendation
  let clothesComment = '가볍고 쾌적한 얇은 옷차림이 좋습니다. ';
  if (tempVal < 5) {
    clothesComment = '영하권의 혹한이 예상되니 목도리와 두꺼운 다운 자켓으로 단단히 대비하세요. ';
  } else if (tempVal < 12) {
    clothesComment = '공기가 다소 차가우니 코트나 바람막이를 챙기시길 권장합니다. ';
  } else if (tempVal < 19) {
    clothesComment = '아침저녁으로 쌀쌀할 수 있으니 가벼운 외투나 카디건을 챙기시면 좋습니다. ';
  } else if (tempVal > 28) {
    clothesComment = '한낮엔 무더우니 시원한 반팔 옷을 입으시고 물을 자주 섭취하여 수분을 유지하세요. ';
  }

  // UV advice
  let uvComment = '';
  if (uv >= 6) {
    uvComment = '자외선 차단 필터를 꼭 사용하시고 모자나 선글라스를 착용하세요.';
  }

  briefingEl.innerHTML = brief + rainComment + aqiComment + clothesComment + uvComment;
}

// 9. Location Search (Geocoding Auto-suggest with Debounce)
function initSearch() {
  const searchInput = document.getElementById('city-search');
  const suggestionsBox = document.getElementById('search-suggestions');
  if (!searchInput || !suggestionsBox) return;

  let debounceTimeout = null;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(debounceTimeout);

    if (query.length < 2) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.add('hidden');
      return;
    }

    // Debounce for 350ms
    debounceTimeout = setTimeout(() => {
      fetchCitySuggestions(query);
    }, 350);
  });

  // Hide suggestions list when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.add('hidden');
    }
  });
}

// Fetch suggestion lists from Open-Meteo Geocoding
async function fetchCitySuggestions(query) {
  const suggestionsBox = document.getElementById('search-suggestions');
  if (!suggestionsBox) return;

  // Search in Korean if matched, count=5
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=ko&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding API failed');

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      suggestionsBox.innerHTML = `<div class="suggestion-item"><span class="suggestion-name">일치하는 도시가 없습니다</span></div>`;
      suggestionsBox.classList.remove('hidden');
      return;
    }

    suggestionsBox.innerHTML = '';
    suggestionsBox.classList.remove('hidden');

    data.results.forEach(city => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';

      const adminName = city.admin1 ? `, ${city.admin1}` : '';
      const countryName = city.country ? ` (${city.country})` : '';
      const displayLabel = `${city.name}${adminName}${countryName}`;

      item.innerHTML = `
        <span class="suggestion-name">${city.name}</span>
        <span class="suggestion-country">${adminName.substring(2)}${countryName}</span>
      `;

      item.addEventListener('click', () => {
        appState.currentLocationName = city.name;
        appState.currentCoords = { lat: city.latitude, lon: city.longitude };

        // Clear Search
        document.getElementById('city-search').value = '';
        suggestionsBox.classList.add('hidden');

        // Fetch weather for selected city
        fetchWeatherAndAQI(city.latitude, city.longitude);
      });

      suggestionsBox.appendChild(item);
    });
  } catch (error) {
    console.error('Error searching cities: ', error);
  }
}

// 10. GPS Geolocation
function initGPS() {
  const gpsBtn = document.getElementById('gps-btn');
  if (!gpsBtn) return;

  gpsBtn.addEventListener('click', () => {
    getCurrentLocationGPS(false);
  });
}

function getCurrentLocationGPS(isSilent = false) {
  if (!navigator.geolocation) {
    if (!isSilent) alert('이 브라우저는 GPS 위치 조회를 지원하지 않습니다.');
    fallbackToSeoul();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Try to reverse geocode coordinate to get city name
      const cityName = await reverseGeocode(lat, lon);
      appState.currentLocationName = cityName;
      appState.currentCoords = { lat, lon };

      fetchWeatherAndAQI(lat, lon);
    },
    (error) => {
      console.warn('GPS location access denied or failed: ', error);
      if (!isSilent) {
        alert('위치 권한이 거부되었거나 위치를 찾을 수 없어 기본 위치(서울) 날씨를 표시합니다.');
      }
      fallbackToSeoul();
    }
  );
}

// Fallback to Seoul
function fallbackToSeoul() {
  appState.currentLocationName = '서울';
  appState.currentCoords = { lat: 37.566, lon: 126.978 };
  fetchWeatherAndAQI(37.566, 126.978);
}

// Reverse Geocoding helper (using BigDataCloud free API or Open-Meteo or fallback coordinates)
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`);
    if (res.ok) {
      const data = await res.json();
      // Return city or administrative area
      return data.city || data.locality || data.principalSubdivision || '내 위치';
    }
  } catch (e) {
    console.error('Error reverse geocoding: ', e);
  }
  return '내 위치';
}
