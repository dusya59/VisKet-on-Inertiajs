<template>
  <div>
    <div class="form-row">
      <div class="form-group">
        <div class="multiselect-container">
          <div 
            class="multiselect-trigger" 
            @click="dropdownOpen = !dropdownOpen"
          >
            <span v-if="selectedSkills.length === 0">Выберите навыки</span>
            <span v-else>Выбрано: {{ selectedSkills.length }}</span>
            <span class="arrow">▼</span>
          </div>
          <div v-if="dropdownOpen" class="multiselect-dropdown">
            <div 
              v-for="skill in skills" 
              :key="skill.id"
              class="multiselect-option"
              :class="{ selected: isSkillSelected(skill.id) }"
              @click="toggleSkill(skill)"
            >
              <span class="skill-name" :class="getSkillClass(skill.name)">{{ skill.name }}</span>
              <span v-if="isSkillSelected(skill.id)" class="check">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedSkills.length > 0" class="selected-skills">
      <div 
        v-for="skill in selectedSkills" 
        :key="skill.id" 
        class="skill-tag"
        :class="getSkillClass(skill.name)"
      >
        <span class="skill-name">{{ skill.name }}</span>
        <div class="skill-level">
          <label>Уровень:</label>
          <select v-model="skill.level" @change="emitUpdate">
            <option :value="1">1</option>
            <option :value="2">2</option>
            <option :value="3">3</option>
            <option :value="4">4</option>
            <option :value="5">5</option>
          </select>
        </div>
        <button type="button" class="remove-skill" @click="removeSkill(skill.id)">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getSkillClass } from '@/composables/useSkills'

const props = defineProps({
  skills: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const dropdownOpen = ref(false)

const selectedSkills = ref([...props.modelValue])

watch(() => props.modelValue, (newVal) => {
  selectedSkills.value = [...newVal]
}, { deep: true })

const emitUpdate = () => {
  emit('update:modelValue', selectedSkills.value)
}

const isSkillSelected = (skillId) => {
  return selectedSkills.value.some(s => s.id === skillId)
}

const toggleSkill = (skill) => {
  if (isSkillSelected(skill.id)) {
    removeSkill(skill.id)
  } else {
    selectedSkills.value.push({
      id: skill.id,
      name: skill.name,
      level: 3
    })
  }
  emitUpdate()
  dropdownOpen.value = false
}

const removeSkill = (skillId) => {
  selectedSkills.value = selectedSkills.value.filter(s => s.id !== skillId)
  emitUpdate()
}
</script>

<style scoped>
.multiselect-container {
  position: relative;
}

.multiselect-trigger {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s ease;
}

.multiselect-trigger:hover {
  border-color: rgb(255, 52, 52);
}

.multiselect-trigger .arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.multiselect-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  margin-top: 4px;
}

.multiselect-option {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease;
}

.multiselect-option:hover {
  background: #f8fafc;
}

.multiselect-option.selected {
  background: #f0f9ff;
}

.multiselect-option .check {
  color: rgb(255, 52, 52);
  font-weight: bold;
}

.selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.skill-tag.skill-php {
  background: #6b21a8;
  color: white;
}

.skill-tag.skill-laravel {
  background: #ff5722;
  color: white;
}

.skill-tag.skill-js {
  background: #fbbf24;
  color: #1f2937;
}

.skill-tag.skill-vue {
  background: #16a34a;
  color: white;
}

.skill-tag.skill-react {
  background: #0ea5e9;
  color: white;
}

.skill-tag.skill-node {
  background: #15803d;
  color: white;
}

.skill-tag.skill-python {
  background: #2563eb;
  color: white;
}

.skill-tag.skill-django {
  background: #0f766e;
  color: white;
}

.skill-tag.skill-design,
.skill-tag.skill-uiux {
  background: #ec4899;
  color: white;
}

.skill-tag.skill-figma {
  background: #f59e0b;
  color: #1f2937;
}

.skill-tag.skill-photoshop,
.skill-tag.skill-illustrator {
  background: #3b82f6;
  color: white;
}

.skill-tag.skill-copywriting,
.skill-tag.skill-content {
  background: #8b5cf6;
  color: white;
}

.skill-tag.skill-marketing,
.skill-tag.skill-seo,
.skill-tag.skill-smm {
  background: #14b8a6;
  color: white;
}

.skill-tag.skill-video {
  background: #ef4444;
  color: white;
}

.skill-tag.skill-3d {
  background: #f97316;
  color: white;
}

.skill-tag.skill-animation,
.skill-tag.skill-motion {
  background: #d946ef;
  color: white;
}

.skill-tag.skill-translation {
  background: #06b6d4;
  color: white;
}

.skill-tag.skill-data,
.skill-tag.skill-excel {
  background: #22c55e;
  color: white;
}

.skill-tag.skill-default {
  background: #64748b;
  color: white;
}

.skill-name {
  font-weight: 500;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 4px;
}

.skill-level label {
  font-size: 11px;
  opacity: 0.8;
}

.skill-level select {
  padding: 2px 6px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.skill-level select option {
  background: #333;
  color: white;
}

.remove-skill {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  padding: 0 4px;
}

.remove-skill:hover {
  opacity: 1;
}
</style>
