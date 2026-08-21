import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useAirports } from './hooks/useAirports'
import { useSchedules } from './hooks/useSchedules'
import ErrorBoundary from './components/ErrorBoundary'
import AuthView from './components/AuthView'
import Sidebar from './components/Sidebar'
import CalendarView from './components/CalendarView'
import TimelineView from './components/TimelineView'
import ScheduleMapView from './components/ScheduleMapView'
import FlightPlanner from './components/FlightPlanner'
import AirportTable from './components/AirportTable'
import HistoryView from './components/HistoryView'
import DashboardView from './components/DashboardView'
import RouteExplorer from './components/RouteExplorer'
import WeatherStation from './components/WeatherStation'


export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

function AppContent() {
  const { session, loading, authLoading, captainName, signIn, signUp, signOut } = useAuth()
  const { airports, loading: airportsLoading } = useAirports(session)
  const { schedules, addSchedules, deleteSchedulesByDate, deleteSchedule, updateSchedule, clearAll } = useSchedules(session)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState('myschedule')
  const [scheduleView, setScheduleView] = useState('calendar')
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState(null)
  const [previewLegs, setPreviewLegs] = useState([])
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

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
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
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
              {(() => {
                const today = new Date().toISOString().split('T')[0]
                const todaySchedules = schedules.filter(s => s.date === today)
                return (<>
                  <div className="welcome-stat">
                    <span className="welcome-stat-icon">✈️</span>
                    <div>
                      <span className="welcome-stat-value">{todaySchedules.length}</span>
                      <span className="welcome-stat-label">Flights Today</span>
                    </div>
                  </div>
                  <div className="welcome-stat-divider" />
                  <div className="welcome-stat">
                    <span className="welcome-stat-icon">🛫</span>
                    <div>
                      <span className="welcome-stat-value">{new Set(todaySchedules.map(s => s.departure)).size || '—'}</span>
                      <span className="welcome-stat-label">Airports</span>
                    </div>
                  </div>
                  <div className="welcome-stat-divider" />
                  <div className="welcome-stat">
                    <span className="welcome-stat-icon">⏱️</span>
                    <div>
                      <span className="welcome-stat-value">{todaySchedules.reduce((sum, s) => sum + s.block_time, 0).toFixed(1) || '0.0'}h</span>
                      <span className="welcome-stat-label">Block Time</span>
                    </div>
                  </div>
                </>)
              })()}
            </div>
          </div>
        </div>

        {activeMenu === 'myschedule' && (
          <div className="sched">
            <div className="sched-view-tabs">
              <button className={`sched-view-tab ${scheduleView === 'calendar' ? 'sched-view-tab--active' : ''}`} onClick={() => setScheduleView('calendar')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Calendar
              </button>
              <button className={`sched-view-tab ${scheduleView === 'timeline' ? 'sched-view-tab--active' : ''}`} onClick={() => setScheduleView('timeline')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Timeline
              </button>
              <button className={`sched-view-tab ${scheduleView === 'map' ? 'sched-view-tab--active' : ''}`} onClick={() => setScheduleView('map')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                Map
              </button>
            </div>
            {scheduleView === 'calendar' && <CalendarView schedules={schedules} airports={airports} onDelete={deleteSchedule} onUpdate={updateSchedule} />}
            {scheduleView === 'timeline' && <TimelineView schedules={schedules} airports={airports} onDelete={deleteSchedule} onUpdate={updateSchedule} />}
            {scheduleView === 'map' && <ScheduleMapView schedules={schedules} airports={airports} />}
          </div>
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

        {activeMenu === 'dashboard' && (
          <DashboardView schedules={schedules} />
        )}

        {activeMenu === 'routes' && (
          <RouteExplorer />
        )}

        {activeMenu === 'weather' && (
          <WeatherStation />
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
