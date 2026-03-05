/**
 * ============================================================
 * STOP FINDER SERVICE
 * ============================================================
 * Finds the nearest bus stop that services the user's chosen destination
 * Uses haversine formula for distance calculation and routes data for service validation
 */

const fs = require('fs');
const path = require('path');

/**
 * Haversine formula — calculates straight-line distance between two GPS points.
 * Returns distance in kilometers.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Load stops from local JSON file.
 * In future you can replace this with a DB query.
 */
function loadStops() {
  const stopsPath = path.join(__dirname, '../data/stops.json');
  try {
    const data = fs.readFileSync(stopsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading stops.json:', err);
    return [];
  }
}

/**
 * Load routes from local JSON file.
 * Each route has an array of stop IDs in order.
 * Example route: { id: "R01", stopIds: ["KGL001", "KGL003", "KGL007"] }
 */
function loadRoutes() {
  const routesPath = path.join(__dirname, '../data/routes.json');
  try {
    const data = fs.readFileSync(routesPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading routes.json:', err);
    return [];
  }
}

/**
 * Given a destination stop ID, find all stops that are on routes
 * which PASS THROUGH that destination.
 */
function getStopsThatServiceDestination(destinationStopId) {
  const routes = loadRoutes();
  const validDepartureStopIds = new Set();

  for (const route of routes) {
    const destIndex = route.stopIds.indexOf(destinationStopId);
    if (destIndex === -1) continue; // this route doesn't go to the destination

    // All stops BEFORE the destination on this route are valid departure points
    for (let i = 0; i < destIndex; i++) {
      validDepartureStopIds.add(route.stopIds[i]);
    }
  }

  return Array.from(validDepartureStopIds);
}

/**
 * MAIN FUNCTION — call this from your route handler.
 *
 * @param {string|number} destinationStopId - The stop ID the user wants to reach
 * @param {number} userLat - User's current GPS latitude
 * @param {number} userLng - User's current GPS longitude
 * @returns {object} - Nearest stop object with distance and route info
 */
function findNearestServiceableStop(destinationStopId, userLat, userLng) {
  const allStops = loadStops();
  
  // Convert destinationStopId to number for comparison (query params come as strings)
  const destId = typeof destinationStopId === 'string' ? parseInt(destinationStopId, 10) : destinationStopId;
  
  // Find the destination stop
  const destinationStop = allStops.find((s) => s.id === destId);
  if (!destinationStop) {
    return { found: false, message: 'Destination stop not found.' };
  }

  const validStopIds = getStopsThatServiceDestination(destinationStopId);

  // If no routes yet in system, return all stops that have coordinates as candidates
  // This allows the system to work even with empty routes.json during development
  let candidateStops = [];
  
  if (validStopIds.length === 0) {
    // Fallback behavior: Use all stops with coords (development/demo mode)
    candidateStops = allStops.filter(
      (stop) => stop.lat != null && stop.lng != null
    );
    
    if (candidateStops.length === 0) {
      return {
        found: false,
        message: 'No stops with coordinates available in the system.',
      };
    }
  } else {
    // Production behavior: Only use stops that service this destination
    candidateStops = allStops.filter(
      (stop) => validStopIds.includes(stop.id) && stop.lat != null && stop.lng != null
    );

    if (candidateStops.length === 0) {
      return {
        found: false,
        message: 'No nearby stops service this destination yet.',
      };
    }
  }

  // Calculate distance from user to each candidate stop
  const stopsWithDistance = candidateStops.map((stop) => ({
    ...stop,
    distanceKm: haversineDistance(userLat, userLng, stop.lat, stop.lng),
  }));

  // Sort by distance — closest first
  stopsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = stopsWithDistance[0];

  return {
    found: true,
    nearestStop: {
      id: nearest.id,
      name: nearest.name,
      code: nearest.code,
      lat: nearest.lat,
      lng: nearest.lng,
      type: nearest.type,
      city: nearest.city,
      area: nearest.area,
      distanceKm: parseFloat(nearest.distanceKm.toFixed(2)),
      distanceLabel:
        nearest.distanceKm < 1
          ? `${Math.round(nearest.distanceKm * 1000)}m away`
          : `${nearest.distanceKm.toFixed(1)}km away`,
      isGoogleVerified: nearest.googlePlaceId ? true : false, // true if coords came from Google Maps
    },
    destination: {
      id: destinationStop.id,
      name: destinationStop.name,
      code: destinationStop.code,
      city: destinationStop.city,
    },
    alternativeStops: stopsWithDistance.slice(1, 4).map((s) => ({
      // Return 3 alternatives too
      id: s.id,
      name: s.name,
      code: s.code,
      type: s.type,
      area: s.area,
      distanceKm: parseFloat(s.distanceKm.toFixed(2)),
      distanceLabel:
        s.distanceKm < 1
          ? `${Math.round(s.distanceKm * 1000)}m away`
          : `${s.distanceKm.toFixed(1)}km away`,
    })),
  };
}

module.exports = { findNearestServiceableStop };
