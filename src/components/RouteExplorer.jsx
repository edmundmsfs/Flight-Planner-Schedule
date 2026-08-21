import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AIRLINE_ROUTES, getRoutesFromAirport } from '../utils/airlineRoutes'
import { LOCAL_AIRPORTS } from '../utils/airports'
import { AIRLINE_COLORS, DEFAULT_COLOR } from '../utils/airlineColors'
import FlightDetailModal from './FlightDetailModal'

function createAirportMarker(icao, connectionCount, isSelected) {
  const size = Math.min(12 + connectionCount * 2, 28)
  const color = isSelected ? '#3b82f6' : '#f59e0b'
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px; height: ${size}px; border-radius: 50%;
        background: ${color}; border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        font-size: ${size < 18 ? '0.4rem' : '0.5rem'};
        font-weight: 800; color: white; font-family: monospace;
        cursor: pointer;
        transition: transform 0.2s;
      ">${icao.slice(-2)}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FitAll({ airports }) {
  const map = useMap()
  useMemo(() => {
    if (airports.length > 0) {
      const bounds = airports.map(a => [a.lat, a.lon])
      map.fitBounds(bounds, { padding: [40, 40], animate: false })
    }
  }, [airports, map])
  return null
}

export default function RouteExplorer() {
  const [selectedAirline, setSelectedAirline] = useState('all')
  const [selectedAirport, setSelectedAirport] = useState(null)

  const airlineNames = Object.keys(AIRLINE_ROUTES)

  const airportMap = useMemo(() => {
    const map = {}
    LOCAL_AIRPORTS.forEach(a => { map[a.icao] = a })
    return map
  }, [])

  const { routes, connectionCounts, servedAirports, totalRoutes } = useMemo(() => {
    const allRoutes = []
    const counts = {}
    const served = new Set()

    const airlines = selectedAirline === 'all' ? airlineNames : [selectedAirline]

    airlines.forEach(name => {
      const config = AIRLINE_ROUTES[name]
      if (!config) return
      const allIcaos = new Set()
      config.routes.forEach(r => { allIcaos.add(r.from); allIcaos.add(r.to) })
      allIcaos.forEach(icao => {
        getRoutesFromAirport(name, icao).forEach(route => {
          const key = `${route.from}-${route.to}-${name}`
          if (!allRoutes.some(r => `${r.from}-${r.to}-${r.airline}` === key)) {
            allRoutes.push({ ...route, airline: name })
            counts[route.from] = (counts[route.from] || 0) + 1
            counts[route.to] = (counts[route.to] || 0) + 1
            served.add(route.from)
            served.add(route.to)
          }
        })
      })
    })

    return { routes: allRoutes, connectionCounts: counts, servedAirports: served, totalRoutes: allRoutes.length }
  }, [selectedAirline, airlineNames])

  const displayAirports = useMemo(() => {
    return LOCAL_AIRPORTS.filter(a => servedAirports.has(a.icao))
  }, [servedAirports])

  const selectedAirportRoutes = useMemo(() => {
    if (!selectedAirport) return []
    const airlines = selectedAirline === 'all' ? airlineNames : [selectedAirline]
    const result = []
    airlines.forEach(name => {
      getRoutesFromAirport(name, selectedAirport).forEach(r => {
        result.push({ ...r, airline: name })
      })
    })
    return result
  }, [selectedAirport, selectedAirline, airlineNames])

  const [detailFlight, setDetailFlight] = useState(null)

  return (
    <div className="re">
      <div className="re-header">
        <div>
          <h2 className="re-title">Route Explorer</h2>
          <p className="re-subtitle">Discover all possible routes across 4 airlines</p>
        </div>
        <div className="re-stats">
          <div className="re-stat">
            <span className="re-stat-val">{totalRoutes}</span>
            <span className="re-stat-lbl">Routes</span>
          </div>
          <div className="re-stat">
            <span className="re-stat-val">{servedAirports.size}</span>
            <span className="re-stat-lbl">Airports</span>
          </div>
        </div>
      </div>

      <div className="re-filters">
        <button
          className={`re-filter-btn ${selectedAirline === 'all' ? 're-filter-btn--active' : ''}`}
          onClick={() => { setSelectedAirline('all'); setSelectedAirport(null) }}
        >
          All Airlines
        </button>
        {airlineNames.map(name => {
          const color = AIRLINE_COLORS[name] || DEFAULT_COLOR
          return (
            <button
              key={name}
              className={`re-filter-btn ${selectedAirline === name ? 're-filter-btn--active' : ''}`}
              style={{ '--filter-color': color.dot, '--filter-bg': color.bg, '--filter-border': color.border }}
              onClick={() => { setSelectedAirline(name); setSelectedAirport(null) }}
            >
              <span className="re-filter-dot" style={{ background: color.dot }} />
              {name}
            </button>
          )
        })}
      </div>

      <div className="re-body">
        <div className="re-map-wrap">
          <MapContainer center={[-2.5, 115]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <FitAll airports={displayAirports} />

            {routes.map((route, i) => {
              const from = airportMap[route.from]
              const to = airportMap[route.to]
              if (!from || !to) return null
              const color = (AIRLINE_COLORS[route.airline] || DEFAULT_COLOR).dot
              return (
                <Polyline
                  key={`${route.from}-${route.to}-${route.airline}-${i}`}
                  positions={[[from.lat, from.lon], [to.lat, to.lon]]}
                  pathOptions={{ color, weight: 2, opacity: 0.6, dashArray: '6 4' }}
                />
              )
            })}

            {displayAirports.map(a => (
              <Marker
                key={a.icao}
                position={[a.lat, a.lon]}
                icon={createAirportMarker(a.icao, connectionCounts[a.icao] || 0, selectedAirport === a.icao)}
                eventHandlers={{ click: () => setSelectedAirport(a.icao === selectedAirport ? null : a.icao) }}
              />
            ))}
          </MapContainer>
        </div>

        {selectedAirport && (
          <div className="re-sidebar">
            <div className="re-sidebar-header">
              <div>
                <span className="re-sidebar-icao">{selectedAirport}</span>
                <span className="re-sidebar-city">{airportMap[selectedAirport]?.city}</span>
              </div>
              <button className="re-sidebar-close" onClick={() => setSelectedAirport(null)}>✕</button>
            </div>
            <div className="re-sidebar-routes">
              {selectedAirportRoutes.length === 0 ? (
                <p className="re-sidebar-empty">No routes from this airport</p>
              ) : (
                selectedAirportRoutes.map((route, i) => {
                  const dest = airportMap[route.to]
                  const color = AIRLINE_COLORS[route.airline] || DEFAULT_COLOR
                  return (
                    <div
                      key={`${route.to}-${route.airline}-${i}`}
                      className="re-route-item"
                      onClick={() => {
                        const fromApt = airportMap[route.from]
                        const toApt = airportMap[route.to]
                        if (fromApt && toApt) {
                          setDetailFlight({
                            flight_number: `${AIRLINE_ROUTES[route.airline]?.flightPrefix || 'XX'}${100 + i}`,
                            airline: route.airline,
                            departure: route.from,
                            departure_city: fromApt.city,
                            arrival: route.to,
                            arrival_city: dest?.city || route.to,
                            departure_time: '—',
                            arrival_time: '—',
                            block_time: route.type === 'short' ? 1.2 : route.type === 'medium' ? 2 : 3.5,
                            distance: Math.round(Math.sqrt((fromApt.lat - toApt.lat) ** 2 + (fromApt.lon - toApt.lon) ** 2) * 60),
                            date: new Date().toISOString().split('T')[0],
                            status: 'Scheduled',
                          })
                        }
                      }}
                    >
                      <span className="re-route-dot" style={{ background: color.dot }} />
                      <div className="re-route-info">
                        <span className="re-route-dest">{route.to}</span>
                        <span className="re-route-city">{dest?.city || '—'}</span>
                      </div>
                      <span className="re-route-type" style={{ background: `${color.dot}18`, color: color.dot, borderColor: `${color.dot}30` }}>
                        {route.type}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {detailFlight && (
        <FlightDetailModal
          flight={detailFlight}
          airports={LOCAL_AIRPORTS}
          onClose={() => setDetailFlight(null)}
        />
      )}
    </div>
  )
}
