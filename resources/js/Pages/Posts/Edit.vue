<template>
  <AppLayout>
    <Head title="Редактировать пост" />

    <div class="edit-post-page">
      <form @submit.prevent="submit">
        <div class="block">
          <div 
            class="image-container"
            @click="handleAreaClick"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <input 
              type="file" 
              ref="fileInputRef"
              accept="image/*" 
              style="display: none"
              @change="handleFileSelect"
            >

            <img 
              v-if="imagePreview"
              :src="imagePreview" 
              class="post-image"
              @click.stop="handleImageClick"
            >
            <div v-else class="no-image">
              <span>Изображение отсутствует</span>
            </div>

            <div v-if="imagePreview" class="image-overlay">
              <button type="button" @click.stop="handleImageClick" class="change-image-btn">
                Изменить фото
              </button>
            </div>
          </div>

          <div class="content-wrapper">
            <div class="desc">
              <template v-if="!isVacancy">
                <input 
                  type="text" 
                  v-model="form.title"
                  placeholder="Заголовок поста" 
                  required
                  class="title-input"
                >

                <textarea 
                  v-model="form.description"
                  placeholder="Описание поста" 
                  required
                  class="description-textarea"
                ></textarea>
              </template>

              <template v-else>
                <div class="vacancy-fields">
                  <div class="form-row">
                    <div class="form-group">
                      <label for="position">Должность</label>
                      <input 
                        type="text" 
                        v-model="form.position"
                        id="position"
                        placeholder="Например: PHP разработчик"
                      >
                    </div>
                  </div>

                  <div class="form-row two-cols">
                    <div class="form-group">
                      <label for="budget_min">Бюджет от</label>
                      <input 
                        type="number" 
                        v-model="form.budget_min"
                        id="budget_min"
                        placeholder="1000"
                      >
                    </div>
                    <div class="form-group">
                      <label for="budget_max">Бюджет до</label>
                      <input 
                        type="number" 
                        v-model="form.budget_max"
                        id="budget_max"
                        placeholder="5000"
                      >
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="deadline">Срок выполнения</label>
                      <input 
                        type="date" 
                        v-model="form.deadline"
                        id="deadline"
                      >
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="requirements">Требования</label>
                      <textarea 
                        v-model="form.requirements"
                        id="requirements"
                        placeholder="Опишите требования к исполнителю..."
                        rows="4"
                      ></textarea>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Требуемые навыки</label>
                      <div class="multiselect-container">
                        <div 
                          class="multiselect-trigger" 
                          @click="skillsDropdownOpen = !skillsDropdownOpen"
                        >
                          <span v-if="selectedSkills.length === 0">Выберите навыки</span>
                          <span v-else>Выбрано: {{ selectedSkills.length }}</span>
                          <span class="arrow">▼</span>
                        </div>
                        <div v-if="skillsDropdownOpen" class="multiselect-dropdown">
                          <div 
                            v-for="skill in skills" 
                            :key="skill.id"
                            class="multiselect-option"
                            :class="{ selected: isSkillSelected(skill.id) }"
                            @click="toggleSkill(skill)"
                          >
                            <span class="skill-name">{{ skill.name }}</span>
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
                        <select v-model="skill.level" @change="updateSkillLevel(skill.id, skill.level)">
                          <option :value="1">1</option>
                          <option :value="2">2</option>
                          <option :value="3">3</option>
                          <option :value="4">4</option>
                          <option :value="5">5</option>
                        </select>
                      </div>
                      <button type="button" @click="toggleSkill(skill)" class="remove-skill">×</button>
                    </div>
                  </div>
                </div>
              </template>

              <div class="error" v-if="form.errors.title">{{ form.errors.title }}</div>
              <div class="error" v-if="form.errors.description">{{ form.errors.description }}</div>
              <div class="error" v-if="form.errors.image">{{ form.errors.image }}</div>

              <div class="form-actions">
                <Link :href="post.show_url" class="cancel-button">Отмена</Link>
                <button type="submit" class="submit-button" :disabled="form.processing">
                  {{ form.processing ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, useForm, Link } from '@inertiajs/vue3'
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  post: Object,
  skills: {
    type: Array,
    default: () => []
  }
})

const fileInputRef = ref(null)
const imagePreview = ref(props.post.image_url)
const isDragging = ref(false)
const skillsDropdownOpen = ref(false)
const selectedSkills = ref([])

const isVacancy = computed(() => props.post.vacancy !== null)

const form = useForm({
  title: props.post.title,
  description: props.post.description,
  image: null,
  position: props.post.vacancy?.position || '',
  budget_min: props.post.vacancy?.budget_min || '',
  budget_max: props.post.vacancy?.budget_max || '',
  deadline: props.post.vacancy?.deadline || '',
  requirements: props.post.vacancy?.requirements || '',
  skills: [],
  _method: 'PUT'
})

onMounted(() => {
  if (props.post.vacancy && props.post.vacancy.skills) {
    selectedSkills.value = props.post.vacancy.skills.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level || 3
    }))
    form.skills = props.post.vacancy.skills.map(s => ({
      id: s.id,
      level: s.level || 3
    }))
  }
})

