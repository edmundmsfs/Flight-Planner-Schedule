import { useMemo, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FlightDetailModal from './FlightDetailModal'
import { AIRLINE_DARK_COLORS } from '../utils/airlineColors'

function FitBounds({ bounds }) {
  const map = useMap()
  useEffect(() => {
    if (bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], animate: false })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function createAirportIcon(label, color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px; height: 28px; border-radius: 50%;
        background: ${color};
        display: flex; align-items: center; justify-content: center;
        border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        z-index: 1000;
      ">
        <span style="color:white;font-size:0.5rem;font-weight:800;font-family:system-ui,sans-serif">${label}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function ScheduleMapView({ schedules, airports }) {
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [filterAirline, setFilterAirline] = useState('all')

  const airportMap = useMemo(() => {
    const map = {}
    airports.forEach(a => { map[a.icao] = a })
    return map
  }, [airports])

  const airlines = useMemo(() => [...new Set(schedules.map(s => s.airline))].sort(), [schedules])

  const filtered = useMemo(() => {
    return filterAirline === 'all' ? schedules : schedules.filter(s => s.airline === filterAirline)
  }, [schedules, filterAirline])

  const bounds = useMemo(() => {
    const pts = []
    filtered.forEach(s => {
      const dep = airportMap[s.departure]
      const arr = airportMap[s.arrival]
      if (dep) pts.push([dep.lat, dep.lon])
      if (arr) pts.push([arr.lat, arr.lon])
    })
    return pts
  }, [filtered, airportMap])

  const uniqueAirports = useMemo(() => {
    const set = new Set()
    const result = []
    filtered.forEach(s => {
      if (!set.has(s.departure) && airportMap[s.departure]) {
        set.add(s.departure)
        result.push({ icao: s.departure, city: s.departure_city })
      }
      if (!set.has(s.arrival) && airportMap[s.arrival]) {
        set.add(s.arrival)
        result.push({ icao: s.arrival, city: s.arrival_city })
      }
    })
    return result
  }, [filtered, airportMap])

  const totalBlock = filtered.reduce((sum, s) => sum + s.block_time, 0)
  const totalDist = filtered.reduce((sum, s) => sum + s.distance, 0)

  return (
    <div className="sm">
      <div className="sm-header">
        <div className="sm-header-left">
          <h2 className="sm-title">My Schedule</h2>
          <p className="sm-subtitle">Map view of all scheduled routes</p>
        </div>
        <div className="sm-filters">
          <select value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)} className="sm-filter-select">
            <option value="all">All Airlines</option>
            {airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="sm-map-wrap">
        {bounds.length > 0 ? (
          <MapContainer center={[-2.5, 118]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            <FitBounds bounds={bounds} />
            {filtered.map((s, idx) => {
              const dep = airportMap[s.departure]
              const arr = airportMap[s.arrival]
              if (!dep || !arr) return null
              const color = AIRLINE_DARK_COLORS[s.airline] || '#94a3b8'
              return (
                <div key={idx}>
                  <Polyline
                    positions={[[dep.lat, dep.lon], [arr.lat, arr.lon]]}
                    pathOptions={{ color, weight: 2, opacity: 0.7, dashArray: '6 4' }}
                    eventHandlers={{ click: () => setSelectedFlight(s) }}
                  />
                </div>
              )
            })}
            {uniqueAirports.map((a) => {
              const apt = airportMap[a.icao]
              if (!apt) return null
              return (
                <Marker
                  key={a.icao}
                  position={[apt.lat, apt.lon]}
                  icon={createAirportIcon(a.icao.slice(-2), '#6366f1')}
                />
              )
            })}
          </MapContainer>
        ) : (
          <div className="sm-map-empty">
            <span>🗺️</span>
            <p>No routes to display</p>
          </div>
        )}
      </div>

      <div className="sm-stats">
        <div className="sm-stat">
          <span className="sm-stat-val">{filtered.length}</span>
          <span className="sm-stat-lbl">Flights</span>
        </div>
        <div className="sm-stat-sep" />
        <div className="sm-stat">
          <span className="sm-stat-val">{uniqueAirports.length}</span>
          <span className="sm-stat-lbl">Airports</span>
        </div>
        <div className="sm-stat-sep" />
        <div className="sm-stat">
          <span className="sm-stat-val">{totalBlock.toFixed(1)}h</span>
          <span className="sm-stat-lbl">Block Time</span>
        </div>
        <div className="sm-stat-sep" />
        <div className="sm-stat">
          <span className="sm-stat-val">{totalDist.toLocaleString()}</span>
          <span className="sm-stat-lbl">Total NM</span>
        </div>
      </div>

      {selectedFlight && (
        <FlightDetailModal
          flight={selectedFlight}
          airports={airports || []}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  )
}
