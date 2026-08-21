import { useState, useEffect, useMemo } from 'react'
import { LOCAL_AIRPORTS } from '../utils/airports'
import { fetchWeather, getWeatherInfo, getWindDirLabel, formatVisibility } from '../utils/weather'

const INDONESIA_ICAOS = ['WIII','WADD','WARR','WIMM','WAAA','WAHI','WIOO','WAOO','WIDN','WADL','WAHH','WAJJ','WALL','WAMM','WIBB','WIPP','WARJ','WIPA','WITT']

function getSeverity(code) {
  if (code <= 2) return 'clear'
  if (code === 3) return 'cloudy'
  if (code >= 45 && code <= 48) return 'fog'
  if (code >= 51 && code <= 82) return 'rain'
  return 'storm'
}

function AirportCard({ airport }) {
  const [wx, setWx] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchWeather(airport.lat, airport.lon, airport.icao).then(data => {
      if (!cancelled) { setWx(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [airport])

  if (loading) {
    return (
      <div className="ws-card ws-card--loading">
        <div className="ws-card-icao">{airport.icao}</div>
        <div className="ws-card-city">{airport.city}</div>
        <div className="ws-card-loading">Loading...</div>
      </div>
    )
  }

  if (!wx) {
    return (
      <div className="ws-card ws-card--error">
        <div className="ws-card-icao">{airport.icao}</div>
        <div className="ws-card-city">{airport.city}</div>
        <div className="ws-card-loading">—</div>
      </div>
    )
  }

  const info = getWeatherInfo(wx.weatherCode)
  const severity = getSeverity(wx.weatherCode)
  const visKm = wx.visibility / 1000
  const visClass = visKm < 2 ? 'ws-vis--low' : visKm < 5 ? 'ws-vis--mid' : 'ws-vis--high'

  return (
    <div className={`ws-card ws-card--${severity}`}>
      <div className="ws-card-header">
        <span className="ws-card-icao">{airport.icao}</span>
        <span className="ws-card-city">{airport.city}</span>
      </div>
      <div className="ws-card-main">
        <span className="ws-card-icon">{info.icon}</span>
        <span className="ws-card-temp">{wx.temperature}°</span>
      </div>
      <div className="ws-card-desc">{info.desc}</div>
      <div className="ws-card-details">
        <div className="ws-card-detail">
          <span>💨</span>
          <span>{wx.windSpeed} kt</span>
          <span className="ws-card-detail-dir">{getWindDirLabel(wx.windDirection)}</span>
        </div>
        <div className="ws-card-detail">
          <span>💧</span>
          <span>{wx.humidity}%</span>
        </div>
        <div className={`ws-card-detail ${visClass}`}>
          <span>👁️</span>
          <span>{formatVisibility(wx.visibility)}</span>
        </div>
      </div>
    </div>
  )
}

export default function WeatherStation() {
  const [refreshKey, setRefreshKey] = useState(0)

  const groups = useMemo(() => {
    const indonesia = LOCAL_AIRPORTS.filter(a => INDONESIA_ICAOS.includes(a.icao))
    const international = LOCAL_AIRPORTS.filter(a => !INDONESIA_ICAOS.includes(a.icao))
    return { indonesia, international }
  }, [])

  return (
    <div className="ws">
      <div className="ws-header">
        <div>
          <h2 className="ws-title">Weather Station</h2>
          <p className="ws-subtitle">Live conditions across all 25 airports</p>
        </div>
        <button className="ws-refresh" onClick={() => setRefreshKey(k => k + 1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Refresh
        </button>
      </div>

      <div className="ws-section">
        <h3 className="ws-section-title">
          <span className="ws-section-flag">🇮🇩</span> Indonesia ({groups.indonesia.length})
        </h3>
        <div className="ws-grid" key={`id-${refreshKey}`}>
          {groups.indonesia.map(a => <AirportCard key={a.icao} airport={a} />)}
        </div>
      </div>

      <div className="ws-section">
        <h3 className="ws-section-title">
          <span className="ws-section-flag">🌏</span> International ({groups.international.length})
        </h3>
        <div className="ws-grid" key={`intl-${refreshKey}`}>
          {groups.international.map(a => <AirportCard key={a.icao} airport={a} />)}
        </div>
      </div>
    </div>
  )
}