const getSkillClass = (skillName) => {
  const name = skillName.toLowerCase()
  if (name.includes('php')) return 'skill-php'
  if (name.includes('laravel')) return 'skill-laravel'
  if (name.includes('js') || name.includes('javascript')) return 'skill-js'
  if (name.includes('vue')) return 'skill-vue'
  if (name.includes('react')) return 'skill-react'
  if (name.includes('node')) return 'skill-node'
  if (name.includes('python')) return 'skill-python'
  if (name.includes('django')) return 'skill-django'
  if (name.includes('design') || name.includes('ui')) return 'skill-design'
  if (name.includes('figma')) return 'skill-figma'
  if (name.includes('photoshop') || name.includes('illustrator')) return 'skill-photoshop'
  if (name.includes('copy') || name.includes('content')) return 'skill-copywriting'
  if (name.includes('marketing') || name.includes('seo') || name.includes('smm')) return 'skill-marketing'
  if (name.includes('video')) return 'skill-video'
  if (name.includes('3d')) return 'skill-3d'
  if (name.includes('animation') || name.includes('motion')) return 'skill-animation'
  if (name.includes('translation')) return 'skill-translation'
  if (name.includes('data') || name.includes('excel')) return 'skill-data'
  return 'skill-default'
}

const isSkillSelected = (skillId) => {
  return selectedSkills.value.some(s => s.id === skillId)
}

const updateSkillLevel = (skillId, level) => {
  const skill = selectedSkills.value.find(s => s.id === skillId)
  if (skill) {
    skill.level = level
    const idx = form.skills.findIndex(s => s.id === skillId)
    if (idx !== -1) {
      form.skills[idx].level = level
    }
  }
}

const toggleSkill = (skill) => {
  const index = selectedSkills.value.findIndex(s => s.id === skill.id)
  if (index === -1) {
    const newSkill = { id: skill.id, name: skill.name, level: 3 }
    selectedSkills.value.push(newSkill)
    form.skills.push({ id: skill.id, level: 3 })
  } else {
    selectedSkills.value.splice(index, 1)
    form.skills = form.skills.filter(s => s.id !== skill.id)
  }
}

const handleAreaClick = () => {
  if (!imagePreview.value) {
    fileInputRef.value.click()
  }
}

const handleImageClick = () => {
  fileInputRef.value.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file) => {
  form.image = file
  const reader = new FileReader()
  
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  
  reader.readAsDataURL(file)
}

const submit = () => {
  const data = {
    title: form.title,
    description: form.description,
    _method: 'PUT'
  }
  
  if (form.image) {
    data.image = form.image
  }
  
  if (isVacancy.value) {
    data.position = form.position
    data.budget_min = form.budget_min || null
    data.budget_max = form.budget_max || null
    data.deadline = form.deadline || null
    data.requirements = form.requirements || null
    
    const skillsWithLevels = {}
    form.skills.forEach(s => {
      skillsWithLevels[s.id] = { level: s.level }
    })
    data.skills = skillsWithLevels
  }
  
  form.transform(() => data).post(props.post.update_url, {
    forceFormData: true,
    preserveScroll: true
  })
}
</script>

<style scoped>
.edit-post-page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0px 20px 80px 20px;
}

form {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

.block {
  display: flex;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  align-items: flex-start;
}

.image-container {
  flex: 0 0 50%;
  max-width: 50%;
  height: fit-content;
  min-height: 400px;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  position: sticky;
  top: 80px;
  align-self: flex-start;
  z-index: 10;
}

.post-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  cursor: pointer;
  border-radius: 24px 0 0 24px;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 500;
  padding: 40px;
  text-align: center;
  min-height: 400px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 24px 0 0 24px;
}

.image-container:hover .image-overlay {
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
}

.change-image-btn {
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  background: white;
  color: #334155;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-image-btn:hover {
  background: #f8fafc;
  transform: scale(1.05);
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.desc {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
}

.title-input {
  width: 100%;
  padding: 0 0 0 15px;
  font-size: 32px;
  font-weight: 700;
  border: none;
  border-bottom: 2px solid transparent;
  outline: none;
  transition: all 0.3s ease;
  color: #0f172a;
  background: transparent;
  line-height: 1.3;
  font-family: inherit;
  border-bottom-color: #e2e8f0;
}

.title-input::placeholder {
  color: #cbd5e1;
  font-weight: 700;
}

.description-textarea {
  width: 100%;
  flex: 1;
  min-height: 200px;
  padding: 0;
  font-size: 16px;
  line-height: 1.7;
  border: none;
  outline: none;
  resize: none;
  transition: all 0.3s ease;
  color: #334155;
  background: transparent;
  font-family: inherit;
  word-break: break-word;
  white-space: pre-wrap;
}

.description-textarea::placeholder {
  color: #cbd5e1;
}

.error {
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
  margin-top: auto;
}

.cancel-button {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.cancel-button:hover {
  background: #e2e8f0;
}

.submit-button {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  background: rgb(255, 52, 52);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.submit-button:hover:not(:disabled) {
  background: rgb(222, 42, 42);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 52, 52, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 1000px) {
  .block {
    flex-direction: column;
    margin: 20px;
    border-radius: 20px;
  }

  .image-container {
    flex: none;
    max-width: 100%;
    width: 100%;
  }

  .desc {
    padding: 28px;
  }

  .title-input {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .edit-post-page {
    padding: 16px;
  }

  .block {
    margin: 0;
    border-radius: 16px;
  }

  .desc {
    padding: 24px;
  }

  .title-input {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .edit-post-page {
    padding: 10px;
  }

  .desc {
    padding: 20px;
  }

  .title-input {
    font-size: 22px;
  }

  .description-textarea {
    font-size: 15px;
  }
}

.vacancy-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.form-group input,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgb(255, 52, 52);
  box-shadow: 0 0 0 3px rgba(255, 52, 52, 0.1);
}

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
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  background: #f1f5f9;
  color: #334155;
}

.remove-skill {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
}

.remove-skill:hover {
  color: #ef4444;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.skill-tag .skill-name {
  margin-right: 4px;
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

.skill-level {
  display: flex;
  align-items: center;
}

.skill-level select {
  padding: 2px 4px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  cursor: pointer;
}

.skill-level select option {
  background: #333;
  color: white;
}
</style>