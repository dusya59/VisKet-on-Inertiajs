<template>
  <AppLayout>
    <Head title="Создать новый пост" />

    <div class="create-post-page">
      <form @submit.prevent="submit">
        <div class="post-type-toggle">
          <button 
            type="button" 
            :class="{ active: postType === 'regular' }"
            @click="postType = 'regular'"
          >
            Обычный пост
          </button>
          <button 
            type="button" 
            :class="{ active: postType === 'vacancy' }"
            @click="postType = 'vacancy'"
          >
            Вакансия
          </button>
        </div>

        <div class="block">
          <div 
            class="image-container"
            :class="{ 'has-image': imagePreview }"
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

            <div v-if="!imagePreview" class="upload-area" :class="{ dragging: isDragging }">
              <div class="upload-instructions">
                <p>Перетащите изображение сюда или кликните для выбора</p>
                <button type="button" class="upload-button">+</button>
              </div>
            </div>

            <img 
              v-else
              :src="imagePreview" 
              ref="imagePreviewRef"
              class="post-image"
              @load="handleImageLoad"
              @click.stop="handleImageClick"
            >

            <div v-if="imagePreview" class="image-overlay">
              <button type="button" @click.stop="handleImageClick" class="change-image-btn">
                Изменить фото
              </button>
            </div>
          </div>

          <div class="content-wrapper">
            <div class="desc">
              <template v-if="postType === 'regular'">
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

              <div v-if="postType === 'vacancy'" class="vacancy-fields">
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
                    <label>Требуемые навыки</label>
                    <SkillsSelector
                      :skills="skills"
                      v-model="form.skills"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="requirements">Требования</label>
                    <textarea 
                      v-model="form.requirements"
                      id="requirements"
                      placeholder="Опишите требования к исполнителю..."
                      class="requirements-textarea"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="submit-button" :disabled="form.processing || !form.image">
                  {{ form.processing ? 'Публикация...' : (postType === 'vacancy' ? 'Опубликовать вакансию' : 'Опубликовать') }}
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
import { Head, useForm } from '@inertiajs/vue3'
import { useDarkMode } from '@/composables/useDarkMode'
import { ref } from 'vue'

const props = defineProps({
  skills: {
    type: Array,
    default: () => []
  }
})

useDarkMode()
const fileInputRef = ref(null)
const imagePreviewRef = ref(null)
const imagePreview = ref(null)
const isDragging = ref(false)
const postType = ref('regular')

const form = useForm({
  title: '',
  description: '',
  image: null,
  position: '',
  budget_min: null,
  budget_max: null,
  deadline: '',
  requirements: '',
  skills: []
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
  if (!imagePreview.value) {
    isDragging.value = true
  }
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  if (!imagePreview.value) {
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
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

const handleImageLoad = () => {
}

const submit = () => {
  const url = postType.value === 'vacancy' ? '/posts/vacancy' : '/posts'
  
  form.post(url, {
    forceFormData: true,
    preserveScroll: true,
    onSuccess: () => {
      form.reset()
      imagePreview.value = null
    }
  })
}
</script>

<style scoped>
.create-post-page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

form {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-type-toggle {
  display: flex;
  justify-content: center;
  gap: 10px;
  background: white;
  padding: 10px;
  border-radius: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.post-type-toggle button {
  padding: 12px 32px;
  border: none;
  border-radius: 30px;
  background: transparent;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-type-toggle button.active {
  background: rgb(255, 52, 52);
  color: white;
}

.post-type-toggle button:hover:not(.active) {
  background: #f1f5f9;
}

.block {
  display: flex;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-container {
  flex: 0 0 50%;
  max-width: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
  min-height: 400px;
}

.image-container.has-image {
  background: none;
  align-items: flex-start;
}

.upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 400px;
}

.upload-area.dragging {
  background: linear-gradient(145deg, #e8edff, #f0f4ff);
  transform: scale(1.01);
}

.upload-instructions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 40px;
}

.upload-instructions p {
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
  max-width: 280px;
  line-height: 1.5;
}

.upload-button {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: rgb(255, 52, 52);
  color: white;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-button:hover {
  background: rgb(222, 42, 42);
  transform: scale(1.05);
}

.post-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  cursor: pointer;
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
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
}

.vacancy-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  border-top: 2px solid #f1f5f9;
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
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgb(255, 52, 52);
  box-shadow: 0 0 0 3px rgba(255, 52, 52, 0.1);
}

.requirements-textarea {
  min-height: 80px;
  resize: vertical;
}

.title-input {
  width: 100%;
  padding: 0;
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
}

.title-input::placeholder {
  color: #cbd5e1;
  font-weight: 700;
}

.title-input:focus {
  border-bottom-color: #e2e8f0;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
  margin-top: auto;
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

  .form-row.two-cols {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .create-post-page {
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

  .submit-button {
    width: 100%;
  }

  .post-type-toggle button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .create-post-page {
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

  .upload-button {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }
}
html.dark .post-type-toggle {
  background: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

html.dark .post-type-toggle button {
  color: #94a3b8;
}

html.dark .post-type-toggle button:hover:not(.active) {
  background: #334155;
}

html.dark .block {
  background: #1e293b;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

html.dark .image-container {
  background: linear-gradient(145deg, #1e293b, #0f172a);
}

html.dark .upload-area.dragging {
  background: linear-gradient(145deg, #1e3a8a, #1e40af);
}

html.dark .upload-instructions p {
  color: #94a3b8;
}

html.dark .change-image-btn {
  background: #1e293b;
  color: #e2e8f0;
}

html.dark .change-image-btn:hover {
  background: #334155;
}

html.dark .desc {
  background: #1e293b;
}

html.dark .vacancy-fields {
  border-top-color: #334155;
}

html.dark .form-group label {
  color: #e2e8f0;
}

html.dark .form-group input,
html.dark .form-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark .title-input {
  color: #f1f5f9;
}

html.dark .title-input::placeholder {
  color: #475569;
}

html.dark .title-input:focus {
  border-bottom-color: #334155;
}

html.dark .description-textarea {
  color: #e2e8f0;
}

html.dark .description-textarea::placeholder {
  color: #475569;
}

html.dark .form-actions {
  border-top-color: #334155;
}
</style>
