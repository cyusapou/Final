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
        <span v-if="currentStep > index + 1" class="checkmark">✓</span>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <span class="step-label">{{ step }}</span>
      <div v-if="index < steps.length - 1" class="step-line"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
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
  if (path === '/trips') return 2
  if (path === '/destination') return 3
  if (path === '/summary') return 4
  if (path === '/payment') return 5
  return 1
})

const steps = computed(() => [
  t.value.step1,
  t.value.step2,
  t.value.step3,
  t.value.step4
])

// Watch for route changes to update step
watch(() => route.path, () => {
  // Force reactivity update
})
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

.step.active .step-circle {
  background: #2E7D32;
  color: #FFF;
}

.step.completed .step-circle {
  background: #2E7D32;
  color: #FFF;
}

.checkmark {
  font-size: 14px;
}

.step-label {
  font-size: 11px;
  color: #757575;
  white-space: nowrap;
  font-weight: 500;
  transition: color 0.3s ease;
}

.step.active .step-label {
  color: #2E7D32;
  font-weight: 600;
}

.step.completed .step-label {
  color: #2E7D32;
}

.step-line {
  width: 24px;
  height: 2px;
  background: #E8E8E8;
  margin: 0 8px;
  flex-shrink: 0;
}

.step.completed + .step .step-line,
.step.completed .step-line {
  background: #2E7D32;
}

/* Desktop styles */
@media (min-width: 1024px) {
  .step-progress {
    padding: 20px 24px;
  }
  
  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .step-label {
    font-size: 13px;
  }
  
  .step-line {
    width: 40px;
  }
}
</style>
