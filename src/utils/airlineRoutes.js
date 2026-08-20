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
      { from: 'WIII', to: 'WIDD', type: 'short' },
      { from: 'WIII', to: 'WARR', type: 'medium' },
      { from: 'WIII', to: 'WAME', type: 'long' },
      { from: 'WIII', to: 'WAHQ', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WARP', type: 'medium' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
      { from: 'WAME', to: 'WIII', type: 'long' },
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
      { from: 'WIII', to: 'WAME', type: 'long' },
      { from: 'WIII', to: 'WADD', type: 'long' },
      { from: 'WIII', to: 'WAHQ', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WARP', type: 'medium' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WIII', to: 'WITT', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WADD', to: 'WAME', type: 'long' },
      { from: 'WADD', to: 'WAHQ', type: 'long' },
      { from: 'WADD', to: 'WIOO', type: 'long' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
      { from: 'WARR', to: 'WAME', type: 'long' },
      { from: 'WAME', to: 'WIII', type: 'long' },
      { from: 'WAME', to: 'WADD', type: 'long' },
      { from: 'WAHQ', to: 'WIII', type: 'long' },
      { from: 'WAOO', to: 'WIII', type: 'long' },
      { from: 'WIOO', to: 'WIII', type: 'long' },
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
      { from: 'WIII', to: 'WAME', type: 'long' },
      { from: 'WIII', to: 'WAHQ', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WARP', type: 'medium' },
      { from: 'WIII', to: 'WIDD', type: 'short' },
      { from: 'WIII', to: 'WITT', type: 'long' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WADD', to: 'WAME', type: 'long' },
      { from: 'WADD', to: 'WAHQ', type: 'long' },
      { from: 'WADD', to: 'WAOO', type: 'long' },
      { from: 'WADD', to: 'WIOO', type: 'long' },
      { from: 'WADD', to: 'WARP', type: 'long' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
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
      { from: 'WIII', to: 'WAME', type: 'long' },
      { from: 'WIII', to: 'WAHQ', type: 'long' },
      { from: 'WIII', to: 'WAOO', type: 'long' },
      { from: 'WIII', to: 'WIOO', type: 'long' },
      { from: 'WIII', to: 'WADL', type: 'medium' },
      { from: 'WIII', to: 'WARJ', type: 'medium' },
      { from: 'WIII', to: 'WARP', type: 'medium' },
      { from: 'WIII', to: 'WIDD', type: 'short' },
      { from: 'WIII', to: 'WITT', type: 'long' },
      { from: 'WIII', to: 'WIPA', type: 'long' },
      { from: 'WIII', to: 'WAKK', type: 'long' },
      { from: 'WADD', to: 'WIII', type: 'long' },
      { from: 'WADD', to: 'WARR', type: 'long' },
      { from: 'WADD', to: 'WAME', type: 'long' },
      { from: 'WADD', to: 'WAHQ', type: 'long' },
      { from: 'WADD', to: 'WAOO', type: 'long' },
      { from: 'WADD', to: 'WIOO', type: 'long' },
      { from: 'WADD', to: 'WARP', type: 'long' },
      { from: 'WADD', to: 'WADL', type: 'medium' },
      { from: 'WADD', to: 'WARJ', type: 'medium' },
      { from: 'WARR', to: 'WIII', type: 'medium' },
      { from: 'WARR', to: 'WADD', type: 'long' },
      { from: 'WARR', to: 'WAME', type: 'long' },
      { from: 'WARR', to: 'WAOO', type: 'long' },
      { from: 'WAME', to: 'WIII', type: 'long' },
      { from: 'WAME', to: 'WADD', type: 'long' },
      { from: 'WAHQ', to: 'WIII', type: 'long' },
      { from: 'WAHQ', to: 'WADD', type: 'long' },
      { from: 'WIOO', to: 'WIII', type: 'long' },
      { from: 'WIOO', to: 'WADD', type: 'long' },
      { from: 'WAOO', to: 'WIII', type: 'long' },
      { from: 'WAOO', to: 'WADD', type: 'long' },
      { from: 'WAOO', to: 'WARR', type: 'long' },
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
 */
export function getRoutesFromAirport(airlineName, icao) {
  const config = AIRLINE_ROUTES[airlineName]
  if (!config) return []
  return config.routes.filter(r => r.from === icao)
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
