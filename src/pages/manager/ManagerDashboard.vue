<template>
  <div class="page bg-white dark:bg-neutral-900 transition-colors">
    <div class="page-header">
      <h1>👔 Manager Dashboard</h1>
      <p class="subtitle">Manage drivers, trips, and operations</p>
    </div>

    <div class="stats-grid">
      <StatsCard icon="🧑‍✈️" label="Drivers On Duty" value="12" trend="+3 today" />
      <StatsCard icon="🚌" label="Active Trips" value="8" trend="-1 vs yesterday" />
      <StatsCard icon="⏱️" label="Delayed Trips" value="2" trend="+2 today" />
      <StatsCard icon="⚠️" label="Incidents" value="1" trend="No change" />
    </div>

    <div class="cards-row">
      <div class="card card-full">
        <h3>📍 Active Trips</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Passengers</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TRP001</td>
              <td>John Doe</td>
              <td>Nairobi → Mombasa</td>
              <td>45/50</td>
              <td><span class="badge badge-success">On Time</span></td>
            </tr>
            <tr>
              <td>TRP002</td>
              <td>Jane Smith</td>
              <td>Nairobi → Kisumu</td>
              <td>38/50</td>
              <td><span class="badge badge-warning">Delayed 5min</span></td>
            </tr>
            <tr>
              <td>TRP003</td>
              <td>Peter Johnson</td>
              <td>Nairobi → Nakuru</td>
              <td>52/50</td>
              <td><span class="badge badge-success">On Time</span></td>
            </tr>
            <tr>
              <td>TRP004</td>
              <td>Sarah Williams</td>
              <td>Nairobi → Eldoret</td>
              <td>42/50</td>
              <td><span class="badge badge-error">Delayed 15min</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="cards-row">
      <div class="card">
        <h3>👥 Top Drivers</h3>
        <table class="data-table">
          <tbody>
            <tr>
              <td class="driver-name">🏆 John Doe</td>
              <td class="right">156 trips</td>
            </tr>
            <tr>
              <td class="driver-name">Jane Smith</td>
              <td class="right">142 trips</td>
            </tr>
            <tr>
              <td class="driver-name">Peter Johnson</td>
              <td class="right">138 trips</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <h3>⚠️ Incident Report</h3>
        <table class="data-table">
          <tbody>
            <tr>
              <td class="incident">Minor delay</td>
              <td class="right right-danger">8</td>
            </tr>
            <tr>
              <td class="incident">Passenger complaint</td>
              <td class="right right-danger">3</td>
            </tr>
            <tr>
              <td class="incident">Vehicle issue</td>
              <td class="right right-danger">1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatsCard from '../../components/admin/StatsCard.vue'
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: #757575;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e8ecf1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.card-full {
  grid-column: 1 / -1;
}

.card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
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
  font-size: 13px;
}

.data-table tbody tr:hover {
  background: #fafafa;
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

.right {
  text-align: right;
}

.right-danger {
  color: #c62828;
}

.driver-name {
  font-weight: 500;
}

.incident {
  color: #757575;
}

@media (max-width: 768px) {
  .cards-row {
    grid-template-columns: 1fr;
  }
}</style>
