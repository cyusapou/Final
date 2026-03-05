/**
 * ============================================================
 * USE SMART STOP COMPOSABLE
 * ============================================================
 * Handles the "find nearest stop to user for a given destination" logic
 * Combines GPS location detection with backend API calls
 */

import { ref } from 'vue'

export function useSmartStop() {
  const nearestStop = ref(null)
  const alternatives = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Get user's current GPS position.
   * Returns { lat, lng } or throws if denied.
   */
  function getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(new Error('Location access denied — please enable GPS or allow location access')),
        { timeout: 10000, enableHighAccuracy: true }
      )
    })
  }

  /**
   * Main function — call when user selects a destination.
   * Fetches the nearest stop from the backend.
   *
   * @param {string} destinationStopId - The ID of the destination stop
   * @returns {Promise<object>} - Result from backend with nearest stop and alternatives
   */
  async function findNearestStop(destinationStopId) {
    loading.value = true
    error.value = null
    nearestStop.value = null
    alternatives.value = []

    try {
      // Step 1: Get user's GPS location
      const userLocation = await getUserLocation()

      // Step 2: Ask backend for nearest stop
      const params = new URLSearchParams({
        destinationId: destinationStopId,
        userLat: userLocation.lat,
        userLng: userLocation.lng,
      })

      const response = await fetch(`/api/v1/public/nearest-stop?${params}`)

      if (!response.ok) {
        const text = await response.text()
        console.error('API Error Response:', response.status, text)
        throw new Error(text || `HTTP ${response.status}`)
      }

      const data = await response.json()

      // Extract data from success response wrapper
      const result = data.data || data
      
      nearestStop.value = result.nearestStop
      alternatives.value = result.alternativeStops || []

      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear the current selection
   */
  function clearSelection() {
    nearestStop.value = null
    alternatives.value = []
    error.value = null
  }

  /**
   * Clear error state (e.g., when user wants to retry)
   */
  function clearError() {
    error.value = null
  }

  return {
    nearestStop,
    alternatives,
    loading,
    error,
    findNearestStop,
    clearSelection,
    clearError,
  }
}
