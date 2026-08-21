import { useMemo } from 'react'
import { AIRLINE_COLORS, DEFAULT_COLOR } from '../utils/airlineColors'

const STATUSES = ['Scheduled', 'Boarded', 'Departed', 'Arrived', 'Cancelled']

export default function DashboardView({ schedules }) {
  const stats = useMemo(() => {
    if (schedules.length === 0) return null

    const totalBlock = schedules.reduce((s, f) => s + f.block_time, 0)
    const totalDist = schedules.reduce((s, f) => s + f.distance, 0)
    const uniqueAirports = new Set([...schedules.map(s => s.departure), ...schedules.map(s => s.arrival)])
    const uniqueDays = new Set(schedules.map(s => s.date))

    const byAirline = {}
    schedules.forEach(s => {
      if (!byAirline[s.airline]) byAirline[s.airline] = { flights: 0, blockTime: 0, distance: 0 }
      byAirline[s.airline].flights++
      byAirline[s.airline].blockTime += s.block_time
      byAirline[s.airline].distance += s.distance
    })

    const byRoute = {}
    schedules.forEach(s => {
      const key = `${s.departure}→${s.arrival}`
      if (!byRoute[key]) byRoute[key] = { count: 0, dep: s.departure, arr: s.arrival, depCity: s.departure_city, arrCity: s.arrival_city }
      byRoute[key].count++
    })
    const topRoutes = Object.values(byRoute).sort((a, b) => b.count - a.count).slice(0, 8)

    const byDay = {}
    schedules.forEach(s => {
      if (!byDay[s.date]) byDay[s.date] = 0
      byDay[s.date]++
    })
    const maxDayFlights = Math.max(...Object.values(byDay), 1)
    const recentDays = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14).reverse()

    const byStatus = {}
    STATUSES.forEach(st => { byStatus[st] = 0 })
    schedules.forEach(s => { byStatus[s.status || 'Scheduled'] = (byStatus[s.status || 'Scheduled'] || 0) + 1 })

    return {
      totalFlights: schedules.length,
      totalBlock,
      totalDist,
      uniqueAirports: uniqueAirports.size,
      activeDays: uniqueDays.size,
      byAirline,
      topRoutes,
      recentDays,
      maxDayFlights,
      byStatus,
    }
  }, [schedules])

  const airlineEntries = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.byAirline).sort((a, b) => b[1].flights - a[1].flights)
  }, [stats])

  const maxAirlineFlights = airlineEntries.length > 0 ? airlineEntries[0][1].flights : 1

  const donutSegments = useMemo(() => {
    if (!stats || airlineEntries.length === 0) return []
    const circumference = 282.7
    let runningOffset = 0
    return airlineEntries.map(([name]) => {
      const color = AIRLINE_COLORS[name] || DEFAULT_COLOR
      const data = stats.byAirline[name]
      const pct = (data.flights / stats.totalFlights) * 100
      const dash = (pct / 100) * circumference
      const gap = circumference - dash
      const seg = { name, color: color.dot, dash, gap, offset: runningOffset }
      runningOffset += dash
      return seg
    })
  }, [airlineEntries, stats])

  if (!stats) {
    return (
      <div className="db">
        <div className="db-header">
          <h2 className="db-title">Dashboard</h2>
          <p className="db-subtitle">Flight statistics and analytics</p>
        </div>
        <div className="db-empty">
          <span className="db-empty-icon">📊</span>
          <p>No flight data to display</p>
          <p className="db-empty-sub">Generate some flights first to see stats here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="db">
      <div className="db-header">
        <h2 className="db-title">Dashboard</h2>
        <p className="db-subtitle">Flight statistics and analytics</p>
      </div>

      <div className="db-kpi-row">
        <div className="db-kpi">
          <div className="db-kpi-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>✈️</div>
          <div className="db-kpi-body">
            <span className="db-kpi-val">{stats.totalFlights}</span>
            <span className="db-kpi-lbl">Total Flights</span>
          </div>
        </div>
        <div className="db-kpi">
          <div className="db-kpi-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>⏱️</div>
          <div className="db-kpi-body">
            <span className="db-kpi-val">{stats.totalBlock.toFixed(1)}h</span>
            <span className="db-kpi-lbl">Block Time</span>
          </div>
        </div>
        <div className="db-kpi">
          <div className="db-kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>📏</div>
          <div className="db-kpi-body">
            <span className="db-kpi-val">{stats.totalDist.toLocaleString()}</span>
            <span className="db-kpi-lbl">Total NM</span>
          </div>
        </div>
        <div className="db-kpi">
          <div className="db-kpi-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>🏢</div>
          <div className="db-kpi-body">
            <span className="db-kpi-val">{stats.uniqueAirports}</span>
            <span className="db-kpi-lbl">Airports</span>
          </div>
        </div>
        <div className="db-kpi">
          <div className="db-kpi-icon" style={{ background: '#fce7f3', color: '#db2777' }}>📅</div>
          <div className="db-kpi-body">
            <span className="db-kpi-val">{stats.activeDays}</span>
            <span className="db-kpi-lbl">Active Days</span>
          </div>
        </div>
      </div>

      <div className="db-grid-2">
        <div className="db-card">
          <h3 className="db-card-title">Flights by Airline</h3>
          <div className="db-bars">
            {airlineEntries.map(([name, data]) => {
              const color = AIRLINE_COLORS[name] || DEFAULT_COLOR
              const pct = (data.flights / maxAirlineFlights) * 100
              return (
                <div key={name} className="db-bar-row">
                  <div className="db-bar-label">
                    <span className="db-bar-dot" style={{ background: color.dot }} />
                    <span className="db-bar-name">{name}</span>
                  </div>
                  <div className="db-bar-track">
                    <div className="db-bar-fill" style={{ width: `${pct}%`, background: color.dot }} />
                  </div>
                  <span className="db-bar-val">{data.flights}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="db-card">
          <h3 className="db-card-title">Top Routes</h3>
          <div className="db-routes">
            {stats.topRoutes.map((r, i) => (
              <div key={i} className="db-route-row">
                <span className="db-route-rank">#{i + 1}</span>
                <div className="db-route-info">
                  <span className="db-route-path">{r.dep} → {r.arr}</span>
                  <span className="db-route-cities">{r.depCity} — {r.arrCity}</span>
                </div>
                <span className="db-route-count">{r.count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="db-grid-2">
        <div className="db-card">
          <h3 className="db-card-title">Flights per Day (last 14 days)</h3>
          <div className="db-chart">
            {stats.recentDays.map(([date, count]) => {
              const pct = (count / stats.maxDayFlights) * 100
              const short = date.slice(5)
              return (
                <div key={date} className="db-chart-col">
                  <div className="db-chart-bar-wrap">
                    <div className="db-chart-bar" style={{ height: `${pct}%` }}>
                      <span className="db-chart-val">{count}</span>
                    </div>
                  </div>
                  <span className="db-chart-label">{short}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="db-card">
          <h3 className="db-card-title">Airline Breakdown</h3>
          <div className="db-donut-area">
            <svg viewBox="0 0 120 120" className="db-donut">
              {donutSegments.map((seg) => (
                <circle
                  key={seg.name}
                  cx="60" cy="60" r="45"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={`${seg.dash} ${seg.gap}`}
                  strokeDashoffset={-seg.offset}
                  strokeLinecap="butt"
                />
              ))}
              <text x="60" y="56" textAnchor="middle" className="db-donut-total">{stats.totalFlights}</text>
              <text x="60" y="72" textAnchor="middle" className="db-donut-label">flights</text>
            </svg>
            <div className="db-donut-legend">
              {airlineEntries.map(([name, data]) => {
                const color = AIRLINE_COLORS[name] || DEFAULT_COLOR
                const pct = ((data.flights / stats.totalFlights) * 100).toFixed(1)
                return (
                  <div key={name} className="db-legend-item">
                    <span className="db-legend-dot" style={{ background: color.dot }} />
                    <span className="db-legend-name">{name}</span>
                    <span className="db-legend-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="db-card db-card--full">
        <h3 className="db-card-title">Airline Details</h3>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>Airline</th>
                <th>Flights</th>
                <th>Block Time</th>
                <th>Distance</th>
                <th>Avg Block</th>
              </tr>
            </thead>
            <tbody>
              {airlineEntries.map(([name, data]) => {
                const color = AIRLINE_COLORS[name] || DEFAULT_COLOR
                const avg = (data.blockTime / data.flights).toFixed(1)
                return (
                  <tr key={name}>
                    <td>
                      <div className="db-tbl-airline">
                        <span className="db-tbl-dot" style={{ background: color.dot }} />
                        {name}
                      </div>
                    </td>
                    <td>{data.flights}</td>
                    <td>{data.blockTime.toFixed(1)}h</td>
                    <td>{data.distance.toLocaleString()} NM</td>
                    <td>{avg}h</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
