<template>
  <div class="data-table-container">
    <!-- Search & Filter Bar -->
    <div v-if="searchable || filterable" class="table-toolbar">
      <div class="toolbar-left">
        <input
          v-if="searchable"
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="search-input"
        />
      </div>
      <div class="toolbar-right">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: column.width }"
              @click="toggleSort(column.key)"
              :class="{ sortable: column.sortable !== false }"
            >
              <div class="header-cell">
                {{ column.label }}
                <span v-if="sortColumn === column.key" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredRows.length === 0" class="empty-row">
            <td :colspan="columns.length" class="empty-cell">
              <p>{{ emptyMessage }}</p>
            </td>
          </tr>
          <tr
            v-for="(row, idx) in paginatedRows"
            :key="idx"
            @click="$emit('row-click', row)"
            class="data-row"
          >
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :row="row">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pageable && totalPages > 1" class="table-pagination">
      <button :disabled="currentPage === 1" @click="currentPage--"><i class="fas fa-chevron-left"></i> Prev</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">Next <i class="fas fa-chevron-right"></i></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    required: true
  },
  searchable: {
    type: Boolean,
    default: true
  },
  filterable: {
    type: Boolean,
    default: false
  },
  sortable: {
    type: Boolean,
    default: true
  },
  pageable: {
    type: Boolean,
    default: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  emptyMessage: {
    type: String,
    default: 'No data found'
  }
})

defineEmits(['row-click'])

const searchQuery = ref('')
const sortColumn = ref(null)
const sortOrder = ref('asc')
const currentPage = ref(1)

const filteredRows = computed(() => {
  let result = props.rows

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(query)
      )
    )
  }

  // Apply sorting
  if (sortColumn.value) {
    result = [...result].sort((a, b) => {
      const aVal = a[sortColumn.value]
      const bVal = b[sortColumn.value]

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return result
})

const totalPages = computed(() =>
  Math.ceil(filteredRows.value.length / props.pageSize)
)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredRows.value.slice(start, end)
})

function toggleSort(columnKey) {
  if (!props.sortable) return

  if (sortColumn.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = columnKey
    sortOrder.value = 'asc'
  }
}
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e8ecf1;
  overflow: hidden;
}

.table-toolbar {
  padding: 16px;
  border-bottom: 1px solid #e8ecf1;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-left {
  flex: 1;
  min-width: 200px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8ecf1;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead {
  background: #f5f6fa;
  border-bottom: 2px solid #e8ecf1;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #5a6c7d;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table th.sortable:hover {
  background: #ecf0f4;
}

.header-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-indicator {
  font-size: 12px;
  color: #2E7D32;
}

.data-table tbody tr {
  border-bottom: 1px solid #e8ecf1;
}

.data-table tbody tr:hover {
  background: #f9fafc;
}

.data-table td {
  padding: 12px 16px;
  color: #1a202c;
}

.empty-row {
  background: #f5f6fa;
}

.empty-cell {
  text-align: center;
  padding: 40px !important;
}

.empty-cell p {
  margin: 0;
  color: #5a6c7d;
}

.data-row {
  cursor: pointer;
  transition: background 0.2s;
}

.table-pagination {
  padding: 16px;
  border-top: 1px solid #e8ecf1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.table-pagination button {
  padding: 8px 12px;
  border: 1px solid #e8ecf1;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.table-pagination button:hover:not(:disabled) {
  background: #e8f5e9;
  border-color: #2E7D32;
}

.table-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .table-wrapper {
    overflow-x: auto;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }
}
</style>
