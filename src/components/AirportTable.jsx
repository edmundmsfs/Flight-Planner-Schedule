import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const AIRLINE_COLORS = [
  { bg: '#3b82f6', shadow: 'rgba(59,130,246,0.4)' },
  { bg: '#10b981', shadow: 'rgba(16,185,129,0.4)' },
  { bg: '#f59e0b', shadow: 'rgba(245,158,11,0.4)' },
  { bg: '#ef4444', shadow: 'rgba(239,68,68,0.4)' },
  { bg: '#8b5cf6', shadow: 'rgba(139,92,246,0.4)' },
  { bg: '#ec4899', shadow: 'rgba(236,72,153,0.4)' },
  { bg: '#06b6d4', shadow: 'rgba(6,182,212,0.4)' },
  { bg: '#84cc16', shadow: 'rgba(132,204,22,0.4)' },
]

const MARKER_STYLES = [
  { id: 'animated', label: 'Animated', icon: '✨' },
  { id: 'static', label: 'Static', icon: '📍' },
  { id: 'pin', label: 'Pin Drop', icon: '📌' },
  { id: 'glow', label: 'Neon Glow', icon: '💡' },
  { id: 'numbered', label: 'Numbered', icon: '🔢' },
]

const PLANE_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`

function createAirportIcon(color, style, index) {
  const c = color.bg
  const s = color.shadow

  if (style === 'static') {
    return L.divIcon({
      className: 'airport-marker',
      html: `
        <div class="apt-mk apt-mk--static" style="--mk-color: ${c}">
          <div class="apt-mk-core">${PLANE_SVG}</div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -18],
    })
  }

  if (style === 'pin') {
    return L.divIcon({
      className: 'airport-marker',
      html: `
        <div class="apt-mk apt-mk--pin" style="--mk-color: ${c}; --mk-shadow: ${s}">
          <svg class="apt-mk-pin-svg" width="32" height="42" viewBox="0 0 32 42">
            <defs>
              <filter id="pinShadow${index}" x="-20%" y="-10%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${c}" flood-opacity="0.35"/>
              </filter>
            </defs>
            <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${c}" filter="url(#pinShadow${index})"/>
            <circle cx="16" cy="14" r="8" fill="rgba(255,255,255,0.9)"/>
            <g transform="translate(8, 6) scale(0.67)">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="${c}" stroke="${c}" stroke-width="0.5"/>
            </g>
          </svg>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -38],
    })
  }

  if (style === 'glow') {
    return L.divIcon({
      className: 'airport-marker',
      html: `
        <div class="apt-mk apt-mk--glow" style="--mk-color: ${c}; --mk-shadow: ${s}">
          <div class="apt-mk-glow-ring" />
          <div class="apt-mk-glow-ring apt-mk-glow-ring--delayed" />
          <div class="apt-mk-core apt-mk-core--glow">${PLANE_SVG}</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24],
    })
  }

  if (style === 'numbered') {
    return L.divIcon({
      className: 'airport-marker',
      html: `
        <div class="apt-mk apt-mk--numbered" style="--mk-color: ${c}; --mk-shadow: ${s}">
          <span class="apt-mk-num">${index + 1}</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -18],
    })
  }

  // animated (default)
  return L.divIcon({
    className: 'airport-marker',
    html: `
      <div class="apt-mk apt-mk--animated" style="--mk-color: ${c}; --mk-shadow: ${s}">
        <div class="apt-mk-pulse" />
        <div class="apt-mk-core">${PLANE_SVG}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  })
}

function FitBounds({ airports }) {
  const map = useMap()
  useEffect(() => {
    if (airports.length === 0) return
    if (airports.length === 1) {
      map.setView([airports[0].lat, airports[0].lon], 10)
      return
    }
    const bounds = L.latLngBounds(airports.map(a => [a.lat, a.lon]))
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 })
  }, [airports, map])
  return null
}

function SelectedAirportHandler({ airport }) {
  const map = useMap()
  useEffect(() => {
    if (airport) {
      map.flyTo([airport.lat, airport.lon], 10, { duration: 0.8 })
    }
  }, [airport, map])
  return null
}

