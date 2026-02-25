import { ref, computed } from 'vue'
import { store } from '../store/index.js'

export function useLocation() {
  const isLoading = ref(false)
  const error = ref(null)
  const hasPermission = ref(null)

  // Check if geolocation is available
  const isGeolocationAvailable = computed(() => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
  })

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!isGeolocationAvailable.value) {
        error.value = 'Geolocation is not available in your browser'
        reject(error.value)
        return
      }

      isLoading.value = true
      error.value = null

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          const timestamp = new Date(position.timestamp)

          store.userLocation = {
            latitude,
            longitude,
            accuracy,
            timestamp,
            address: null
          }

          store.locationFetched = true
          isLoading.value = false
          hasPermission.value = true

          // Try to get address from coordinates (reverse geocoding)
          reverseGeocode(latitude, longitude)

          resolve(store.userLocation)
        },
        (err) => {
          isLoading.value = false
          hasPermission.value = false

          let errorMessage = 'Could not get your location'
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Enable it in your browser settings.'
              hasPermission.value = false
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.'
              break
            case err.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }

          error.value = errorMessage
          reject(error.value)
        },
        options
      )
    })
  }

  // Reverse geocode - convert coordinates to address (using approximate method)
  const reverseGeocode = (latitude, longitude) => {
    // Simple approximation: since this is Rwanda/Kigali
    // For production, you'd use a real geocoding API like OpenStreetMap Nominatim
    const kigaliLat = -1.9635
    const kigaliLng = 30.0594

    const latDiff = Math.abs(latitude - kigaliLat)
    const lngDiff = Math.abs(longitude - kigaliLng)

    // Simple distance calculation
    const isNearKigali = latDiff < 0.1 && lngDiff < 0.1

    if (isNearKigali) {
      store.userLocation.address = 'Kigali, Rwanda'
    } else {
      store.userLocation.address = 'Rwanda'
    }
  }

  // Simulate watch position (continuous tracking)
  let watchId = null

  const startWatching = () => {
    if (!isGeolocationAvailable.value) {
      error.value = 'Geolocation not available'
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        store.userLocation = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date(position.timestamp),
          address: store.userLocation.address
        }
      },
      (err) => {
        error.value = err.message
      },
      options
    )
  }

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  // Format coordinates for display
  const formatCoordinates = (location) => {
    if (!location) return ''
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
  }

  return {
    isLoading,
    error,
    hasPermission,
    isGeolocationAvailable,
    userLocation: computed(() => store.userLocation),
    locationFetched: computed(() => store.locationFetched),
    getCurrentLocation,
    startWatching,
    stopWatching,
    formatCoordinates
  }
}
