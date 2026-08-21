import { useState, useMemo } from 'react'
import FlightDetailModal from './FlightDetailModal'
import { AIRLINE_COLORS, DEFAULT_COLOR } from '../utils/airlineColors'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDateParts(d) {
  return { year: d.getFullYear(), month: d.getMonth() }
}

const STATUS_CYCLE = ['Scheduled', 'Boarded', 'Departed', 'Arrived', 'Cancelled']

export default function CalendarView({ schedules, airports, onDelete, onUpdate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedFlight, setSelectedFlight] = useState(null)

  const { year, month } = getDateParts(currentDate)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const today = new Date()
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const getSchedulesForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter(s => s.date === dateStr)
  }

  const monthStats = useMemo(() => {
    const { year: y, month: m } = getDateParts(currentDate)
    const monthSchedules = schedules.filter(s => {
      const [sy, sm] = s.date.split('-').map(Number)
      return sy === y && sm === m + 1
    })
    const totalBlock = monthSchedules.reduce((sum, s) => sum + s.block_time, 0)
    const totalDist = monthSchedules.reduce((sum, s) => sum + s.distance, 0)
    const uniqueDays = new Set(monthSchedules.map(s => s.date)).size
    return { flights: monthSchedules.length, blockTime: totalBlock, distance: totalDist, activeDays: uniqueDays }
  }, [schedules, currentDate])

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null) }
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null) }
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDay(today.getDate()) }

  const selectedDaySchedules = selectedDay ? getSchedulesForDay(selectedDay) : []

  return (
    <div className="cal">
      <div className="cal-header">
        <div className="cal-header-left">
          <h2 className="cal-title">My Schedule</h2>
          <p className="cal-subtitle">Track and manage your flight rotations</p>
        </div>
        <button onClick={goToToday} className="cal-today-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Today
        </button>
      </div>

      <div className="cal-layout">
        <div className="cal-main">
          <div className="cal-nav">
            <button onClick={prevMonth} className="cal-nav-btn" aria-label="Previous month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="cal-nav-center">
              <span className="cal-month">{MONTH_NAMES[month]}</span>
              <span className="cal-year">{year}</span>
            </div>
            <button onClick={nextMonth} className="cal-nav-btn" aria-label="Next month">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className="cal-weekdays">
            {DAY_NAMES.map(day => (
              <div key={day} className="cal-weekday">{day}</div>
            ))}
          </div>

          <div className="cal-grid">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1
              const daySchedules = getSchedulesForDay(day)
              const isSelected = selectedDay === day
              const hasFlights = daySchedules.length > 0
              return (
                <div
                  key={day}
                  className={[
                    'cal-cell',
                    isToday(day) ? 'cal-cell--today' : '',
                    isSelected ? 'cal-cell--selected' : '',
                    hasFlights ? 'cal-cell--has-events' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                >
                  <div className="cal-cell-top">
                    <span className={`cal-day-num ${isToday(day) ? 'cal-day-num--today' : ''}`}>
                      {day}
                    </span>
                    {isToday(day) && <span className="cal-today-dot" />}
                  </div>
                  <div className="cal-cell-events">
                    {daySchedules.slice(0, 2).map((s, idx) => {
                      const color = AIRLINE_COLORS[s.airline] || DEFAULT_COLOR
                      return (
                        <div key={idx} className="cal-pip" style={{ background: color.bg, borderLeftColor: color.dot }}>
                          <span className="cal-pip-time">{s.departure_time}</span>
                          <span className="cal-pip-route">{s.departure}→{s.arrival}</span>
                        </div>
                      )
                    })}
                    {daySchedules.length > 2 && (
                      <div className="cal-pip-more">+{daySchedules.length - 2}</div>
                    )}
                  </div>
                  {hasFlights && <div className="cal-cell-dot" style={{ background: (AIRLINE_COLORS[daySchedules[0]?.airline] || DEFAULT_COLOR).dot }} />}
                </div>
              )
            })}
          </div>
        </div>

        <div className={`cal-sidebar ${selectedDay ? 'cal-sidebar--open' : ''}`}>
          {selectedDay ? (
            <div className="cal-detail">
              <div className="cal-detail-header">
                <div>
                  <h3 className="cal-detail-date">{selectedDay} {MONTH_NAMES[month]} {year}</h3>
                  <p className="cal-detail-count">{selectedDaySchedules.length} flight{selectedDaySchedules.length !== 1 ? 's' : ''} scheduled</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="cal-detail-close" aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {selectedDaySchedules.length === 0 ? (
                <div className="cal-detail-empty">
                  <span className="cal-detail-empty-icon">✈️</span>
                  <p>No flights on this day</p>
                </div>
              ) : (
                <div className="cal-detail-list">
                    {selectedDaySchedules.map((s, idx) => {
                      const color = AIRLINE_COLORS[s.airline] || DEFAULT_COLOR
                      return (
                        <div key={idx} className="cal-detail-card" style={{ borderLeftColor: color.dot }} onClick={() => setSelectedFlight(s)}>
                          <div className="cal-detail-card-top">
                          <span className="cal-detail-flight" style={{ color: color.dot }}>{s.flight_number}</span>
                          <div className="cal-detail-card-actions">
                            <button className="cal-card-status-btn" onClick={(e) => {
                              e.stopPropagation()
                              const idx = STATUS_CYCLE.indexOf(s.status || 'Scheduled')
                              const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
                              onUpdate(s.id, { status: next })
                            }} title={`Status: ${s.status || 'Scheduled'}`}>
                              {s.status === 'Cancelled' ? '❌' : s.status === 'Arrived' ? '🟢' : s.status === 'Departed' ? '🛫' : s.status === 'Boarded' ? '🧑‍✈️' : '🔵'}
                            </button>
                            <button className="cal-card-delete-btn" onClick={(e) => {
                              e.stopPropagation()
                              onDelete(s.id)
                            }} title="Delete flight">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="cal-detail-route" onClick={() => setSelectedFlight(s)}>
                          <div className="cal-detail-airport">
                            <span className="cal-detail-time">{s.departure_time}</span>
                            <span className="cal-detail-icao">{s.departure}</span>
                            <span className="cal-detail-city">{s.departure_city}</span>
                          </div>
                          <div className="cal-detail-arrow">
                            <div className="cal-detail-arrow-line" />
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
                            <div className="cal-detail-arrow-line" />
                          </div>
                          <div className="cal-detail-airport">
                            <span className="cal-detail-time">{s.arrival_time}</span>
                            <span className="cal-detail-icao">{s.arrival}</span>
                            <span className="cal-detail-city">{s.arrival_city}</span>
                          </div>
                        </div>
                        <div className="cal-detail-meta">
                          <span className="cal-detail-airline-tag" style={{ background: color.bg, color: color.text }}>{s.airline}</span>
                          <span className={`status-badge status-badge--${(s.status || 'Scheduled').toLowerCase()}`}>{s.status || 'Scheduled'}</span>
                          <span>{s.block_time}h block</span>
                          <span>{s.distance} NM</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="cal-sidebar-empty">
              <div className="cal-sidebar-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p className="cal-sidebar-empty-text">Select a day to view flight details</p>
            </div>
          )}
        </div>
      </div>

      <div className="cal-footer">
        <div className="cal-stat">
          <span className="cal-stat-dot" style={{ background: '#3b82f6' }} />
          <span className="cal-stat-label">{monthStats.flights} flights</span>
        </div>
        <div className="cal-stat">
          <span className="cal-stat-dot" style={{ background: '#22c55e' }} />
          <span className="cal-stat-label">{monthStats.activeDays} active days</span>
        </div>
        <div className="cal-stat">
          <span className="cal-stat-dot" style={{ background: '#f59e0b' }} />
          <span className="cal-stat-label">{monthStats.blockTime.toFixed(1)}h block time</span>
        </div>
        <div className="cal-stat">
          <span className="cal-stat-dot" style={{ background: '#8b5cf6' }} />
          <span className="cal-stat-label">{monthStats.distance.toLocaleString()} NM total</span>
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