export default function AirportTable({ airports, loading }) {
  const [view, setView] = useState('map')
  const [markerStyle, setMarkerStyle] = useState('animated')
  const [mapTheme, setMapTheme] = useState('dark')
  const [selectedAirport, setSelectedAirport] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false)

  const MAP_TILES = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    },
  }

  const filteredAirports = airports.filter(a =>
    a.icao.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getAirportColor = (idx) => AIRLINE_COLORS[idx % AIRLINE_COLORS.length]
  const currentStyle = MARKER_STYLES.find(s => s.id === markerStyle)

  if (loading) {
    return (
      <div className="apt-container">
        <div className="apt-header">
          <div>
            <h2 className="apt-title">Master Airports</h2>
            <p className="apt-subtitle">Loading airport data...</p>
          </div>
        </div>
        <div className="apt-loading">
          <div className="apt-loading-spinner" />
          <p>Loading airports database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="apt-container">
      <div className="apt-header">
        <div className="apt-header-left">
          <h2 className="apt-title">Master Airports</h2>
          <p className="apt-subtitle">{airports.length} airports in database</p>
        </div>
        <div className="apt-header-right">
          <div className="apt-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search ICAO, name, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="apt-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="apt-search-clear" aria-label="Clear search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {view === 'map' && (
            <>
              <div className="apt-map-theme">
                <button
                  className={`apt-theme-btn ${mapTheme === 'dark' ? 'apt-theme-btn--active' : ''}`}
                  onClick={() => setMapTheme('dark')}
                  aria-label="Dark map"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                </button>
                <button
                  className={`apt-theme-btn ${mapTheme === 'light' ? 'apt-theme-btn--active' : ''}`}
                  onClick={() => setMapTheme('light')}
                  aria-label="Light map"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                </button>
                <button
                  className={`apt-theme-btn ${mapTheme === 'satellite' ? 'apt-theme-btn--active' : ''}`}
                  onClick={() => setMapTheme('satellite')}
                  aria-label="Satellite map"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </button>
              </div>
              <div className="apt-style-picker">
              <button
                className="apt-style-trigger"
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
              >
                <span className="apt-style-trigger-icon">{currentStyle?.icon}</span>
                <span className="apt-style-trigger-label">{currentStyle?.label}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {styleDropdownOpen && (
                <div className="apt-style-dropdown">
                  {MARKER_STYLES.map(s => (
                    <button
                      key={s.id}
                      className={`apt-style-option ${markerStyle === s.id ? 'apt-style-option--active' : ''}`}
                      onClick={() => { setMarkerStyle(s.id); setStyleDropdownOpen(false) }}
                    >
                      <span className="apt-style-option-icon">{s.icon}</span>
                      <span className="apt-style-option-label">{s.label}</span>
                      {markerStyle === s.id && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </>
          )}

          <div className="apt-toggle">
            <button
              className={`apt-toggle-btn ${view === 'map' ? 'apt-toggle-btn--active' : ''}`}
              onClick={() => setView('map')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              Map
            </button>
            <button
              className={`apt-toggle-btn ${view === 'table' ? 'apt-toggle-btn--active' : ''}`}
              onClick={() => setView('table')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              Table
            </button>
          </div>
        </div>
      </div>

      {view === 'map' ? (
        <div className="apt-map-wrapper">
          <div className="apt-map">
            <MapContainer
              center={[-2.5, 118]}
              zoom={5}
              scrollWheelZoom={true}
              className="apt-map-container"
              zoomControl={false}
            >
              <TileLayer
                key={mapTheme}
                attribution={MAP_TILES[mapTheme].attribution}
                url={MAP_TILES[mapTheme].url}
              />
              <FitBounds airports={filteredAirports} />
              <SelectedAirportHandler airport={selectedAirport} />
              {filteredAirports.map((apt, idx) => (
                <Marker
                  key={`${apt.icao}-${markerStyle}`}
                  position={[apt.lat, apt.lon]}
                  icon={createAirportIcon(getAirportColor(idx), markerStyle, idx)}
                  eventHandlers={{
                    click: () => setSelectedAirport(apt),
                  }}
                >
                  <Popup>
                    <div className="apt-popup">
                      <div className="apt-popup-badge" style={{ background: getAirportColor(idx).bg }}>
                        {apt.icao}
                      </div>
                      <h4 className="apt-popup-name">{apt.name}</h4>
                      <div className="apt-popup-info">
                        <div className="apt-popup-row">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{apt.city}</span>
                        </div>
                        <div className="apt-popup-row">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
                          <span>{apt.runway}m runway</span>
                        </div>
                        <div className="apt-popup-row">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                          <span>{apt.lat.toFixed(4)}°, {apt.lon.toFixed(4)}°</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="apt-map-sidebar">
            <div className="apt-map-sidebar-header">
              <h3 className="apt-map-sidebar-title">Airport List</h3>
              <span className="apt-map-sidebar-count">{filteredAirports.length}</span>
            </div>
            <div className="apt-map-list">
              {filteredAirports.map((apt, idx) => {
                const color = getAirportColor(idx)
                const isSelected = selectedAirport?.icao === apt.icao
                return (
                  <div
                    key={apt.icao}
                    className={`apt-map-item ${isSelected ? 'apt-map-item--selected' : ''}`}
                    onClick={() => setSelectedAirport(apt)}
                  >
                    <div className="apt-map-item-icon" style={{ background: color.bg, boxShadow: `0 2px 8px ${color.shadow}` }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                      </svg>
                    </div>
                    <div className="apt-map-item-info">
                      <span className="apt-map-item-icao">{apt.icao}</span>
                      <span className="apt-map-item-city">{apt.city}</span>
                    </div>
                    <span className="apt-map-item-runway">{apt.runway}m</span>
                  </div>
                )
              })}
              {filteredAirports.length === 0 && (
                <div className="apt-map-empty">
                  <p>No airports match your search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="apt-table-card">
          <table className="apt-table">
            <thead>
              <tr>
                <th>ICAO</th>
                <th>Airport Name</th>
                <th>City</th>
                <th>Runway (m)</th>
                <th>Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {filteredAirports.map((apt, idx) => {
                const color = getAirportColor(idx)
                return (
                  <tr key={apt.icao} className="apt-table-row">
                    <td>
                      <span className="apt-table-icao" style={{ background: color.bg, color: 'white' }}>
                        {apt.icao}
                      </span>
                    </td>
                    <td className="apt-table-name">{apt.name}</td>
                    <td>{apt.city}</td>
                    <td><span className="apt-table-runway">{apt.runway}</span></td>
                    <td className="apt-table-coords">{apt.lat.toFixed(4)}, {apt.lon.toFixed(4)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredAirports.length === 0 && (
            <div className="apt-empty">
              <p>No airports match your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
