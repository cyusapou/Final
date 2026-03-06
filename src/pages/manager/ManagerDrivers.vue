<template>
  <div class="page bg-white dark:bg-neutral-900 transition-colors">
    <div class="page-header">
      <h1>👨‍✊️ Driver Management</h1>
      <p class="subtitle">Manage and monitor driver performance</p>
    </div>

    <div class="filters">
      <input type="text" placeholder="Search driver name or ID..." class="search-input" v-model="searchQuery" />
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="online">Online</option>
        <option value="on-break">On Break</option>
        <option value="offline">Offline</option>
      </select>
    </div>

    <div class="card">
      <h3>👨‍🚕 All Drivers</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Status</th>
            <th>Today's Trips</th>
            <th>Rating</th>
            <th>Incidents</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>DRV001</td>
            <td><span class="badge badge-online">Online</span></td>
            <td>3/4</td>
            <td>4.8⭐</td>
            <td><span class="incident-badge">0</span></td>
            <td><button class="action-btn">View</button></td>
          </tr>
          <tr>
            <td>Jane Smith</td>
            <td>DRV002</td>
            <td><span class="badge badge-online">Online</span></td>
            <td>2/3</td>
            <td>4.6⭐</td>
            <td><span class="incident-badge">1</span></td>
            <td><button class="action-btn">View</button></td>
          </tr>
          <tr>
            <td>Peter Johnson</td>
            <td>DRV003</td>
            <td><span class="badge badge-break">On Break</span></td>
            <td>1/3</td>
            <td>4.5⭐</td>
            <td><span class="incident-badge">0</span></td>
            <td><button class="action-btn">View</button></td>
          </tr>
          <tr>
            <td>Sarah Williams</td>
            <td>DRV004</td>
            <td><span class="badge badge-online">Online</span></td>
            <td>4/4</td>
            <td>4.9⭐</td>
            <td><span class="incident-badge">0</span></td>
            <td><button class="action-btn">View</button></td>
          </tr>
          <tr>
            <td>Michael Brown</td>
            <td>DRV005</td>
            <td><span class="badge badge-offline">Offline</span></td>
            <td>0/2</td>
            <td>4.2⭐</td>
            <td><span class="incident-badge warn">2</span></td>
            <td><button class="action-btn">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
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

.search-input, .filter-select {
  padding: 10px 12px;
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  font-size: 13px;
}

.search-input {
  flex: 1;
}

.filter-select {
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
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.badge-online {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-break {
  background: #fff3e0;
  color: #f57c00;
}

.badge-offline {
  background: #f5f6fa;
  color: #757575;
}

.incident-badge {
  display: inline-block;
  background: #e8f5e9;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.incident-badge.warn {
  background: #ffebee;
  color: #c62828;
}

.action-btn {
  padding: 6px 12px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.action-btn:hover {
  background: #1b5e20;
}
</style>
