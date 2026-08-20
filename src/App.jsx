import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import mapBg from './assets/mapp.jpg' 

// --- BUSINESS LOGIC ---
function getDistanceNM(lat1, lon1, lat2, lon2) {
  const R = 3440.065;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

function getBlockTime(distanceNM) {
  return ((distanceNM / 450) + 0.5).toFixed(2);
}

// --- MASTER DATA MASKAPAI ---
const AIRLINES = [
  { id: 'QG', name: 'Citilink', logo: 'src/assets/citilimk.png' },
  { id: 'QZ', name: 'AirAsia Indonesia', logo: 'src/assets/aira.jpg' },
  { id: 'ID', name: 'Batik Air Indonesia', logo: 'src/assets/btok.png' },
  { id: 'IP', name: 'Pelita Air', logo: 'src/assets/lita.svg' }
];

// --- MAIN COMPONENT ---
export default function App() {
  // Auth States
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usernameInput, setUsernameInput] = useState('') 
  const [captainName, setCaptainName] = useState('')     
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  // UI & Data States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeMenu, setActiveMenu] = useState('planner')
  const [airports, setAirports] = useState([])
  
  // Form Planner States
  const [baseAirport, setBaseAirport] = useState('')
  const [selectedAirline, setSelectedAirline] = useState('')
  const [flightDate, setFlightDate] = useState('')
  const [flightTime, setFlightTime] = useState('')

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      async function fetchData() {
        const { data: aptData } = await supabase.from('airports').select('*').order('icao', { ascending: true })
        if (aptData) setAirports(aptData)

        const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
        if (profileData && profileData.full_name) {
          setCaptainName(profileData.full_name)
        } else {
          setCaptainName(session.user.email.split('@')[0])
        }
      }
      fetchData()
    }
  }, [session])

  // --- AUTH FUNCTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    if (isLoginMode) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert(error.message)
      } else {
        if (data?.user && usernameInput) {
          await supabase.from('profiles').update({ full_name: usernameInput }).eq('id', data.user.id)
          setCaptainName(usernameInput)
        }
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert(error.message)
      } else {
        if (data?.user && usernameInput) {
          await supabase.from('profiles').update({ full_name: usernameInput }).eq('id', data.user.id)
        }
        alert('Account created successfully! Welcome aboard.')
      }
    }
    setAuthLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCaptainName(''); setEmail(''); setPassword(''); setUsernameInput('')
  }

  const handleGenerateSchedule = () => {
    if(!selectedAirline || !baseAirport || !flightDate || !flightTime) {
      alert("Harap lengkapi semua data parameter penerbangan!");
      return;
    }
    alert(`Memproses Jadwal...\nMaskapai: ${selectedAirline}\nBase: ${baseAirport}\nTanggal: ${flightDate}\nJam Mulai: ${flightTime}`);
  }

  // --- CALENDAR HELPERS ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // --- INLINE STYLES ---
  const layoutStyle = { display: 'flex', height: '100vh', width: '100vw', margin: 0, fontFamily: 'sans-serif', overflow: 'hidden' }
  const sidebarStyle = { width: isSidebarOpen ? '260px' : '70px', backgroundColor: '#0f172a', color: '#ffffff', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 10 }
  const menuItemStyle = (menuId) => ({ padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: activeMenu === menuId ? '#1e293b' : 'transparent', borderLeft: activeMenu === menuId ? '4px solid #3b82f6' : '4px solid transparent', transition: 'background 0.2s', whiteSpace: 'nowrap', overflow: 'hidden' })

  // ================= VIEW: MODERN LOGIN/REGISTER =================
  if (!session) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', backgroundColor: '#ffffff' }}>
        <div style={{ flex: '1', minWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 5%', backgroundColor: '#ffffff', zIndex: 2, boxShadow: '5px 0 15px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <span style={{ display: 'inline-block', padding: '8px 12px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '16px' }}>✈️ EFB Access</span>
              <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: '#0f172a' }}>{isLoginMode ? 'Welcome back' : 'Create an account'}</h2>
              <p style={{ color: '#64748b', margin: 0 }}>{isLoginMode ? 'Please enter your credentials to access the planner.' : 'Join the dispatch center to save your rotations.'}</p>
            </div>
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Captain Name</label>
                <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="e.g. Maverick" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="captain@virtual.com" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} />
              </div>
              <button type="submit" disabled={authLoading} style={{ width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
                {authLoading ? 'Authenticating...' : (isLoginMode ? 'Sign In to Dashboard' : 'Create Dispatch Account')}
              </button>
            </form>
            <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
                {isLoginMode ? "Don't have access yet? " : "Already have an account? "}
                <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', padding: 0 }}>
                  {isLoginMode ? 'Request Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
        <div style={{ flex: '2.5', backgroundImage: `url(${mapBg})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', backgroundColor: '#f1f5f9' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom left, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 60%)' }}></div>
          <div style={{ position: 'relative', zIndex: 1, padding: '50px 60px', color: '#ffffff', textAlign: 'right' }}>
            <h1 style={{ fontSize: '2.4rem', margin: '0 0 10px 0', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: '1.2', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>Operations<br/>Control Center.</h1>
            <p style={{ fontSize: '1rem', maxWidth: '380px', lineHeight: '1.6', color: '#e2e8f0', marginLeft: 'auto', marginBottom: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Manage your fleet rotations, calculate precise block times, and streamline your virtual airline operations from a centralized dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  // ================= VIEW: MAIN DASHBOARD =================
  return (
    <div style={layoutStyle}>
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
          {isSidebarOpen && <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Dispatch UI</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', padding: 0 }}>☰</button>
        </div>

        {isSidebarOpen && (
          <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #1e293b' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Logged in as,</p>
            <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1rem', color: '#60a5fa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Capt. {captainName || 'Pilot'}
            </p>
          </div>
        )}

        <div style={{ flex: 1, marginTop: '10px' }}>
          <div style={menuItemStyle('myschedule')} onClick={() => setActiveMenu('myschedule')}>
            <span style={{ fontSize: '1.2rem' }}>📅</span>{isSidebarOpen && <span>My Schedule</span>}
          </div>
          <div style={menuItemStyle('planner')} onClick={() => setActiveMenu('planner')}>
            <span style={{ fontSize: '1.2rem' }}>✈️</span>{isSidebarOpen && <span>Flight Planner</span>}
          </div>
          <div style={menuItemStyle('airports')} onClick={() => setActiveMenu('airports')}>
            <span style={{ fontSize: '1.2rem' }}>🏢</span>{isSidebarOpen && <span>Master Airports</span>}
          </div>
          <div style={menuItemStyle('history')} onClick={() => setActiveMenu('history')}>
            <span style={{ fontSize: '1.2rem' }}>🗄️</span>{isSidebarOpen && <span>History Log</span>}
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', fontWeight: 'bold' }}>
            <span>🚪</span>{isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '40px', overflowY: 'auto' }}>
        
        <div style={{ marginBottom: '35px' }}>
          <h1 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: '800' }}>
            Hello, Captain {captainName} 👋
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.05rem' }}>
            Welcome back to your Operations Control Center.
          </p>
        </div>

        {/* ================= VIEW: MY SCHEDULE (CALENDAR) ================= */}
        {activeMenu === 'myschedule' && (
          <div style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.6rem' }}>My Schedule</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>◀</button>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a', minWidth: '150px', textAlign: 'center' }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>▶</button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem' }}>{day}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, auto)' }}>
                {[...Array(firstDayOfMonth)].map((_, i) => (
                  <div key={`empty-${i}`} style={{ borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fdfdfd' }}></div>
                ))}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                  return (
                    <div key={day} style={{ padding: '10px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: isToday ? '#eff6ff' : 'white', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => { if (!isToday) e.currentTarget.style.backgroundColor = '#f8fafc' }} onMouseOut={(e) => { if (!isToday) e.currentTarget.style.backgroundColor = 'white' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: isToday ? '#3b82f6' : '#334155', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{day}</span>
                        {isToday && <span style={{ fontSize: '0.7rem', backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Today</span>}
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW: FLIGHT PLANNER (SPACING FIXED) ================= */}
        {activeMenu === 'planner' && (
          <div style={{ maxWidth: '900px' }}>
            <h2 style={{ color: '#0f172a', margin: '0 0 5px 0', fontSize: '1.6rem' }}>Create New Schedule</h2>
            <p style={{ color: '#64748b', margin: '0 0 25px 0' }}>Define the parameters to generate a new flight rotation.</p>
            
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', padding: '30px' }}>
              
              {/* STEP 1: AIRLINE SELECTION */}
              <div style={{ marginBottom: '35px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#0f172a', marginBottom: '15px', fontSize: '1.1rem' }}>
                  <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem' }}>1</span>
                  Select Operating Airline
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                  {AIRLINES.map((airline) => {
                    const isSelected = selectedAirline === airline.name;
                    return (
                      <div 
                        key={airline.id}
                        onClick={() => setSelectedAirline(airline.name)}
                        style={{ 
                          border: `2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                          backgroundColor: isSelected ? '#eff6ff' : 'white',
                          borderRadius: '12px',
                          padding: '20px 15px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ height: '50px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                          <img 
                            src={airline.logo} 
                            alt={airline.name} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                          />
                        </div>
                        <span style={{ fontWeight: '600', color: isSelected ? '#1e3a8a' : '#475569', fontSize: '0.95rem', textAlign: 'center' }}>
                          {airline.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', marginBottom: '35px' }} />

              {/* STEP 2: FLIGHT PARAMETERS (FIXED SPACING GRID) */}
              <div style={{ marginBottom: '35px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#0f172a', marginBottom: '15px', fontSize: '1.1rem' }}>
                  <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem' }}>2</span>
                  Flight Parameters
                </label>
                
                {/* Diubah menjadi 3 kolom yang sama lebar dengan gap 20px yang rapi */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  
                  {/* Date Input */}
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Departure Date</label>
                    <input 
                      type="date" 
                      value={flightDate}
                      onChange={(e) => setFlightDate(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Time Input */}
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Starting Block Time</label>
                    <input 
                      type="time" 
                      value={flightTime}
                      onChange={(e) => setFlightTime(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Base Airport Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Base Airport</label>
                    <select 
                      value={baseAirport} 
                      onChange={(e) => setBaseAirport(e.target.value)} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif', cursor: 'pointer', boxSizing: 'border-box' }}
                    >
                      <option value="">-- Select Base --</option>
                      {airports.map(apt => (
                        <option key={apt.icao} value={apt.icao}>{apt.icao} - {apt.city}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                onClick={handleGenerateSchedule}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                  transition: 'transform 0.1s, boxShadow 0.1s'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Generate Rotation Schedule ✨
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW: MASTER AIRPORTS ================= */}
        {activeMenu === 'airports' && (
          <div style={{ maxWidth: '900px' }}>
            <h2 style={{ color: '#0f172a', margin: '0 0 15px 0', fontSize: '1.5rem' }}>Master Airports Database</h2>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ICAO</th>
                    <th style={{ padding: '16px 24px', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Airport Name</th>
                    <th style={{ padding: '16px 24px', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City</th>
                    <th style={{ padding: '16px 24px', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Runway (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {airports.map((apt) => (
                    <tr key={apt.icao} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#0f172a' }}>{apt.icao}</td>
                      <td style={{ padding: '16px 24px', color: '#334155' }}>{apt.name}</td>
                      <td style={{ padding: '16px 24px', color: '#334155' }}>{apt.city}</td>
                      <td style={{ padding: '16px 24px', color: '#334155' }}>{apt.runway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIEW: HISTORY ================= */}
        {activeMenu === 'history' && (
          <div>
            <h2 style={{ color: '#0f172a', margin: '0 0 15px 0', fontSize: '1.5rem' }}>History Log</h2>
            <p style={{ color: '#64748b' }}>This module is currently under development.</p>
          </div>
        )}

      </div>
    </div>
  )
}