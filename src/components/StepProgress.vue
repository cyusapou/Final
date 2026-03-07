<template>
  <div class="step-progress">
    <div 
      v-for="(step, index) in steps" 
      :key="index"
      :class="['step', { 
        active: currentStep === index + 1,
        completed: currentStep > index + 1
      }]"
    >
      <div class="step-circle">
        <span v-if="currentStep > index + 1" class="checkmark"><i class="fas fa-check"></i></span>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <span class="step-label">{{ step }}</span>
      <div v-if="index < steps.length - 1" class="step-line"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'

const route = useRoute()
const currentLang = ref(store.currentLang)
const t = computed(() => translations[currentLang.value])

const currentStep = computed(() => {
  const path = route.path
  if (path === '/' || path === '') return 1
  if (path === '/express') return 1
  if (path === '/destination') return 2
  if (path === '/summary') return 3
  if (path === '/payment') return 4
  return 1
})

const steps = computed(() => [
  t.value.step1,
  t.value.step2,
  t.value.step3,
  t.value.step4
])

watch(() => route.path, () => {})
</script>

<style scoped>
.step-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 16px;
  background: #FFF;
  border-bottom: 1px solid #E8E8E8;
  overflow-x: auto;
  max-width: 960px;
  margin: 0 auto;
}

html.dark .step-progress {
  background: var(--bg);
  border-bottom-color: var(--border);
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F5F5F5;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

html.dark .step-circle {
  background: var(--surface);
  color: var(--text-muted);
}

.step.active .step-circle {
  background: #2E7D32;
  color: #FFF;
}

html.dark .step.active .step-circle {
  background: var(--green);
  color: #fff;
}

.step.completed .step-circle {
  background: #2E7D32;
  color: #FFF;
}

html.dark .step.completed .step-circle {
  background: var(--green);
  color: #fff;
}

.checkmark { font-size: 14px; }

.step-label {
  font-size: 11px;
  color: #757575;
  white-space: nowrap;
  font-weight: 500;
  transition: color 0.3s ease;
}

html.dark .step-label {
  color: var(--text-muted);
}

.step.active .step-label {
  color: #2E7D32;
  font-weight: 600;
}

html.dark .step.active .step-label {
  color: var(--text);
  font-weight: 600;
}

.step.completed .step-label {
  color: #2E7D32;
}

html.dark .step.completed .step-label {
  color: var(--text);
}

.step-line {
  width: 24px;
  height: 2px;
  background: #E8E8E8;
  margin: 0 8px;
  flex-shrink: 0;
  transition: background 0.4s ease;
}

html.dark .step-line {
  background: rgba(255, 255, 255, 0.15);
}

.step.completed + .step .step-line,
.step.completed .step-line {
  background: #2E7D32;
}

html.dark .step.completed + .step .step-line,
html.dark .step.completed .step-line {
  background: var(--green);
}

@media (min-width: 1024px) {
  .step-progress { padding: 20px 24px; }
  .step-circle { width: 32px; height: 32px; font-size: 14px; }
  .step-label { font-size: 13px; }
  .step-line { width: 40px; }
}
</style>
