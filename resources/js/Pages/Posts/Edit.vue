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
                      <SkillsSelector
                        :skills="skills"
                        v-model="form.skills"
                      />
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
import SkillsSelector from '@/Components/SkillsSelector.vue'
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
    form.skills = props.post.vacancy.skills.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level || 3
    }))
  }
})

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
</style>