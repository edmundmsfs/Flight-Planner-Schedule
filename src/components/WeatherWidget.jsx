import { useState, useEffect } from 'react'
import { fetchWeather, getWeatherInfo, getWindDirLabel, formatVisibility } from '../utils/weather'

export default function WeatherWidget({ airport, label }) {
  const [state, setState] = useState({ wx: null, loading: true })

  useEffect(() => {
    if (!airport) return
    let cancelled = false
    fetchWeather(airport.lat, airport.lon, airport.icao).then(data => {
      if (!cancelled) setState({ wx: data, loading: false })
    })
    return () => { cancelled = true }
  }, [airport])

  if (!airport) return null

  const { wx, loading } = state

  if (loading) {
    return (
      <div className="wx-card wx-card--loading">
        <div className="wx-header"><span className="wx-label">{label}</span><span className="wx-icao">{airport.icao}</span></div>
        <div className="wx-loading-text">Loading weather...</div>
      </div>
    )
  }

  if (!wx) {
    return (
      <div className="wx-card wx-card--error">
        <div className="wx-header"><span className="wx-label">{label}</span><span className="wx-icao">{airport.icao}</span></div>
        <div className="wx-loading-text">Weather unavailable</div>
      </div>
    )
  }

  const info = getWeatherInfo(wx.weatherCode)

  return (
    <div className="wx-card">
      <div className="wx-header">
        <span className="wx-label">{label}</span>
        <span className="wx-icao">{airport.icao}</span>
      </div>
      <div className="wx-main">
        <span className="wx-icon">{info.icon}</span>
        <span className="wx-temp">{wx.temperature}°C</span>
      </div>
      <div className="wx-desc">{info.desc}</div>
      <div className="wx-details">
        <div className="wx-detail">
          <span className="wx-detail-icon">💨</span>
          <span className="wx-detail-val">{wx.windSpeed} km/h</span>
          <span className="wx-detail-lbl">{getWindDirLabel(wx.windDirection)}</span>
        </div>
        <div className="wx-detail">
          <span className="wx-detail-icon">💧</span>
          <span className="wx-detail-val">{wx.humidity}%</span>
          <span className="wx-detail-lbl">Humidity</span>
        </div>
        <div className="wx-detail">
          <span className="wx-detail-icon">☁️</span>
          <span className="wx-detail-val">{wx.cloudCover}%</span>
          <span className="wx-detail-lbl">Clouds</span>
        </div>
        <div className="wx-detail">
          <span className="wx-detail-icon">👁️</span>
          <span className="wx-detail-val">{formatVisibility(wx.visibility)}</span>
          <span className="wx-detail-lbl">Visibility</span>
        </div>
      </div>
    </div>
  )
}
