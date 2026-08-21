const API_KEY = import.meta.env.VITE_AIRLABS_API_KEY
const BASE_URL = 'https://airlabs.co/api/v9'
const CACHE_PREFIX = 'airlabs_routes_'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

const AIRLINE_IATA_MAP = {
  'Pelita Air': 'IP',
  'Citilink': 'QG',
  'AirAsia Indonesia': 'QZ',
  'Batik Air Indonesia': 'ID',
}

function getCached(airlineIata) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + airlineIata)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + airlineIata)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(airlineIata, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + airlineIata, JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  } catch {
    // localStorage full or blocked
  }
}

export function getIataCode(airlineName) {
  return AIRLINE_IATA_MAP[airlineName] || null
}

export async function fetchAirlineRoutes(airlineName, { signal } = {}) {
  const iata = AIRLINE_IATA_MAP[airlineName]
  if (!iata || !API_KEY) return []

  const cached = getCached(iata)
  if (cached) return cached

  const allRoutes = []
  let offset = 0
  const limit = 50

  while (true) {
    const params = new URLSearchParams({
      api_key: API_KEY,
      airline_iata: iata,
      limit: String(limit),
      offset: String(offset),
      _fields: 'airline_iata,airline_icao,flight_number,flight_iata,dep_iata,dep_icao,arr_iata,arr_icao,duration,days,aircraft_icao',
    })

    const res = await fetch(`${BASE_URL}/routes?${params}`, { signal })
    if (!res.ok) throw new Error(`AirLabs API error: ${res.status}`)

    const json = await res.json()
    const items = json.response || []
    allRoutes.push(...items)

    if (!json.request?.has_more || items.length === 0) break
    offset += limit
    if (offset >= 500) break
  }

  const transformed = transformRoutes(allRoutes, iata)
  setCache(iata, transformed)
  return transformed
}

function transformRoutes(apiRoutes, iata) {
  const routeMap = new Map()

  apiRoutes.forEach(r => {
    if (!r.dep_icao || !r.arr_icao) return

    const key = `${r.dep_icao}-${r.arr_icao}`
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        from: r.dep_icao,
        to: r.arr_icao,
        fromIata: r.dep_iata,
        toIata: r.arr_iata,
        type: classifyRoute(r.duration || 60),
        flights: [],
        duration: r.duration || 60,
        aircraft: r.aircraft_icao,
      })
    }

    const route = routeMap.get(key)
    route.flights.push({
      flightNumber: r.flight_iata || `${iata}${r.flight_number}`,
      number: r.flight_number,
      days: r.days || [],
      duration: r.duration,
    })
  })

  return [...routeMap.values()]
}

function classifyRoute(durationMin) {
  if (durationMin < 90) return 'short'
  if (durationMin < 150) return 'medium'
  return 'long'
}

export function mergeWithStaticRoutes(realRoutes, staticRoutes) {
  const realMap = new Map()
  realRoutes.forEach(r => {
    const key = `${r.from}-${r.to}`
    realMap.set(key, r)
  })

  const merged = staticRoutes.map(sr => {
    const key = `${sr.from}-${sr.to}`
    const real = realMap.get(key)
    if (real) {
      return { ...sr, flights: real.flights, realData: true, duration: real.duration }
    }
    return sr
  })

  realRoutes.forEach(rr => {
    const key = `${rr.from}-${rr.to}`
    const exists = staticRoutes.some(sr => `${sr.from}-${sr.to}` === key)
    if (!exists) {
      merged.push({ ...rr, realData: true })
    }
  })

  return merged
}

export function getRealFlightsForRoute(realRoutes, fromIcao, toIcao) {
  const route = realRoutes.find(r => r.from === fromIcao && r.to === toIcao)
  return route ? route.flights : []
}

export function clearRoutesCache(airlineName) {
  const iata = AIRLINE_IATA_MAP[airlineName]
  if (iata) localStorage.removeItem(CACHE_PREFIX + iata)
}

export function clearAllRoutesCache() {
  Object.values(AIRLINE_IATA_MAP).forEach(iata => {
    localStorage.removeItem(CACHE_PREFIX + iata)
  })
}
