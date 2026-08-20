import { useState, useMemo } from 'react'
import { AIRLINES } from '../utils/airlines'
import { generateRotation } from '../utils/flight'
import { getRoutesFromBase, getAirlineDestinations, AIRLINE_ROUTES } from '../utils/airlineRoutes'
import RouteMap from './RouteMap'

const STEPS = ['Airline', 'Parameters', 'Generate']

export default function FlightPlanner({ airports, onGenerate, generating, previewLegs, onPreviewLegs }) {
  const [selectedAirline, setSelectedAirline] = useState('')
  const [baseAirport, setBaseAirport] = useState('')
  const [flightDate, setFlightDate] = useState('')
  const [flightTime, setFlightTime] = useState('')
  const [maxLegs, setMaxLegs] = useState(4)
  const [maxHours, setMaxHours] = useState(4)
  const [maxMinutes, setMaxMinutes] = useState(0)
  const [roundTrip, setRoundTrip] = useState(true)
  const [error, setError] = useState('')

  const completedSteps = [
    !!selectedAirline,
    !!baseAirport && !!flightDate && !!flightTime,
    false,
  ]
  const activeStep = completedSteps[0] ? (completedSteps[1] ? 2 : 1) : 0

  const maxTimeMinutes = maxHours * 60 + maxMinutes
  const hasTimeLimit = maxTimeMinutes > 0
  const hasLegLimit = maxLegs > 0

  const availableRoutes = useMemo(() => {
    if (!selectedAirline || !baseAirport) return []
    return getRoutesFromBase(selectedAirline, baseAirport)
  }, [selectedAirline, baseAirport])

  const airlineDestinations = useMemo(() => {
    if (!selectedAirline) return new Set()
    return getAirlineDestinations(selectedAirline)
  }, [selectedAirline])

  const compatibleAirports = useMemo(() => {
    if (!selectedAirline) return airports
    return airports.filter(a => airlineDestinations.has(a.icao))
  }, [airports, selectedAirline, airlineDestinations])

  const handleGenerate = () => {
    setError('')
    if (!selectedAirline || !baseAirport || !flightDate || !flightTime) {
      setError('Harap lengkapi semua data parameter penerbangan!')
      return
    }
    if (!hasLegLimit && !hasTimeLimit) {
      setError('Atur minimal satu batasan: jumlah leg atau waktu maksimal!')
      return
    }
    if (airports.length === 0) {
      setError('Airport data belum tersedia. Coba lagi nanti.')
      return
    }
    const legs = generateRotation(baseAirport, airports, flightDate, flightTime, selectedAirline, {
      maxLegs,
      maxTimeMinutes: hasTimeLimit ? maxTimeMinutes : Infinity,
      roundTrip,
    })
    if (legs.length === 0) {
      setError(`${selectedAirline} tidak memiliki rute dari ${baseAirport}. Pilih base airport lain.`)
      return
    }
    onPreviewLegs(legs)
  }

  const handleSave = async () => {
    if (previewLegs.length === 0) return
    await onGenerate(previewLegs)
  }

  const handleDiscard = () => {
    onPreviewLegs([])
  }

  return (
    <div className="fp">
      <div className="fp-bg">
        <div className="fp-bg-gradient" />
        <div className="fp-grid-lines" />
        <div className="fp-plane fp-plane--1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
        </div>
        <div className="fp-plane fp-plane--2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
        </div>
        <div className="fp-dots">
          {[...Array(6)].map((_, i) => <span key={i} className="fp-dot" style={{ animationDelay: `${i * 0.8}s` }} />)}
        </div>
      </div>

      <div className="fp-content">
        <div className="fp-header">
          <div className="fp-title-row">
            <h2 className="fp-title">Create New Schedule</h2>
            <span className="fp-badge">Flight Planner</span>
          </div>
          <p className="fp-desc">Define the parameters to generate a new flight rotation.</p>
        </div>

        <div className="fp-progress">
          {STEPS.map((step, i) => (
            <div key={step} className={`fp-progress-step ${i <= activeStep ? 'fp-progress-step--active' : ''} ${completedSteps[i] ? 'fp-progress-step--done' : ''}`}>
              <div className="fp-progress-circle">
                {completedSteps[i] ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="fp-progress-label">{step}</span>
              {i < STEPS.length - 1 && <div className="fp-progress-line" />}
            </div>
          ))}
        </div>

        <div className="fp-card">
          <div className={`fp-step-section ${activeStep >= 0 ? 'fp-step-section--visible' : ''}`}>
            <div className="fp-step-header">
              <span className="fp-step-num">01</span>
              <div>
                <h3 className="fp-step-title">Select Operating Airline</h3>
                <p className="fp-step-hint">Choose the carrier for this rotation</p>
              </div>
            </div>
            <div className="airline-grid">
              {AIRLINES.map((airline) => {
                const isSelected = selectedAirline === airline.name
                const config = AIRLINE_ROUTES[airline.name]
                return (
                  <div
                    key={airline.id}
                    onClick={() => { setSelectedAirline(airline.name); setBaseAirport('') }}
                    className={`airline-card ${isSelected ? 'airline-card--selected' : ''}`}
                  >
                    <div className="airline-card-check">
                      {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                    <div className="airline-card-logo">
                      <img src={airline.logo} alt={airline.name} />
                    </div>
                    <span className="airline-card-name">{airline.name}</span>
                    <span className="airline-card-code">{airline.id}</span>
                    {config && <span className="airline-card-aircraft">{config.aircraftType}</span>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="fp-divider-wrap">
            <div className="fp-divider-line" />
            <div className="fp-divider-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
            </div>
            <div className="fp-divider-line" />
          </div>

          <div className={`fp-step-section ${activeStep >= 1 ? 'fp-step-section--visible' : ''}`}>
            <div className="fp-step-header">
              <span className="fp-step-num">02</span>
              <div>
                <h3 className="fp-step-title">Flight Parameters</h3>
                <p className="fp-step-hint">Set date, time, and home base airport</p>
              </div>
            </div>
            <div className="planner-params-grid">
              <div className="fp-field">
                <label className="fp-field-label">
                  <span className="fp-field-icon">📅</span>
                  Departure Date
                </label>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="fp-field-input"
                />
              </div>
              <div className="fp-field">
                <label className="fp-field-label">
                  <span className="fp-field-icon">🕐</span>
                  Starting Block Time
                </label>
                <input
                  type="time"
                  value={flightTime}
                  onChange={(e) => setFlightTime(e.target.value)}
                  className="fp-field-input"
                />
              </div>
              <div className="fp-field">
                <label className="fp-field-label">
                  <span className="fp-field-icon">🏢</span>
                  Base Airport
                  {selectedAirline && <span className="fp-field-hint">({compatibleAirports.length} served)</span>}
                </label>
                <select
                  value={baseAirport}
                  onChange={(e) => setBaseAirport(e.target.value)}
                  className="fp-field-input fp-field-select"
                >
                  <option value="">{selectedAirline ? `-- Select ${selectedAirline} base --` : '-- Select airline first --'}</option>
                  {compatibleAirports.map(apt => (
                    <option key={apt.icao} value={apt.icao}>{apt.icao} — {apt.city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="fp-config-divider" />

            <div className="planner-params-grid">
              <div className="fp-field">
                <label className="fp-field-label">
                  <span className="fp-field-icon">✈️</span>
                  Max Legs
                </label>
                <div className="fp-stepper">
                  <button
                    type="button"
                    className="fp-stepper-btn"
                    onClick={() => setMaxLegs(Math.max(1, maxLegs - 1))}
                  >−</button>
                  <span className="fp-stepper-value">{maxLegs}</span>
                  <button
                    type="button"
                    className="fp-stepper-btn"
                    onClick={() => setMaxLegs(Math.min(10, maxLegs + 1))}
                  >+</button>
                </div>
                {roundTrip && (
                  <span className="fp-field-hint">→ returns to base at end</span>
                )}
              </div>
              <div className="fp-field">
                <label className="fp-field-label">
                  <span className="fp-field-icon">⏱️</span>
                  Max Flight Time
                </label>
                <div className="fp-time-row">
                  <select
                    value={maxHours}
                    onChange={(e) => setMaxHours(Number(e.target.value))}
                    className="fp-field-input fp-field-select fp-time-select"
                  >
                    {[...Array(13)].map((_, i) => (
                      <option key={i} value={i}>{i}h</option>
                    ))}
                  </select>
                  <select
                    value={maxMinutes}
                    onChange={(e) => setMaxMinutes(Number(e.target.value))}
                    className="fp-field-input fp-field-select fp-time-select"
                  >
                    <option value={0}>00m</option>
                    <option value={15}>15m</option>
                    <option value={30}>30m</option>
                    <option value={45}>45m</option>
                  </select>
                </div>
              </div>
              <div className="fp-field">
                <label className="fp-field-label">
                  <span className="fp-field-icon">🔄</span>
                  Round Trip
                </label>
                <button
                  type="button"
                  className={`fp-toggle ${roundTrip ? 'fp-toggle--on' : ''}`}
                  onClick={() => setRoundTrip(!roundTrip)}
                >
                  <span className="fp-toggle-thumb" />
                  <span className="fp-toggle-label">{roundTrip ? 'ON' : 'OFF'}</span>
                </button>
                <span className="fp-field-hint">{roundTrip ? 'PP only (2 flights)' : 'Random circuit'}</span>
              </div>
            </div>

            {selectedAirline && baseAirport && availableRoutes.length > 0 && (
              <div className="fp-route-preview">
                <div className="fp-route-preview-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  <span>Available routes from {baseAirport}</span>
                </div>
                <div className="fp-route-chips">
                  {availableRoutes.map((route, idx) => (
                    <span key={idx} className="fp-route-chip">
                      {route.to}
                    </span>
                  ))}
                </div>
                <div className="fp-route-summary">
                  <span className="fp-route-summary-item">
                    <strong>{availableRoutes.length}</strong> destinations
                  </span>
                  <span className="fp-route-summary-divider">·</span>
                  <span className="fp-route-summary-item">
                    <strong>{maxLegs}</strong> max legs
                  </span>
                  {hasTimeLimit && (
                    <>
                      <span className="fp-route-summary-divider">·</span>
                      <span className="fp-route-summary-item">
                        <strong>{maxHours}h {String(maxMinutes).padStart(2, '0')}m</strong> max time
                      </span>
                    </>
                  )}
                  <span className="fp-route-summary-divider">·</span>
                  <span className="fp-route-summary-item">
                    {roundTrip ? 'PP (Pulang-Pergi)' : 'Circuit (random chain)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="fp-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          {previewLegs.length === 0 && (
            <button
              onClick={handleGenerate}
              disabled={!selectedAirline || !baseAirport || !flightDate || !flightTime || (!hasLegLimit && !hasTimeLimit)}
              className="fp-generate-btn"
            >
              <span className="fp-generate-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
                Generate Rotation Schedule
              </span>
              <div className="fp-generate-shine" />
            </button>
          )}
        </div>
      </div>

      {previewLegs.length > 0 && (
        <div className="fp-preview">
          <div className="fp-preview-header">
            <h3 className="fp-preview-title">Generated Route Preview</h3>
            <div className="fp-preview-actions">
              <button onClick={handleDiscard} className="fp-preview-btn fp-preview-btn--discard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>
                Re-Generate
              </button>
              <button onClick={handleSave} disabled={generating} className="fp-preview-btn fp-preview-btn--save">
                {generating ? (
                  <><span className="fp-spinner" /> Saving...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Confirm Plan
                  </>
                )}
              </button>
            </div>
          </div>
          <RouteMap legs={previewLegs} airports={airports} />
        </div>
      )}
    </div>
  )
}
