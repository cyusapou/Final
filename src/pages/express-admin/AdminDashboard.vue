<template>
  <div class="page bg-white dark:bg-neutral-950 transition-colors">
    <div class="page-header">
      <h1><i class="fas fa-briefcase"></i> Express Admin Dashboard</h1>
      <p class="subtitle">Business performance and operations overview</p>
    </div>

    <div class="stats-grid">
      <StatsCard icon="fas fa-coins" label="Monthly Revenue" value="450,000 RWF" trend="+12%" />
      <StatsCard icon="fas fa-bus" label="Total Trips" value="1,234" trend="+5%" />
      <StatsCard icon="fas fa-user-tie" label="Active Managers" value="5" trend="No change" />
      <StatsCard icon="fas fa-bus-alt" label="Fleet Size" value="28" trend="-1 maintenance" />
    </div>

    <div class="cards-row">
      <div class="card card-full">
        <h3><i class="fas fa-chart-bar"></i> Revenue By Manager</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Manager</th>
              <th>Trips</th>
              <th>Revenue</th>
              <th>Avg Rating</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jane Smith</td>
              <td>324</td>
              <td>125,400 RWF</td>
              <td>4.8 <i class="fas fa-star"></i></td>
              <td><span class="badge badge-success">Excellent</span></td>
            </tr>
            <tr>
              <td>Peter Johnson</td>
              <td>298</td>
              <td>112,300 RWF</td>
              <td>4.6 <i class="fas fa-star"></i></td>
              <td><span class="badge badge-success">Good</span></td>
            </tr>
            <tr>
              <td>Sarah Williams</td>
              <td>276</td>
              <td>105,200 RWF</td>
              <td>4.5 <i class="fas fa-star"></i></td>
              <td><span class="badge badge-success">Good</span></td>
            </tr>
            <tr>
              <td>Michael Brown</td>
              <td>198</td>
              <td>78,900 RWF</td>
              <td>4.3 <i class="fas fa-star"></i></td>
              <td><span class="badge badge-warning">Fair</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="cards-row">
      <div class="card">
        <h3><i class="fas fa-car"></i> Fleet Status</h3>
        <div class="fleet-stat">
          <span>Active</span>
          <span class="value active">24</span>
        </div>
        <div class="fleet-stat">
          <span>In Maintenance</span>
          <span class="value warn">2</span>
        </div>
        <div class="fleet-stat">
          <span>Available</span>
          <span class="value success">22</span>
        </div>
      </div>
      <div class="card">
        <h3><i class="fas fa-exclamation-triangle"></i> System Health</h3>
        <div class="health-stat">
          <span>API Uptime</span>
          <div class="progress-bar"><div class="progress" style="width: 99%"></div></div>
          <span class="percent">99%</span>
        </div>
        <div class="health-stat">
          <span>Avg Response Time</span>
          <span class="value">142ms</span>
        </div>
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

.fleet-stat, .health-stat {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.fleet-stat:last-child, .health-stat:last-child {
  border-bottom: none;
}

.value {
  font-weight: 600;
}

.value.active {
  color: #2e7d32;
}

.value.warn {
  color: #f57c00;
}

.value.success {
  color: #2e7d32;
}

.progress-bar {
  flex: 1;
  margin: 0 12px;
  height: 6px;
  background: #e8ecf1;
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #2e7d32;
}

.percent {
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .cards-row {
    grid-template-columns: 1fr;
  }
}
</style>
