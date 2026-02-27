import { ref, computed, onUnmounted } from 'vue'
import { nearestPoint } from '@turf/turf'
import { point, featureCollection } from '@turf/helpers'
import type { Station } from '../data/stations'
import { stations } from '../data/stations'

export interface UserLocation {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: Date
}

export interface NearestStationResult {
  station: Station | null
  distance: number | null
  error: string | null
}

export function useNearestStation() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const userLocation = ref<UserLocation | null>(null)
  const nearestStation = ref<Station | null>(null)
  const distance = ref<number | null>(null)
  
  // Real-time tracking
  const isTracking = ref(false)
  const trackingInterval = ref<number | null>(null)
  const lastUpdateTime = ref<Date | null>(null)

  // Check if geolocation is available
  const isGeolocationAvailable = computed(() => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
  })

  // Get current user location
  const getCurrentLocation = (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!isGeolocationAvailable.value) {
        const errorMsg = 'Geolocation is not available in your browser'
        error.value = errorMsg
        reject(new Error(errorMsg))
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
          const location: UserLocation = {
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp: new Date(position.timestamp)
          }

          userLocation.value = location
          lastUpdateTime.value = new Date()
          isLoading.value = false
          resolve(location)
        },
        (err) => {
          isLoading.value = false
          let errorMessage = 'Could not get your location'
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Enable it in your browser settings.'
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.'
              break
            case err.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }

          error.value = errorMessage
          reject(new Error(errorMessage))
        },
        options
      )
    })
  }

  // Start real-time location tracking
  const startRealTimeTracking = (callback?: (location: UserLocation) => void) => {
    if (!isGeolocationAvailable.value) {
      error.value = 'Geolocation is not available in your browser'
      return
    }

    if (isTracking.value) {
      stopRealTimeTracking()
    }

    isTracking.value = true
    lastUpdateTime.value = new Date()

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }

    trackingInterval.value = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          const location: UserLocation = {
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp: new Date(position.timestamp)
          }

          userLocation.value = location
          lastUpdateTime.value = new Date()
          
          if (callback) {
            callback(location)
          }
        },
        (err) => {
          console.error('Real-time tracking error:', err)
          if (err.code === err.PERMISSION_DENIED) {
            stopRealTimeTracking()
            error.value = 'Location permission denied. Tracking stopped.'
          }
        },
        options
      )
    }, 1500) // Update every 1.5 seconds (less than 2 seconds)
  }

  // Stop real-time tracking
  const stopRealTimeTracking = () => {
    if (trackingInterval.value) {
      clearInterval(trackingInterval.value)
      trackingInterval.value = null
    }
    isTracking.value = false
  }

  // Find nearest station using Turf.js
  const findNearestStation = (location: UserLocation): NearestStationResult => {
    try {
      if (!location || !location.lat || !location.lng) {
        return {
          station: null,
          distance: null,
          error: 'Invalid location provided'
        }
      }

      // Create user point
      const userPoint = point([location.lng, location.lat])

      // Create station points
      const stationPoints = stations.map(station => 
        point([station.lng, station.lat], {
          name: station.name,
          id: station.id,
          type: station.type,
          area: station.area
        })
      )

      // Create feature collection
      const stationFeatures = featureCollection(stationPoints)

      // Find nearest station using Turf.js
      const nearest = nearestPoint(userPoint, stationFeatures)

      if (nearest && nearest.properties) {
        const station = stations.find(s => s.id === nearest.properties.id)
        if (station) {
          // Calculate distance in kilometers manually using Haversine formula
          const R = 6371 // Earth's radius in kilometers
          const dLat = (station.lat - location.lat) * Math.PI / 180
          const dLng = (station.lng - location.lng) * Math.PI / 180
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(location.lat * Math.PI / 180) * Math.cos(station.lat * Math.PI / 180) *
                    Math.sin(dLng/2) * Math.sin(dLng/2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          const distanceKm = R * c
          
          nearestStation.value = station
          distance.value = distanceKm

          return {
            station,
            distance: distanceKm,
            error: null
          }
        }
      }

      return {
        station: null,
        distance: null,
        error: 'No stations found'
      }
    } catch (err) {
      const errorMsg = 'Error calculating nearest station'
      error.value = errorMsg
      return {
        station: null,
        distance: null,
        error: errorMsg
      }
    }
  }

  // Get nearest station (combines getting location + finding nearest)
  const getNearestStation = async (): Promise<NearestStationResult> => {
    try {
      const location = await getCurrentLocation()
      return findNearestStation(location)
    } catch (err) {
      return {
        station: null,
        distance: null,
        error: err instanceof Error ? err.message : 'Failed to get nearest station'
      }
    }
  }

  // Reset state
  const reset = () => {
    isLoading.value = false
    error.value = null
    userLocation.value = null
    nearestStation.value = null
    distance.value = null
    stopRealTimeTracking()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopRealTimeTracking()
  })

  return {
    // State
    isLoading,
    error,
    userLocation: computed(() => userLocation.value),
    nearestStation: computed(() => nearestStation.value),
    distance: computed(() => distance.value),
    isGeolocationAvailable,
    isTracking: computed(() => isTracking.value),
    lastUpdateTime: computed(() => lastUpdateTime.value),

    // Methods
    getCurrentLocation,
    findNearestStation,
    getNearestStation,
    startRealTimeTracking,
    stopRealTimeTracking,
    reset
  }
}
