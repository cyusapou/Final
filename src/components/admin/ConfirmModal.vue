<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title"><i class="fas fa-exclamation-triangle"></i> Confirm Action</h3>
        <button class="close-btn" @click="$emit('cancel')"><i class="fas fa-times"></i></button>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button class="btn btn-danger" @click="$emit('confirm')">
          {{ actionLabel || 'Confirm' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  },
  actionLabel: String
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e8ecf1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #5a6c7d;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1a202c;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  font-size: 14px;
  color: #5a6c7d;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid #e8ecf1;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e8ecf1;
  color: #1a202c;
}

.btn-secondary:hover {
  background: #d0d7e0;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Dark mode */
html.dark .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

html.dark .modal-dialog {
  background: var(--surface);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.4);
}

html.dark .modal-header {
  border-color: var(--border);
}

html.dark .modal-title {
  color: var(--text);
}

html.dark .close-btn {
  color: var(--text-muted);
}

html.dark .close-btn:hover {
  color: var(--text);
}

html.dark .modal-body p {
  color: var(--text-muted);
}

html.dark .modal-footer {
  border-color: var(--border);
}

html.dark .btn-secondary {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
}

html.dark .btn-secondary:hover {
  background: var(--hover);
}
</style>
