export default function Sidebar({ isOpen, onToggle, activeMenu, onMenuChange, captainName, onLogout, darkMode, onToggleDarkMode }) {
  const menus = [
    { id: 'myschedule', icon: '📅', label: 'My Schedule' },
    { id: 'planner', icon: '✈️', label: 'Flight Planner' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'routes', icon: '🗺️', label: 'Route Explorer' },
    { id: 'weather', icon: '🌦️', label: 'Weather Station' },
    { id: 'airports', icon: '🏢', label: 'Master Airports' },
    { id: 'history', icon: '🗄️', label: 'History Log' },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar-header">
        {isOpen && <span className="sidebar-brand">Dispatch UI</span>}
        <button onClick={onToggle} className="sidebar-toggle" aria-label="Toggle sidebar">
          ☰
        </button>
      </div>

      {isOpen && (
        <div className="sidebar-user">
          <p className="sidebar-user-label">Logged in as,</p>
          <p className="sidebar-user-name">Capt. {captainName || 'Pilot'}</p>
        </div>
      )}

      <nav className="sidebar-nav">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className={`sidebar-menu-item ${activeMenu === menu.id ? 'sidebar-menu-item--active' : ''}`}
            onClick={() => onMenuChange(menu.id)}
          >
            <span className="sidebar-menu-icon">{menu.icon}</span>
            {isOpen && <span>{menu.label}</span>}
          </div>
        ))}

        {isOpen && (
          <div className="sidebar-footer-inline">
            <button onClick={onToggleDarkMode} className="sidebar-theme-toggle" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {darkMode ? '☀️' : '🌙'}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button onClick={onLogout} className="btn-logout">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {!isOpen && (
        <div className="sidebar-footer">
          <button onClick={onToggleDarkMode} className="sidebar-theme-toggle" title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={onLogout} className="btn-logout" title="Logout">
            <span>🚪</span>
          </button>
        </div>
      )}
    </aside>
  )
}
