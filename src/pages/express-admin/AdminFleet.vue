<template>
  <div class="page bg-white dark:bg-neutral-900 transition-colors">
    <div class="page-header">
      <h1>🚍 Fleet Management</h1>
      <p class="subtitle">Monitor and manage all vehicles in your fleet</p>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">28</div>
        <div class="stat-label">Total Vehicles</div>
      </div>
      <div class="stat-box active">
        <div class="stat-value">24</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-box maintenance">
        <div class="stat-value">2</div>
        <div class="stat-label">Maintenance</div>
      </div>
      <div class="stat-box available">
        <div class="stat-value">22</div>
        <div class="stat-label">Available</div>
      </div>
    </div>

    <div class="card">
      <h3>🚍 Fleet Inventory</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>Registration</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Last Service</th>
            <th>Mileage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>VH001</td>
            <td>KCA 123A</td>
            <td>Luxury Coach</td>
            <td>50</td>
            <td><span class="badge green">🟢 Active</span></td>
            <td>Feb 28</td>
            <td>124,567 km</td>
          </tr>
          <tr>
            <td>VH002</td>
            <td>KCA 124A</td>
            <td>Standard Coach</td>
            <td>50</td>
            <td><span class="badge green">🟢 Active</span></td>
            <td>Feb 25</td>
            <td>98,234 km</td>
          </tr>
          <tr>
            <td>VH003</td>
            <td>KCA 125A</td>
            <td>Mini Bus</td>
            <td>14</td>
            <td><span class="badge orange">🟨 Maintenance</span></td>
            <td>Feb 20</td>
            <td>145,678 km</td>
          </tr>
          <tr>
            <td>VH004</td>
            <td>KCA 126A</td>
            <td>Standard Coach</td>
            <td>50</td>
            <td><span class="badge green">🟢 Active</span></td>
            <td>Mar 1</td>
            <td>102,456 km</td>
          </tr>
          <tr>
            <td>VH005</td>
            <td>KCA 127A</td>
            <td>Luxury Coach</td>
            <td>50</td>
            <td><span class="badge gray">⤷ Idle</span></td>
            <td>Jan 15</td>
            <td>156,789 km</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #e8ecf1;
  text-align: center;
}

.stat-box.active {
  border-left-color: #2e7d32;
}

.stat-box.maintenance {
  border-left-color: #f57c00;
}

.stat-box.available {
  border-left-color: #2e7d32;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-box.active .stat-value {
  color: #2e7d32;
}

.stat-box.maintenance .stat-value {
  color: #f57c00;
}

.stat-box.available .stat-value {
  color: #2e7d32;
}

.stat-label {
  font-size: 12px;
  color: #757575;
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
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge.green {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge.orange {
  background: #fff3e0;
  color: #f57c00;
}

.badge.gray {
  background: #f5f6fa;
  color: #757575;
}
</style>
