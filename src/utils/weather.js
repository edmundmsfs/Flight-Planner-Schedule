const CACHE_PREFIX = 'wx_'
const CACHE_TTL = 15 * 60 * 1000

function getCached(icao) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + icao)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + icao)
      return null
    }
    return data
  } catch { return null }
}

function setCache(icao, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + icao, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota exceeded, ignore */ }
}

const WMO_CODES = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Foggy', icon: '🌫️' },
  48: { desc: 'Rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌦️' },
  53: { desc: 'Moderate drizzle', icon: '🌦️' },
  55: { desc: 'Dense drizzle', icon: '🌧️' },
  56: { desc: 'Freezing drizzle', icon: '🌧️' },
  57: { desc: 'Dense freezing drizzle', icon: '🌧️' },
  61: { desc: 'Slight rain', icon: '🌦️' },
  63: { desc: 'Moderate rain', icon: '🌧️' },
  65: { desc: 'Heavy rain', icon: '🌧️' },
  66: { desc: 'Freezing rain', icon: '🌧️' },
  67: { desc: 'Heavy freezing rain', icon: '🌧️' },
  71: { desc: 'Slight snow', icon: '🌨️' },
  73: { desc: 'Moderate snow', icon: '🌨️' },
  75: { desc: 'Heavy snow', icon: '❄️' },
  77: { desc: 'Snow grains', icon: '❄️' },
  80: { desc: 'Slight showers', icon: '🌦️' },
  81: { desc: 'Moderate showers', icon: '🌧️' },
  82: { desc: 'Violent showers', icon: '⛈️' },
  85: { desc: 'Slight snow showers', icon: '🌨️' },
  86: { desc: 'Heavy snow showers', icon: '❄️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
  96: { desc: 'Thunderstorm + hail', icon: '⛈️' },
  99: { desc: 'Thunderstorm + heavy hail', icon: '⛈️' },
}

export function getWeatherInfo(code) {
  return WMO_CODES[code] || { desc: 'Unknown', icon: '🌡️' }
}

export async function fetchWeather(lat, lon, icao) {
  const cached = getCached(icao)
  if (cached) return cached

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,cloud_cover,visibility&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Weather API ${res.status}`)
    const json = await res.json()
    const c = json.current
    const result = {
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      weatherCode: c.weather_code,
      cloudCover: c.cloud_cover,
      visibility: c.visibility,
      time: c.time,
    }
    setCache(icao, result)
    return result
  } catch (err) {
    console.warn(`Weather fetch failed for ${icao}:`, err.message)
    return null
  }
}

export function getWindDirLabel(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function formatVisibility(meters) {
  if (meters >= 10000) return `${(meters / 1000).toFixed(0)} km`
  return `${Math.round(meters)} m`
}
