import { stops as busStops } from '../store/index.js'

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Find nearest bus stops to given coordinates
 * Returns array of stops sorted by distance
 */
export function findNearestStops(latitude, longitude, limit = 5) {
  const stopsWithDistance = busStops.map(stop => {
    // Use Kigali as default for stops without coordinates
    let stopLat = -1.9473
    let stopLng = 30.0567
    
    // Add slight variations based on stop ID for better distribution
    if (stop.area === 'Remera') {
      stopLat = -1.9433
      stopLng = 30.0589
    } else if (stop.area === 'Kimironko') {
      stopLat = -1.9505
      stopLng = 30.0612
    } else if (stop.area === 'Kanombe') {
      stopLat = -1.9567
      stopLng = 30.0534
    } else if (stop.area === 'Gatenga') {
      stopLat = -1.9589
      stopLng = 30.0456
    } else if (stop.area === 'Nyabugogo') {
      stopLat = -1.9645
      stopLng = 30.0723
    }
    
    const distance = calculateDistance(latitude, longitude, stopLat, stopLng)
    
    return {
      ...stop,
      distance,
      coordinates: { lat: stopLat, lng: stopLng }
    }
  })

  return stopsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

/**
 * Estimate travel time based on distance
 * Uses average Rwandan bus speeds
 * Returns time in minutes
 */
export function estimateTravelTime(distance, withTraffic = true) {
  // Average bus speed in Kigali: ~25 km/h with traffic, ~40 km/h without
  const speedWithTraffic = 25 // km/h
  const speedWithoutTraffic = 40 // km/h
  
  const speed = withTraffic ? speedWithTraffic : speedWithoutTraffic
  const timeInHours = distance / speed
  const timeInMinutes = Math.round(timeInHours * 60)
  
  return Math.max(timeInMinutes, 1) // Minimum 1 minute
}

/**
 * Get route information between two locations
 */
export function getRouteInfo(fromLat, fromLng, toLat, toLng, fromStopName = 'Current Location', toStopName = 'Destination') {
  const distance = calculateDistance(fromLat, fromLng, toLat, toLng)
  const timeWithTraffic = estimateTravelTime(distance, true)
  const timeWithoutTraffic = estimateTravelTime(distance, false)
  
  return {
    from: {
      name: fromStopName,
      coordinates: { lat: fromLat, lng: fromLng }
    },
    to: {
      name: toStopName,
      coordinates: { lat: toLat, lng: toLng }
    },
    distance: distance.toFixed(2),
    distanceFormatted: `${distance.toFixed(2)} km`,
    estimatedTime: {
      withTraffic: timeWithTraffic,
      withoutTraffic: timeWithoutTraffic,
      formatted: `${timeWithTraffic} mins`
    },
    bearingDegrees: calculateBearing(fromLat, fromLng, toLat, toLng)
  }
}

/**
 * Calculate bearing (direction) from point A to point B
 * Returns degrees (0-360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180)
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon)
  const bearing = Math.atan2(y, x) * 180 / Math.PI
  return (bearing + 360) % 360
}

/**
 * Convert bearing to direction text
 */
export function bearingToDirection(bearing) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(bearing / 22.5) % 16
  return directions[index]
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lng) {
  return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`
}

/**
 * Determine if location is within Kigali city
 */
export function isInKigali(latitude, longitude) {
  // Approximate Kigali bounds
  const minLat = -2.0
  const maxLat = -1.8
  const minLng = 29.9
  const maxLng = 30.2
  
  return latitude >= minLat && latitude <= maxLat && longitude >= minLng && longitude <= maxLng
}

/**
 * Get nearby city based on coordinates
 */
export function getNearbyCity(latitude, longitude) {
  const kigaliDistance = calculateDistance(latitude, longitude, -1.9473, 30.0567)
  
  if (kigaliDistance < 50) return 'Kigali'
  if (kigaliDistance < 120) return 'Muhanga'
  if (kigaliDistance < 180) return 'Musanze'
  return 'Rwanda'
}

/**
 * Create a marker object for map display
 */
export function createMarker(lat, lng, name, type = 'location') {
  return {
    coordinates: [lat, lng],
    name,
    type,
    popup: `<strong>${name}</strong><br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}`
  }
}

/**
 * Create a polyline for route display
 */
export function createRoutePolyline(fromLat, fromLng, toLat, toLng) {
  return [
    [fromLat, fromLng],
    [toLat, toLng]
  ]
}
