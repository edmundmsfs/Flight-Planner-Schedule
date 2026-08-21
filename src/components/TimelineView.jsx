import { useState, useMemo } from 'react'
import FlightDetailModal from './FlightDetailModal'
import { AIRLINE_COLORS, DEFAULT_COLOR } from '../utils/airlineColors'

const STATUS_CYCLE = ['Scheduled', 'Boarded', 'Departed', 'Arrived', 'Cancelled']

export default function TimelineView({ schedules, airports, onDelete, onUpdate }) {
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [filterAirline, setFilterAirline] = useState('all')

  const airlines = useMemo(() => [...new Set(schedules.map(s => s.airline))].sort(), [schedules])

  const filtered = useMemo(() => {
    const list = filterAirline === 'all' ? schedules : schedules.filter(s => s.airline === filterAirline)
    return [...list].sort((a, b) => a.date.localeCompare(b.date) || a.departure_time.localeCompare(b.departure_time))
  }, [schedules, filterAirline])

  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach(s => {
      if (!map.has(s.date)) map.set(s.date, [])
      map.get(s.date).push(s)
    })
    return map
  }, [filtered])

  const totalBlock = filtered.reduce((sum, s) => sum + s.block_time, 0)
  const totalDist = filtered.reduce((sum, s) => sum + s.distance, 0)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  const isToday = (dateStr) => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return dateStr === today
  }

  return (
    <div className="tl">
      <div className="tl-header">
        <div className="tl-header-left">
          <h2 className="tl-title">My Schedule</h2>
          <p className="tl-subtitle">Timeline view of your flight rotations</p>
        </div>
        <div className="tl-filters">
          <select value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)} className="tl-filter-select">
            <option value="all">All Airlines</option>
            {airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="tl-stats">
        <div className="tl-stat">
          <span className="tl-stat-val">{filtered.length}</span>
          <span className="tl-stat-lbl">Flights</span>
        </div>
        <div className="tl-stat-sep" />
        <div className="tl-stat">
          <span className="tl-stat-val">{grouped.size}</span>
          <span className="tl-stat-lbl">Active Days</span>
        </div>
        <div className="tl-stat-sep" />
        <div className="tl-stat">
          <span className="tl-stat-val">{totalBlock.toFixed(1)}h</span>
          <span className="tl-stat-lbl">Block Time</span>
        </div>
        <div className="tl-stat-sep" />
        <div className="tl-stat">
          <span className="tl-stat-val">{totalDist.toLocaleString()}</span>
          <span className="tl-stat-lbl">Total NM</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="tl-empty">
          <span className="tl-empty-icon">✈️</span>
          <p>No flights scheduled</p>
        </div>
      ) : (
        <div className="tl-list">
          {[...grouped.entries()].map(([date, flights]) => (
            <div key={date} className="tl-day-group">
              <div className="tl-day-header">
                <div className={`tl-day-dot ${isToday(date) ? 'tl-day-dot--today' : ''}`} />
                <span className="tl-day-date">{formatDate(date)}</span>
                <span className="tl-day-count">{flights.length} flight{flights.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="tl-day-flights">
                {flights.map((s, idx) => {
                  const color = AIRLINE_COLORS[s.airline] || DEFAULT_COLOR
                  return (
                    <div key={idx} className="tl-card" onClick={() => setSelectedFlight(s)}>
                      <div className="tl-card-time-col">
                        <span className="tl-card-dep-time">{s.departure_time}</span>
                        <div className="tl-card-line" />
                        <span className="tl-card-arr-time">{s.arrival_time}</span>
                      </div>
                      <div className="tl-card-body">
                        <div className="tl-card-top">
                          <span className="tl-card-flight" style={{ color: color.dot }}>{s.flight_number}</span>
                          <span className="tl-card-tag" style={{ background: color.bg, color: color.text }}>{s.airline}</span>
                          <span className={`status-badge status-badge--${(s.status || 'Scheduled').toLowerCase()}`}>{s.status || 'Scheduled'}</span>
                          <div className="tl-card-actions">
                            <button className="tl-action-btn" onClick={(e) => {
                              e.stopPropagation()
                              const curIdx = STATUS_CYCLE.indexOf(s.status || 'Scheduled')
                              const next = STATUS_CYCLE[(curIdx + 1) % STATUS_CYCLE.length]
                              onUpdate(s.id, { status: next })
                            }} title={`Status: ${s.status || 'Scheduled'}`}>
                              {s.status === 'Cancelled' ? '❌' : s.status === 'Arrived' ? '🟢' : s.status === 'Departed' ? '🛫' : s.status === 'Boarded' ? '🧑‍✈️' : '🔵'}
                            </button>
                            <button className="tl-action-btn tl-action-btn--danger" onClick={(e) => {
                              e.stopPropagation()
                              onDelete(s.id)
                            }} title="Delete flight">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="tl-card-route">
                          <div className="tl-card-airport">
                            <span className="tl-card-icao">{s.departure}</span>
                            <span className="tl-card-city">{s.departure_city}</span>
                          </div>
                          <div className="tl-card-route-arrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                            </svg>
                          </div>
                          <div className="tl-card-airport">
                            <span className="tl-card-icao">{s.arrival}</span>
                            <span className="tl-card-city">{s.arrival_city}</span>
                          </div>
                        </div>
                        <div className="tl-card-meta">
                          <span>{s.block_time}h</span>
                          <span>·</span>
                          <span>{s.distance} NM</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

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
