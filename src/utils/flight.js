import { AIRLINE_ROUTES, getRoutesFromBase, getRoutesFromAirport } from './airlineRoutes'

const EARTH_RADIUS_NM = 3440.065
const CRUISE_SPEED_KNOTS = 450
const TAXI_TIME_HOURS = 0.5

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashDate(dateStr) {
  let h = 0
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function getDistanceNM(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(EARTH_RADIUS_NM * c)
}

export function getBlockTime(distanceNM) {
  const flightTime = distanceNM / CRUISE_SPEED_KNOTS
  return parseFloat((flightTime + TAXI_TIME_HOURS).toFixed(2))
}

export function addTimeToDate(dateStr, timeStr, blockTimeHours) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [startH, startM] = timeStr.split(':').map(Number)
  const base = new Date(year, month - 1, day, startH, startM)
  base.setMinutes(base.getMinutes() + Math.round(blockTimeHours * 60))
  const hh = String(base.getHours()).padStart(2, '0')
  const mm = String(base.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24
  const m = Math.round(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function roundToNearest10(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const totalMin = h * 60 + m
  const rounded = Math.round(totalMin / 10) * 10
  const rh = Math.floor(rounded / 60) % 24
  const rm = rounded % 60
  return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`
}

export function getRouteTurnaround(config, routeType) {
  return config.turnaround[routeType] || config.turnaround.medium
}

function getFlightNum(config, routeType, rand) {
  const ranges = config.flightNumRanges
  if (ranges && ranges[routeType]) {
    const [min, max] = ranges[routeType]
    return min + Math.floor(rand() * (max - min + 1))
  }
  return config.minFlightNum + Math.floor(rand() * (config.maxFlightNum - config.minFlightNum + 1))
}

export function generateRotation(baseAirport, airports, dateStr, startTime, airlineName, options = {}) {
  const { maxLegs = 8, maxTimeMinutes = Infinity, roundTrip = true } = options
  const config = AIRLINE_ROUTES[airlineName]
  if (!config) return generateFallbackRotation(baseAirport, airports, dateStr, startTime, airlineName, options)

  const base = airports.find(a => a.icao === baseAirport)
  if (!base) return []

  const outboundRoutes = getRoutesFromBase(airlineName, baseAirport)
  if (outboundRoutes.length === 0) return generateFallbackRotation(baseAirport, airports, dateStr, startTime, airlineName, options)

  const rand = seededRandom(hashDate(dateStr + airlineName + baseAirport))
  const shuffledOutbound = [...outboundRoutes].sort(() => rand() - 0.5)

  if (roundTrip) {
    const validRoutes = shuffledOutbound.filter(r => airports.find(a => a.icao === r.to))

    for (const route of validRoutes) {
      const dest = airports.find(a => a.icao === route.to)
      if (!dest) continue

      const outboundDist = getDistanceNM(base.lat, base.lon, dest.lat, dest.lon)
      const outboundBlock = getBlockTime(outboundDist)
      const outboundBlockMin = Math.round(outboundBlock * 60)

      if (outboundBlockMin > maxTimeMinutes) continue

      const reverseRoute = config.routes.find(
        r => r.from === route.to && r.to === baseAirport
      )
      const returnRouteType = reverseRoute ? reverseRoute.type : route.type
      const turnaroundMin = getRouteTurnaround(config, returnRouteType)
      const outboundArrival = addTimeToDate(dateStr, startTime, outboundBlock)
      const returnDepMin = timeToMinutes(outboundArrival) + turnaroundMin
      const returnDep = minutesToTime(returnDepMin)

      const returnDist = getDistanceNM(dest.lat, dest.lon, base.lat, base.lon)
      const returnBlock = getBlockTime(returnDist)
      const returnBlockMin = Math.round(returnBlock * 60)
      const totalMin = outboundBlockMin + returnBlockMin

      if (totalMin > maxTimeMinutes) continue

      if (maxLegs < 2) {
        return [{
          legNumber: 1,
          flightNumber: `${config.flightPrefix}${getFlightNum(config, route.type, rand)}`,
          departure: baseAirport,
          departureCity: base.city,
          arrival: route.to,
          arrivalCity: dest.city,
          departureTime: startTime,
          arrivalTime: roundToNearest10(outboundArrival),
          blockTime: outboundBlock,
          distance: outboundDist,
          date: dateStr,
          airline: airlineName,
          status: 'Scheduled',
        }]
      }

      const outboundNum = getFlightNum(config, route.type, rand)
      const returnArrival = addTimeToDate(dateStr, returnDep, returnBlock)

      return [
        {
          legNumber: 1,
          flightNumber: `${config.flightPrefix}${outboundNum}`,
          departure: baseAirport,
          departureCity: base.city,
          arrival: route.to,
          arrivalCity: dest.city,
          departureTime: startTime,
          arrivalTime: roundToNearest10(outboundArrival),
          blockTime: outboundBlock,
          distance: outboundDist,
          date: dateStr,
          airline: airlineName,
          status: 'Scheduled',
        },
        {
          legNumber: 2,
          flightNumber: `${config.flightPrefix}${outboundNum + 1}`,
          departure: route.to,
          departureCity: dest.city,
          arrival: baseAirport,
          arrivalCity: base.city,
          departureTime: returnDep,
          arrivalTime: roundToNearest10(returnArrival),
          blockTime: returnBlock,
          distance: returnDist,
          date: dateStr,
          airline: airlineName,
          status: 'Scheduled',
        },
      ]
    }

    return []
  }

  const legs = []
  let currentTime = startTime
  let legIndex = 0
  let totalFlightMinutes = 0
  const visited = new Set([baseAirport])

  let currentAirport = baseAirport
  let currentAirportData = base

  for (let i = 0; i < maxLegs; i++) {
    let nextAirport, nextAirportData, routeType

    if (i === 0) {
      const candidates = shuffledOutbound.filter(r => !visited.has(r.to))
      const sorted = candidates.sort((a, b) => {
        const da = airports.find(a2 => a2.icao === a.to)
        const db = airports.find(a2 => a2.icao === b.to)
        if (!da || !db) return 0
        return getDistanceNM(base.lat, base.lon, da.lat, da.lon) -
               getDistanceNM(base.lat, base.lon, db.lat, db.lon)
      })
      let found = false
      for (const route of sorted) {
        const dest = airports.find(a2 => a2.icao === route.to)
        if (!dest) continue
        const dist = getDistanceNM(base.lat, base.lon, dest.lat, dest.lon)
        const blockMin = Math.round(getBlockTime(dist) * 60)
        if (totalFlightMinutes + blockMin <= maxTimeMinutes) {
          nextAirport = route.to
          nextAirportData = dest
          routeType = route.type
          found = true
          break
        }
      }
      if (!found) break
    } else {
      const allRoutesFromCurrent = getRoutesFromAirport(airlineName, currentAirport)
      const candidates = allRoutesFromCurrent.filter(r => r.to !== currentAirport)
      if (candidates.length === 0) break

      const unvisited = candidates.filter(r => !visited.has(r.to))
      const pool = unvisited.length > 0 ? unvisited : candidates

      let found = false
      const shuffledPool = [...pool].sort(() => rand() - 0.5)
      for (const route of shuffledPool) {
        const dest = airports.find(a2 => a2.icao === route.to)
        if (!dest) continue
        const dist = getDistanceNM(currentAirportData.lat, currentAirportData.lon, dest.lat, dest.lon)
        const blockMin = Math.round(getBlockTime(dist) * 60)
        if (totalFlightMinutes + blockMin <= maxTimeMinutes) {
          nextAirport = route.to
          nextAirportData = dest
          routeType = route.type
          found = true
          break
        }
      }
      if (!found) break
    }

    if (!nextAirportData) break

    const dist = getDistanceNM(currentAirportData.lat, currentAirportData.lon, nextAirportData.lat, nextAirportData.lon)
    const blockTime = getBlockTime(dist)

    const arrival = addTimeToDate(dateStr, currentTime, blockTime)
    const turnaroundMin = getRouteTurnaround(config, routeType)
    const flightNum = getFlightNum(config, routeType, rand)
    visited.add(nextAirport)

    legs.push({
      legNumber: legIndex + 1,
      flightNumber: `${config.flightPrefix}${flightNum}`,
      departure: currentAirport,
      departureCity: currentAirportData.city,
      arrival: nextAirport,
      arrivalCity: nextAirportData.city,
      departureTime: currentTime,
      arrivalTime: roundToNearest10(arrival),
      blockTime: blockTime,
      distance: dist,
      date: dateStr,
      airline: airlineName,
      status: 'Scheduled',
    })
    legIndex++
    totalFlightMinutes += Math.round(blockTime * 60)

    const arrMin = timeToMinutes(arrival)
    const nextDepMin = arrMin + turnaroundMin
    currentTime = minutesToTime(nextDepMin)
    currentAirport = nextAirport
    currentAirportData = nextAirportData
  }

  return legs
}

function generateFallbackRotation(baseAirport, airports, dateStr, startTime, airlineName, options = {}) {
  const { maxLegs = 6, maxTimeMinutes = Infinity, roundTrip = true } = options
  const base = airports.find(a => a.icao === baseAirport)
  if (!base) return []

  const destinations = airports.filter(a => a.icao !== baseAirport)
  if (destinations.length === 0) return []

  const config = AIRLINE_ROUTES[airlineName] || {
    flightPrefix: airlineName.substring(0, 2).toUpperCase(),
    minFlightNum: 100,
    turnaround: { short: 40, medium: 45, long: 55 },
  }

  const rand = seededRandom(hashDate(dateStr + airlineName + baseAirport))
  const shuffled = [...destinations].sort(() => rand() - 0.5)

  if (roundTrip) {
    const sorted = [...shuffled].sort((a, b) =>
      getDistanceNM(base.lat, base.lon, a.lat, a.lon) -
      getDistanceNM(base.lat, base.lon, b.lat, b.lon)
    )

    for (const dest of sorted) {
      const outboundDist = getDistanceNM(base.lat, base.lon, dest.lat, dest.lon)
      const outboundBlock = getBlockTime(outboundDist)
      const outboundBlockMin = Math.round(outboundBlock * 60)

      if (outboundBlockMin > maxTimeMinutes) continue

      const turnaroundMin = config.turnaround.medium || 45
      const outboundArrival = addTimeToDate(dateStr, startTime, outboundBlock)
      const returnDepMin = timeToMinutes(outboundArrival) + turnaroundMin
      const returnDep = minutesToTime(returnDepMin)

      const returnDist = getDistanceNM(dest.lat, dest.lon, base.lat, base.lon)
      const returnBlock = getBlockTime(returnDist)
      const returnBlockMin = Math.round(returnBlock * 60)
      const totalMin = outboundBlockMin + returnBlockMin

      if (totalMin > maxTimeMinutes) continue

      const prefix = config.flightPrefix || airlineName.substring(0, 2).toUpperCase()
      const outboundNum = getFlightNum(config, 'medium', rand)
      const returnArrival = addTimeToDate(dateStr, returnDep, returnBlock)

      return [
        {
          legNumber: 1,
          flightNumber: `${prefix}${outboundNum}`,
          departure: baseAirport,
          departureCity: base.city,
          arrival: dest.icao,
          arrivalCity: dest.city,
          departureTime: startTime,
          arrivalTime: roundToNearest10(outboundArrival),
          blockTime: outboundBlock,
          distance: outboundDist,
          date: dateStr,
          airline: airlineName,
          status: 'Scheduled',
        },
        {
          legNumber: 2,
          flightNumber: `${prefix}${outboundNum + 1}`,
          departure: dest.icao,
          departureCity: dest.city,
          arrival: baseAirport,
          arrivalCity: base.city,
          departureTime: returnDep,
          arrivalTime: roundToNearest10(returnArrival),
          blockTime: returnBlock,
          distance: returnDist,
          date: dateStr,
          airline: airlineName,
          status: 'Scheduled',
        },
      ]
    }

    return []
  }

  const legs = []
  let currentTime = startTime
  let legIndex = 0
  let totalFlightMinutes = 0
  const visited = new Set([baseAirport])

  let currentAirport = baseAirport
  let currentAirportData = base

  for (let i = 0; i < maxLegs; i++) {
    let nextAirport, nextAirportData

    if (i === 0) {
      const dest = shuffled.find(d => !visited.has(d.icao))
      if (!dest) break
      nextAirport = dest.icao
      nextAirportData = dest
    } else {
      const candidates = shuffled.filter(d => d.icao !== currentAirport)
      if (candidates.length === 0) break
      const dest = candidates[Math.floor(rand() * candidates.length)]
      nextAirport = dest.icao
      nextAirportData = dest
    }

    if (!nextAirportData) break

    const dist = getDistanceNM(currentAirportData.lat, currentAirportData.lon, nextAirportData.lat, nextAirportData.lon)
    const blockTime = getBlockTime(dist)
    const blockMin = Math.round(blockTime * 60)

    if (totalFlightMinutes + blockMin > maxTimeMinutes) break

    const arrival = addTimeToDate(dateStr, currentTime, blockTime)
    const flightNum = getFlightNum(config, 'medium', rand)
    visited.add(nextAirport)

    legs.push({
      legNumber: legIndex + 1,
      flightNumber: `${config.flightPrefix || airlineName.substring(0, 2).toUpperCase()}${flightNum}`,
      departure: currentAirport,
      departureCity: currentAirportData.city,
      arrival: nextAirport,
      arrivalCity: nextAirportData.city,
      departureTime: currentTime,
      arrivalTime: roundToNearest10(arrival),
      blockTime: blockTime,
      distance: dist,
      date: dateStr,
      airline: airlineName,
      status: 'Scheduled',
    })
    legIndex++
    totalFlightMinutes += blockMin

    const turnaroundMin = config.turnaround.medium || 45
    const arrMin = timeToMinutes(arrival)
    const nextDepMin = arrMin + turnaroundMin
    currentTime = minutesToTime(nextDepMin)
    currentAirport = nextAirport
    currentAirportData = nextAirportData
  }

  return legs
}
