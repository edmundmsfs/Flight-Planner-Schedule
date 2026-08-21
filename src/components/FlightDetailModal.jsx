import { useState, useEffect, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AIRLINE_DARK_COLORS } from '../utils/airlineColors'
import WeatherWidget from './WeatherWidget'

const DEFAULT_COLOR = '#94a3b8'

function calcRotation(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360 + 315) % 360
}

function createPlaneIcon(rotation, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        transform: rotate(${rotation}deg);
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));
      ">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="0.5">
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function createAirportIcon(label, isDep) {
  const size = 28
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px; height: ${size}px; border-radius: 50%;
        background: ${isDep ? '#22c55e' : '#ef4444'};
        display: flex; align-items: center; justify-content: center;
        border: 2.5px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      ">
        <span style="color: white; font-size: 0.55rem; font-weight: 800; font-family: system-ui;">
          ${label}
        </span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FitBounds({ from, to }) {
  const map = useMap()
  useEffect(() => {
    if (from && to) {
      map.fitBounds([from, to], { padding: [60, 60], animate: false })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function AnimatedPlane({ from, to, color }) {
  const [position, setPosition] = useState(from)
  const rotation = useMemo(() => calcRotation(from[0], from[1], to[0], to[1]), [from, to])

  useEffect(() => {
    let frame
    const start = performance.now()
    const DURATION = 4500

    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1)
      const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      setPosition([
        from[0] + (to[0] - from[0]) * ease,
        from[1] + (to[1] - from[1]) * ease,
      ])
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [from, to])

  return (
    <Marker
      position={position}
      icon={createPlaneIcon(rotation, color)}
      zIndexOffset={1000}
    />
  )
}

function GrowingTrail({ from, to, color }) {
  const [positions, setPositions] = useState([from])

  useEffect(() => {
    let timer
    const DURATION = 4500
    const STEPS = 90
    const interval = DURATION / STEPS
    let step = 0

    const tick = () => {
      step++
      const t = Math.min(step / STEPS, 1)
      const pts = []
      for (let i = 0; i <= step; i++) {
        const s = Math.min(i / STEPS, 1)
        const e = s < 0.5 ? 2 * s * s : 1 - (-2 * s + 2) ** 2 / 2
        pts.push([
          from[0] + (to[0] - from[0]) * e,
          from[1] + (to[1] - from[1]) * e,
        ])
      }
      setPositions(pts)
      if (t < 1) timer = setTimeout(tick, interval)
    }

    timer = setTimeout(tick, interval)
    return () => clearTimeout(timer)
  }, [from, to])

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
      }}
    />
  )
}

export default function FlightDetailModal({ flight, airports, onClose }) {
  const airportMap = useMemo(() => {
    const map = {}
    airports.forEach(a => { map[a.icao] = a })
    return map
  }, [airports])

  const depAirport = airportMap[flight.departure]
  const arrAirport = airportMap[flight.arrival]

  const depCoords = depAirport ? [depAirport.lat, depAirport.lon] : [-6.1255, 106.6558]
  const arrCoords = arrAirport ? [arrAirport.lat, arrAirport.lon] : [-8.7481, 115.1672]

  const color = AIRLINE_DARK_COLORS[flight.airline] || DEFAULT_COLOR

  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimKey(k => k + 1)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fdm-overlay" onClick={handleOverlayClick}>
      <div className="fdm-modal">
        <div className="fdm-header">
          <div className="fdm-header-left">
            <span className="fdm-flight-num" style={{ color }}>{flight.flight_number}</span>
            <span className="fdm-airline-tag" style={{ background: `${color}18`, color, borderColor: `${color}30` }}>
              {flight.airline}
            </span>
          </div>
          <button className="fdm-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="fdm-map-wrap">
          <MapContainer
            center={depCoords}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <FitBounds from={depCoords} to={arrCoords} />

            <Polyline
              positions={[depCoords, arrCoords]}
              pathOptions={{
                color: '#475569',
                weight: 3,
                opacity: 0.4,
                dashArray: '8 8',
                lineCap: 'round',
              }}
            />
            <GrowingTrail key={`trail-${animKey}`} from={depCoords} to={arrCoords} color={color} />

            <Marker position={depCoords} icon={createAirportIcon('A', true)} zIndexOffset={500} />
            <Marker position={arrCoords} icon={createAirportIcon('B', false)} zIndexOffset={500} />
            <AnimatedPlane key={`plane-${animKey}`} from={depCoords} to={arrCoords} color={color} />
          </MapContainer>
        </div>

        <div className="fdm-route">
          <div className="fdm-airport">
            <span className="fdm-time">{flight.departure_time}</span>
            <span className="fdm-icao">{flight.departure}</span>
            <span className="fdm-city">{flight.departure_city}</span>
          </div>
          <div className="fdm-route-center">
            <div className="fdm-route-line" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            <div className="fdm-route-line" />
          </div>
          <div className="fdm-airport">
            <span className="fdm-time">{flight.arrival_time}</span>
            <span className="fdm-icao">{flight.arrival}</span>
            <span className="fdm-city">{flight.arrival_city}</span>
          </div>
        </div>

        <div className="fdm-meta">
          <div className="fdm-meta-item">
            <span className="fdm-meta-icon">⏱️</span>
            <span className="fdm-meta-val">{flight.block_time}h</span>
            <span className="fdm-meta-lbl">Block Time</span>
          </div>
          <div className="fdm-meta-sep" />
          <div className="fdm-meta-item">
            <span className="fdm-meta-icon">📏</span>
            <span className="fdm-meta-val">{flight.distance} NM</span>
            <span className="fdm-meta-lbl">Distance</span>
          </div>
          <div className="fdm-meta-sep" />
          <div className="fdm-meta-item">
            <span className="fdm-meta-icon">📅</span>
            <span className="fdm-meta-val">{flight.date}</span>
            <span className="fdm-meta-lbl">Date</span>
          </div>
          <div className="fdm-meta-sep" />
          <div className="fdm-meta-item">
            <span className="fdm-meta-icon">🟢</span>
            <span className={`status-badge status-badge--${(flight.status || 'scheduled').toLowerCase()}`}>{flight.status || 'Scheduled'}</span>
            <span className="fdm-meta-lbl">Status</span>
          </div>
        </div>

        <div className="fdm-wx-row">
          <WeatherWidget airport={depAirport} label="Departure" />
          <WeatherWidget airport={arrAirport} label="Arrival" />
        </div>
      </div>
    </div>
  )
}
