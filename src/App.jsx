import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useAirports } from './hooks/useAirports'
import { useSchedules } from './hooks/useSchedules'
import AuthView from './components/AuthView'
import Sidebar from './components/Sidebar'
import CalendarView from './components/CalendarView'
import FlightPlanner from './components/FlightPlanner'
import AirportTable from './components/AirportTable'
import HistoryView from './components/HistoryView'

export default function App() {
  const { session, loading, authLoading, captainName, signIn, signUp, signOut } = useAuth()
  const { airports, loading: airportsLoading } = useAirports(session)
  const { schedules, addSchedules, deleteSchedulesByDate, clearAll } = useSchedules(session)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState('planner')
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState(null)
  const [previewLegs, setPreviewLegs] = useState([])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleGenerate = async (legs) => {
    setGenerating(true)
    const { error, data } = await addSchedules(legs)
    setGenerating(false)
    if (error) {
      showToast(`Error: ${error.message || error}`, 'error')
    } else {
      showToast(`Successfully generated ${data.length} flight legs!`, 'success')
      setPreviewLegs([])
      setActiveMenu('myschedule')
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading Dispatch UI...</p>
      </div>
    )
  }

  if (!session) {
    return <AuthView onSignIn={signIn} onSignUp={signUp} loading={authLoading} />
  }

  return (
    <div className="layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        captainName={captainName}
        onLogout={signOut}
      />

      <main className="main-content">
        <div className="welcome">
          <div className="welcome-bg">
            <div className="welcome-bg-gradient" />
            <div className="welcome-bg-pattern" />
            <div className="welcome-circle welcome-circle--1" />
            <div className="welcome-circle welcome-circle--2" />
            <div className="welcome-circle welcome-circle--3" />
            <div className="welcome-plane">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
            </div>
            <div className="welcome-trail" />
          </div>
          <div className="welcome-content">
            <div className="welcome-greeting">
              <span className="welcome-wave">👋</span>
              <h1 className="welcome-title">Hello, Captain {captainName}</h1>
            </div>
            <p className="welcome-subtitle">Welcome back to your Operations Control Center.</p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <span className="welcome-stat-icon">✈️</span>
                <div>
                  <span className="welcome-stat-value">{schedules.length}</span>
                  <span className="welcome-stat-label">Flights Today</span>
                </div>
              </div>
              <div className="welcome-stat-divider" />
              <div className="welcome-stat">
                <span className="welcome-stat-icon">🛫</span>
                <div>
                  <span className="welcome-stat-value">{new Set(schedules.map(s => s.departure)).size || '—'}</span>
                  <span className="welcome-stat-label">Airports</span>
                </div>
              </div>
              <div className="welcome-stat-divider" />
              <div className="welcome-stat">
                <span className="welcome-stat-icon">⏱️</span>
                <div>
                  <span className="welcome-stat-value">{schedules.reduce((sum, s) => sum + s.block_time, 0).toFixed(1) || '0.0'}h</span>
                  <span className="welcome-stat-label">Block Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeMenu === 'myschedule' && (
          <CalendarView schedules={schedules} />
        )}

        {activeMenu === 'planner' && (
          <FlightPlanner
            airports={airports}
            onGenerate={handleGenerate}
            generating={generating}
            previewLegs={previewLegs}
            onPreviewLegs={setPreviewLegs}
          />
        )}

        {activeMenu === 'airports' && (
          <AirportTable airports={airports} loading={airportsLoading} />
        )}

        {activeMenu === 'history' && (
          <HistoryView
            schedules={schedules}
            onDeleteDate={deleteSchedulesByDate}
            onClearAll={clearAll}
          />
        )}
      </main>

      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
