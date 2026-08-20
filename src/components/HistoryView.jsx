import { useState } from 'react'

export default function HistoryView({ schedules, onDeleteDate, onClearAll }) {
  const [confirmClear, setConfirmClear] = useState(false)

  const groupedByDate = schedules.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    await onClearAll()
    setConfirmClear(false)
  }

  const handleDeleteDate = async (dateStr) => {
    await onDeleteDate(dateStr)
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h2 className="section-title">History Log</h2>
          <p className="section-subtitle">View and manage all your generated flight schedules.</p>
        </div>
        {schedules.length > 0 && (
          <button
            onClick={handleClearAll}
            className={`btn-danger ${confirmClear ? 'btn-danger--confirm' : ''}`}
          >
            {confirmClear ? 'Confirm Delete All?' : 'Clear All Schedules'}
          </button>
        )}
      </div>

      {sortedDates.length === 0 ? (
        <div className="empty-state-card">
          <p className="empty-state-icon">📋</p>
          <p className="empty-state-text">No schedules generated yet.</p>
          <p className="empty-state-hint">Go to Flight Planner to create your first rotation.</p>
        </div>
      ) : (
        <div className="history-list">
          {sortedDates.map(dateStr => {
            const legs = groupedByDate[dateStr]
            const totalBlock = legs.reduce((sum, l) => sum + l.block_time, 0)
            const totalDist = legs.reduce((sum, l) => sum + l.distance, 0)
            return (
              <div key={dateStr} className="history-date-card">
                <div className="history-date-header">
                  <div>
                    <h3 className="history-date-title">{dateStr}</h3>
                    <p className="history-date-meta">
                      {legs.length} flights &middot; {totalBlock.toFixed(1)}h total block &middot; {totalDist.toLocaleString()} NM
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDate(dateStr)}
                    className="btn-danger btn-danger--small"
                  >
                    Delete
                  </button>
                </div>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Block</th>
                      <th>Dist (NM)</th>
                      <th>Airline</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legs.map((leg, idx) => (
                      <tr key={idx}>
                        <td className="history-flight-num">{leg.flight_number}</td>
                        <td>{leg.departure} → {leg.arrival}</td>
                        <td>{leg.departure_time}</td>
                        <td>{leg.arrival_time}</td>
                        <td>{leg.block_time}h</td>
                        <td>{leg.distance}</td>
                        <td>{leg.airline}</td>
                        <td>
                          <span className={`status-badge status-badge--${leg.status.toLowerCase()}`}>
                            {leg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
