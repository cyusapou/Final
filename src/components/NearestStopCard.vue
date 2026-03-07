<template>
  <div class="nearest-stop-card">
    <div class="card-header">
      <span v-if="stop.isGoogleVerified" class="verified-badge">
         Google Maps Verified
      </span>
    </div>

    <!-- Main stop info -->
    <div class="stop-main">
      <div class="stop-icon"><i class="fas fa-bus"></i></div>
      <div class="stop-info">
        <p class="stop-label">Your nearest boarding stop</p>
        <h3 class="stop-name">{{ stop.name }}</h3>
        <p v-if="stop.area" class="stop-area">{{ stop.area }}</p>
        <p class="stop-distance">{{ stop.distanceLabel }}</p>
        <span v-if="stop.code" class="stop-code">Code: {{ stop.code }}</span>
      </div>
    </div>

    <!-- Route arrow -->
    <div class="route-arrow">
      <span>↓ Takes you to</span>
    </div>

    <!-- Destination info -->
    <div class="destination-info">
      <div class="dest-icon"><i class="fas fa-crosshairs"></i></div>
      <div class="dest-details">
        <h3 class="dest-name">{{ destination.name }}</h3>
        <span v-if="destination.code" class="dest-code">Code: {{ destination.code }}</span>
      </div>
    </div>

    <!-- Alternative stops (collapsible) -->
    <details v-if="alternatives.length" class="alternatives">
      <summary>See {{ alternatives.length }} other nearby {{ alternatives.length === 1 ? 'stop' : 'stops' }}</summary>
      <ul class="alt-list">
        <li v-for="alt in alternatives" :key="alt.id" class="alt-item">
          <div class="alt-name">{{ alt.name }}</div>
          <div class="alt-meta">
            <span class="alt-distance">{{ alt.distanceLabel }}</span>
            <span v-if="alt.code" class="alt-code">{{ alt.code }}</span>
          </div>
        </li>
      </ul>
    </details>

    <!-- Actions -->
    <div class="card-actions">
      <button class="btn-secondary" @click="$emit('change')">
        <span>← Change</span>
      </button>
      <button class="btn-primary" @click="$emit('confirm')">
        <span>Book from here →</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stop: {
    type: Object,
    required: true,
  },
  destination: {
    type: Object,
    required: true,
  },
  alternatives: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['confirm', 'change'])
</script>

<style scoped>
.nearest-stop-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

@media (min-width: 768px) {
  .nearest-stop-card {
    max-width: 600px;
    margin: 16px auto 0;
    padding: 16px;
  }
}

.card-header {
  margin-bottom: 12px;
}

.verified-badge {
  font-size: 0.75rem;
  color: #1a73e8;
  font-weight: 600;
  background: #e3f2fd;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
}

.stop-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .stop-main {
    gap: 10px;
    margin-bottom: 10px;
  }
}

.stop-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .stop-icon {
    font-size: 1.6rem;
  }
}

.stop-info {
  flex: 1;
}

.stop-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

@media (min-width: 768px) {
  .stop-label {
    font-size: 0.7rem;
  }
}

.stop-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .stop-name {
    font-size: 1rem;
  }
}

.stop-area {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 6px 0;
}

@media (min-width: 768px) {
  .stop-area {
    font-size: 0.8rem;
  }
}

.stop-distance {
  font-size: 0.95rem;
  color: #4caf50;
  font-weight: 600;
  margin: 0 0 6px 0;
}

.stop-code {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.route-arrow {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin: 12px 0;
  font-weight: 600;
}

.destination-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-bottom: 16px;
}

.dest-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .dest-icon {
    font-size: 1.5rem;
  }
}

.dest-details {
  flex: 1;
}

.dest-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

.dest-code {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  background: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.alternatives {
  margin: 16px 0;
  font-size: 0.9rem;
}

.alternatives summary {
  cursor: pointer;
  color: var(--accent-blue);
  font-weight: 600;
  padding: 8px 0;
  transition: color 0.2s ease;
}

.alternatives summary:hover {
  color: var(--primary-green);
}

.alt-list {
  list-style: none;
  margin: 8px 0 0 0;
  padding: 8px 8px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.alt-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.alt-item:last-child {
  border-bottom: none;
}

.alt-name {
  font-weight: 600;
  color: var(--text-primary);
}

.alt-meta {
  display: flex;
  gap: 8px;
  font-size: 0.8rem;
}

.alt-distance {
  color: #4caf50;
  font-weight: 600;
}

.alt-code {
  color: var(--text-tertiary);
  background: var(--bg-primary);
  padding: 1px 4px;
  border-radius: 3px;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

@media (min-width: 768px) {
  .btn-primary,
  .btn-secondary {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
  
  .nearest-stop-card {
    padding: 16px;
  }
}

.btn-primary {
  background: var(--primary-green);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-green-dark);
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: transparent;
  border: 1.5px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.btn-secondary:active {
  transform: scale(0.98);
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .nearest-stop-card {
    padding: 16px;
    margin-top: 12px;
  }

  .stop-name {
    font-size: 1rem;
  }

  .card-actions {
    gap: 8px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}

/* Dark mode overrides */
html.dark .verified-badge { background: rgba(26,115,232,0.15); color: #64B5F6; }
</style>
