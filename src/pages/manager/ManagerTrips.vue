<template>
  <div class="page bg-white dark:bg-neutral-900 transition-colors">
    <div class="page-header">
      <h1>🗨️ Live Trips Monitoring</h1>
      <p class="subtitle">Real-time visibility of all active trips</p>
    </div>

    <div class="filters">
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="on-time">On Time</option>
        <option value="delayed">Delayed</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div class="card">
      <h3>🚌 Active Trips</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Driver</th>
            <th>Route</th>
            <th>Passengers</th>
            <th>Location</th>
            <th>Status</th>
            <th>ETA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>TRP001</td>
            <td>John Doe</td>
            <td>Nairobi → Mombasa</td>
            <td>45/50</td>
            <td>45 km from destination</td>
            <td><span class="badge badge-success">✓ On Time</span></td>
            <td>2:30 PM</td>
          </tr>
          <tr>
            <td>TRP002</td>
            <td>Jane Smith</td>
            <td>Nairobi → Kisumu</td>
            <td>38/50</td>
            <td>67 km in progress</td>
            <td><span class="badge badge-warning">⏱ Delayed 5 min</span></td>
            <td>3:45 PM</td>
          </tr>
          <tr>
            <td>TRP003</td>
            <td>Peter Johnson</td>
            <td>Nairobi → Nakuru</td>
            <td>52/50</td>
            <td>25 km from destination</td>
            <td><span class="badge badge-success">✓ On Time</span></td>
            <td>4:00 PM</td>
          </tr>
          <tr>
            <td>TRP004</td>
            <td>Sarah Williams</td>
            <td>Nairobi → Eldoret</td>
            <td>42/50</td>
            <td>89 km in progress</td>
            <td><span class="badge badge-error">✕ Delayed 15 min</span></td>
            <td>5:15 PM</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const filterStatus = ref('')
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.subtitle {
  margin: 0;
  color: #757575;
  font-size: 13px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  font-size: 13px;
  min-width: 150px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e8ecf1;
}

.card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #f5f6fa;
  padding: 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #424242;
  border-bottom: 1px solid #e8ecf1;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.data-table tbody tr:hover {
  background: #fafafa;
  cursor: pointer;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-success {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-warning {
  background: #fff3e0;
  color: #f57c00;
}

.badge-error {
  background: #ffebee;
  color: #c62828;
}
</style>
