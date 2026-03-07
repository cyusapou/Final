<template>
  <span class="badge" :class="badgeClass">
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusMap = {
  Active: { label: 'Active', class: 'active' },
  Inactive: { label: 'Inactive', class: 'inactive' },
  Suspended: { label: 'Suspended', class: 'suspended' },
  Pending: { label: 'Pending', class: 'pending' },
  Offline: { label: 'Offline', class: 'offline' },
  Online: { label: 'Online', class: 'active' },
  OnBreak: { label: 'On Break', class: 'pending' },
  'On Break': { label: 'On Break', class: 'pending' },
  Licensed: { label: 'Licensed', class: 'active' },
  Provisional: { label: 'Provisional', class: 'pending' },
  Compliant: { label: 'Compliant', class: 'active' },
  NonCompliant: { label: 'Non-Compliant', class: 'suspended' },
  Resolved: { label: 'Resolved', class: 'active' },
  Open: { label: 'Open', class: 'suspended' },
  'In Review': { label: 'In Review', class: 'pending' },
}

const statusData = computed(() => statusMap[props.status] || { label: props.status, class: 'default' })
const statusLabel = computed(() => statusData.value.label)
const badgeClass = computed(() => statusData.value.class)
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.active {
  background: #d1f4d1;
  color: #1b5e20;
}

.badge.inactive {
  background: #eceff1;
  color: #546e7a;
}

.badge.suspended {
  background: #ffebee;
  color: #c62828;
}

.badge.pending {
  background: #fff8e1;
  color: #f57f17;
}

.badge.offline {
  background: #eceff1;
  color: #546e7a;
}

.badge.default {
  background: #e8eaf6;
  color: #283593;
}
</style>
