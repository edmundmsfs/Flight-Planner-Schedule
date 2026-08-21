/**
 * Real airline route networks for Indonesian carriers.
 * Each airline has hub airports and routes they actually operate.
 * Routes use ICAO codes matching the airports table.
 */

export const AIRLINE_ROUTES = {
  'Pelita Air': {
    iata: 'IP',
    flightPrefix: 'IP',
    aircraftType: 'ATR 72-600 / A320',
    hubs: ['WIII'],
    minFlightNum: 300,
    maxFlightNum: 599,
    turnaround: { short: 40, medium: 50, long: 60 },
    flightNumRanges: { short: [301, 349], medium: [350, 449], long: [450, 599] },
    routes: [
      { from: 'WIII', to: 'WIDN', type: 'short' },
      { from: 'WIII', to: 'WARR', type: 'medium' },
      { from: 'WIII', to: 'WIMM', type: 'long' },
      { from: 'WIII', to: 'WAAA', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WAHI', type: 'medium' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
      { from: 'WIMM', to: 'WIII', type: 'long' },
    ],
  },

  'Citilink': {
    iata: 'QG',
    flightPrefix: 'QG',
    aircraftType: 'A320neo / A320',
    hubs: ['WIII', 'WADD', 'WARR'],
    minFlightNum: 100,
    maxFlightNum: 999,
    turnaround: { short: 35, medium: 45, long: 55 },
    flightNumRanges: { short: [101, 299], medium: [300, 599], long: [600, 999] },
    routes: [
      { from: 'WIII', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WARR', type: 'medium' },
      { from: 'WIII', to: 'WIMM', type: 'long' },
      { from: 'WIII', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WAAA', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WAHI', type: 'medium' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WIII', to: 'WITT', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WADD', to: 'WIMM', type: 'long' },
      { from: 'WADD', to: 'WAAA', type: 'long' },
      { from: 'WADD', to: 'WIOO', type: 'long' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
      { from: 'WARR', to: 'WIMM', type: 'long' },
      { from: 'WIMM', to: 'WIII', type: 'long' },
      { from: 'WIMM', to: 'WADD', type: 'long' },
      { from: 'WAAA', to: 'WIII', type: 'long' },
      { from: 'WAOO', to: 'WIII', type: 'long' },
      { from: 'WIOO', to: 'WIII', type: 'long' },
      { from: 'WIII', to: 'VTBS', type: 'long' },
      { from: 'WIII', to: 'WMKK', type: 'long' },
      { from: 'WADD', to: 'VTBS', type: 'long' },
      { from: 'WADD', to: 'WMKK', type: 'long' },
      { from: 'WIII', to: 'WSSS', type: 'medium' },
    ],
  },

  'AirAsia Indonesia': {
    iata: 'QZ',
    flightPrefix: 'QZ',
    aircraftType: 'A320 / A320neo',
    hubs: ['WIII', 'WADD'],
    minFlightNum: 200,
    maxFlightNum: 899,
    turnaround: { short: 30, medium: 40, long: 50 },
    flightNumRanges: { short: [201, 399], medium: [400, 649], long: [650, 899] },
    routes: [
      { from: 'WIII', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WARR', type: 'medium' },
      { from: 'WIII', to: 'WIMM', type: 'long' },
      { from: 'WIII', to: 'WAAA', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WAHI', type: 'medium' },
      { from: 'WIII', to: 'WIDN', type: 'short' },
      { from: 'WIII', to: 'WITT', type: 'long' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WADD', to: 'WIMM', type: 'long' },
      { from: 'WADD', to: 'WAAA', type: 'long' },
      { from: 'WADD', to: 'WAOO', type: 'long' },
      { from: 'WADD', to: 'WIOO', type: 'long' },
      { from: 'WADD', to: 'WAHI', type: 'long' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WMKK', type: 'long' },
      { from: 'WADD', to: 'WMKK', type: 'long' },
      { from: 'WIII', to: 'WSSS', type: 'medium' },
      { from: 'WADD', to: 'WSSS', type: 'medium' },
      { from: 'WIII', to: 'VTBS', type: 'long' },
      { from: 'WIDN', to: 'WMKK', type: 'short' },
    ],
  },

  'Batik Air Indonesia': {
    iata: 'ID',
    flightPrefix: 'ID',
    aircraftType: 'B737-800 / B737-900ER / A330-300',
    hubs: ['WIII', 'WADD', 'WARR'],
    minFlightNum: 100,
    maxFlightNum: 999,
    turnaround: { short: 40, medium: 50, long: 65 },
    flightNumRanges: { short: [101, 299], medium: [300, 599], long: [600, 999] },
    routes: [
      { from: 'WIII', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WARR', type: 'medium' },
      { from: 'WIII', to: 'WIMM', type: 'long' },
      { from: 'WIII', to: 'WAAA', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WAHI', type: 'medium' },
      { from: 'WIII', to: 'WIDN', type: 'short' },
      { from: 'WIII', to: 'WITT', type: 'long' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WADD', to: 'WIMM', type: 'long' },
      { from: 'WADD', to: 'WAAA', type: 'long' },
      { from: 'WADD', to: 'WAOO', type: 'long' },
      { from: 'WADD', to: 'WIOO', type: 'long' },
      { from: 'WADD', to: 'WAHI', type: 'long' },
      { from: 'WADD', to: 'WADL', type: 'medium' },
      { from: 'WADD', to: 'WARJ', type: 'medium' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
      { from: 'WARR', to: 'WIMM', type: 'long' },
      { from: 'WARR', to: 'WAOO', type: 'long' },
      { from: 'WIMM', to: 'WIII', type: 'long' },
      { from: 'WIMM', to: 'WADD', type: 'long' },
      { from: 'WAAA', to: 'WIII', type: 'long' },
      { from: 'WAAA', to: 'WADD', type: 'long' },
      { from: 'WIOO', to: 'WIII', type: 'long' },
      { from: 'WIOO', to: 'WADD', type: 'long' },
      { from: 'WAOO', to: 'WIII', type: 'long' },
      { from: 'WAOO', to: 'WADD', type: 'long' },
      { from: 'WAOO', to: 'WARR', type: 'long' },
      { from: 'WIII', to: 'VTBS', type: 'long' },
      { from: 'WIII', to: 'WSSS', type: 'medium' },
      { from: 'WADD', to: 'VTBS', type: 'long' },
      { from: 'WADD', to: 'WMKK', type: 'long' },
      { from: 'WIII', to: 'VTSP', type: 'long' },
    ],
  },
}

/**
 * Find routes that an airline operates from a given base airport.
 * Returns outbound routes (from === base).
 */
export function getRoutesFromBase(airlineName, baseIcao) {
  const config = AIRLINE_ROUTES[airlineName]
  if (!config) return []
  return config.routes.filter(r => r.from === baseIcao)
}

/**
 * Find routes from any airport (not just base).
 * Includes reverse routes — if airline flies A→B, it also flies B→A.
 */
export function getRoutesFromAirport(airlineName, icao) {
  const config = AIRLINE_ROUTES[airlineName]
  if (!config) return []
  const outbound = config.routes.filter(r => r.from === icao)
  const reverse = config.routes
    .filter(r => r.to === icao && !config.routes.some(r2 => r2.from === icao && r2.to === r.from))
    .map(r => ({ from: icao, to: r.from, type: r.type }))
  return [...outbound, ...reverse]
}

/**
 * Check if an airline serves a specific airport (as origin or destination).
 */
export function airlineServes(airlineName, icao) {
  const config = AIRLINE_ROUTES[airlineName]
  if (!config) return false
  return config.routes.some(r => r.from === icao || r.to === icao)
}

/**
 * Get all unique airports an airline serves.
 */
export function getAirlineDestinations(airlineName) {
  const config = AIRLINE_ROUTES[airlineName]
  if (!config) return new Set()
  const set = new Set()
  config.routes.forEach(r => { set.add(r.from); set.add(r.to) })
  return set
}
