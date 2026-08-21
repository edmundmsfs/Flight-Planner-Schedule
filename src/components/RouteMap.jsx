import { useMemo, useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [40, 40], animate: false })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

const AIRLINE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

function createAirportIcon(index, isBase, color) {
  const size = isBase ? 34 : 26
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${isBase ? '#ef4444' : color};
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.5);
        z-index: 1000;
      ">
        <span style="
          color: white;
          font-size: ${isBase ? '0.55rem' : '0.65rem'};
          font-weight: 800;
          font-family: system-ui, sans-serif;
          letter-spacing: 0.02em;
        ">${isBase ? 'BASE' : index}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function calcRotation(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export default function RouteMap({ legs, airports }) {
  const [activeLeg, setActiveLeg] = useState(null)

  const airportMap = useMemo(() => {
    const map = {}
    airports.forEach(a => { map[a.icao] = a })
    return map
  }, [airports])

  const uniqueAirports = useMemo(() => {
    const seen = new Set()
    const result = []
    const baseIcao = legs.length > 0 ? legs[0].departure : null
    legs.forEach(leg => {
      if (!seen.has(leg.departure) && airportMap[leg.departure]) {
        seen.add(leg.departure)
        result.push({ ...airportMap[leg.departure], isBase: leg.departure === baseIcao })
      }
      if (!seen.has(leg.arrival) && airportMap[leg.arrival]) {
        seen.add(leg.arrival)
        result.push({ ...airportMap[leg.arrival], isBase: leg.arrival === baseIcao })
      }
    })
    return result
  }, [legs, airportMap])

  const bounds = useMemo(() => uniqueAirports.map(a => [a.lat, a.lon]), [uniqueAirports])

  const routeLines = useMemo(() => {
    return legs.map((leg, i) => {
      const dep = airportMap[leg.departure]
      const arr = airportMap[leg.arrival]
      if (!dep || !arr) return null
      return {
        leg,
        index: i,
        positions: [[dep.lat, dep.lon], [arr.lat, arr.lon]],
        color: AIRLINE_COLORS[i % AIRLINE_COLORS.length],
        rotation: calcRotation(dep.lat, dep.lon, arr.lat, arr.lon),
        midpoint: [(dep.lat + arr.lat) / 2, (dep.lon + arr.lon) / 2],
      }
    }).filter(Boolean)
  }, [legs, airportMap])

  const totalBlock = useMemo(() => legs.reduce((s, l) => s + l.blockTime, 0), [legs])
  const totalDist = useMemo(() => legs.reduce((s, l) => s + l.distance, 0), [legs])

  const handleLegClick = useCallback((index) => {
    setActiveLeg(prev => prev === index ? null : index)
  }, [])

  if (legs.length === 0) return null

  const active = activeLeg !== null ? legs[activeLeg] : null

  return (
    <div className="rm">
      <div className="rm-map-wrap">
        <MapContainer
          center={[-2.5, 118]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <FitBounds bounds={bounds} />

          {uniqueAirports.map((apt, i) => (
            <Marker
              key={apt.icao}
              position={[apt.lat, apt.lon]}
              icon={createAirportIcon(i + 1, apt.isBase, AIRLINE_COLORS[i % AIRLINE_COLORS.length])}
            />
          ))}

          {routeLines.map(line => {
            const isActive = activeLeg === line.index
            return (
              <div key={line.index}>
                <Polyline
                  positions={line.positions}
                  pathOptions={{
                    color: isActive ? '#fbbf24' : line.color,
                    weight: isActive ? 5 : 3,
                    opacity: isActive ? 1 : 0.6,
                    dashArray: isActive ? undefined : '10 6',
                    lineCap: 'round',
                  }}
                  eventHandlers={{ click: () => handleLegClick(line.index) }}
                />
                <Marker
                  position={line.midpoint}
                  icon={L.divIcon({
                    className: '',
                    html: `<div style="transform:rotate(${line.rotation}deg);filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));opacity:${isActive ? 1 : 0.8}"><svg width="22" height="22" viewBox="0 0 24 24" fill="${isActive ? '#fbbf24' : line.color}" stroke="white" stroke-width="0.5"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                  })}
                  eventHandlers={{ click: () => handleLegClick(line.index) }}
                />
              </div>
            )
          })}
        </MapContainer>
      </div>

      <div className="rm-stats-bar">
        <div className="rm-stat">
          <span className="rm-stat-val">{legs.length}</span>
          <span className="rm-stat-lbl">Legs</span>
        </div>
        <div className="rm-stat-sep" />
        <div className="rm-stat">
          <span className="rm-stat-val">{totalBlock.toFixed(1)}h</span>
          <span className="rm-stat-lbl">Block Time</span>
        </div>
        <div className="rm-stat-sep" />
        <div className="rm-stat">
          <span className="rm-stat-val">{totalDist.toLocaleString()}</span>
          <span className="rm-stat-lbl">Total NM</span>
        </div>
        <div className="rm-stat-sep" />
        <div className="rm-stat">
          <span className="rm-stat-val">{uniqueAirports.length}</span>
          <span className="rm-stat-lbl">Airports</span>
        </div>
      </div>

      {active && (
        <div className="rm-detail">
          <div className="rm-detail-head">
            <div className="rm-detail-fn-wrap">
              <span className="rm-detail-fn">{active.flightNumber}</span>
              <span className="rm-detail-airline">{active.airline}</span>
            </div>
            <span className="rm-detail-status">{active.status}</span>
            <button className="rm-detail-close" onClick={() => setActiveLeg(null)}>✕</button>
          </div>
          <div className="rm-detail-route">
            <div className="rm-detail-point">
              <span className="rm-detail-icao">{active.departure}</span>
              <span className="rm-detail-city">{active.departureCity}</span>
              <span className="rm-detail-time">{active.departureTime}</span>
            </div>
            <div className="rm-detail-flight-line">
              <div className="rm-detail-line-dash" />
              <svg width="28" height="28" viewBox="0 0 24 24" fill={AIRLINE_COLORS[activeLeg % AIRLINE_COLORS.length]} stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
              <div className="rm-detail-line-dash" />
            </div>
            <div className="rm-detail-point">
              <span className="rm-detail-icao">{active.arrival}</span>
              <span className="rm-detail-city">{active.arrivalCity}</span>
              <span className="rm-detail-time">{active.arrivalTime}</span>
            </div>
          </div>
          <div className="rm-detail-info">
            <div className="rm-detail-info-item">
              <span className="rm-detail-info-icon">⏱️</span>
              <span className="rm-detail-info-val">{active.blockTime}h</span>
              <span className="rm-detail-info-lbl">Block Time</span>
            </div>
            <div className="rm-detail-info-item">
              <span className="rm-detail-info-icon">📏</span>
              <span className="rm-detail-info-val">{active.distance} NM</span>
              <span className="rm-detail-info-lbl">Distance</span>
            </div>
            <div className="rm-detail-info-item">
              <span className="rm-detail-info-icon">✈️</span>
              <span className="rm-detail-info-val">Leg {active.legNumber}/{legs.length}</span>
              <span className="rm-detail-info-lbl">Position</span>
            </div>
          </div>
        </div>
      )}

      <div className="rm-legend">
        <span className="rm-legend-title">Flight Legs</span>
        <div className="rm-legend-items">
          {legs.map((leg, i) => (
            <button
              key={i}
              className={`rm-legend-chip ${activeLeg === i ? 'rm-legend-chip--active' : ''}`}
              onClick={() => handleLegClick(i)}
              style={{ '--chip-color': AIRLINE_COLORS[i % AIRLINE_COLORS.length] }}
            >
              <span className="rm-legend-chip-dot" />
              <span className="rm-legend-chip-fn">{leg.flightNumber}</span>
              <span className="rm-legend-chip-route">{leg.departure}→{leg.arrival}</span>
              <span className="rm-legend-chip-time">{leg.blockTime}h</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
