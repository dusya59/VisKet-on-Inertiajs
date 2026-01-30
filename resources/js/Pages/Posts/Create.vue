<template>
  <AppLayout>
    <Head title="Создать новый пост" />

    <div class="create-post-page">
      <form @submit.prevent="submit" enctype="multipart/form-data">
        <div class="block" :style="blockStyle">
          <div 
            id="image-upload-area" 
            class="upload-area"
            :class="{ dragging: isDragging }"
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

            <div v-if="!imagePreview" class="upload-instructions">
              <p>Перетащите изображение сюда или кликните для выбора</p>
              <button type="button" class="upload-button">+</button>
            </div>

            <img 
              v-if="imagePreview" 
              :src="imagePreview" 
              ref="imagePreviewRef"
              :style="imageStyle"
              @load="handleImageLoad"
            >
          </div>

          <div class="desc" :style="descStyle">
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

            <div class="form-actions">
              <button type="submit" class="submit-button" :disabled="form.processing || !form.image">
                {{ form.processing ? 'Публикация...' : 'Опубликовать' }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, useForm, router } from '@inertiajs/vue3'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const fileInputRef = ref(null)
const imagePreviewRef = ref(null)
const imagePreview = ref(null)
const isDragging = ref(false)
const windowWidth = ref(window.innerWidth)

const imageSize = ref({
  width: 0,
  height: 0
})

const form = useForm({
  title: '',
  description: '',
  image: null
})

const blockStyle = computed(() => {
  if (imageSize.value.width > imageSize.value.height && windowWidth.value > 1000) {
    return {
      flexDirection: 'column',
      width: '600px'
    }
  }
  return {}
})

const descStyle = computed(() => {
  if (imageSize.value.width > imageSize.value.height && windowWidth.value > 1000) {
    return {
      width: '600px'
    }
  }
  return {}
})

const imageStyle = computed(() => {
  if (imageSize.value.height > 900 && windowWidth.value > 1000) {
    return {
      width: '350px'
    }
  }
  return {}
})

const handleAreaClick = (e) => {
  if (e.target !== imagePreviewRef.value) {
    fileInputRef.value.click()
  }
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

const handleImageLoad = () => {
  if (imagePreviewRef.value) {
    const img = imagePreviewRef.value
    const computedStyle = getComputedStyle(img)
    imageSize.value.width = parseFloat(computedStyle.width)
    imageSize.value.height = parseFloat(computedStyle.height)
  }
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (imagePreviewRef.value) {
    handleImageLoad()
  }
}

const submit = () => {
  form.post('/posts'), {
    forceFormData: true,
    preserveScroll: true,
    onSuccess: () => {
      form.reset()
      imagePreview.value = null
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
form {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

.block {
  display: flex;
  gap: 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 40px;
  transition: all 0.3s ease;
}

/* Область загрузки изображения */
.upload-area {
  flex: 0 0 500px;
  height: 500px;
  border: 3px dashed #d1d9e6;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: rgb(255,52,52);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.1);
}

.upload-area.dragging {
  border-color: #4f46e5;
  background: linear-gradient(145deg, #f0f4ff, #e8edff);
  transform: scale(1.01);
}

/* Инструкции загрузки */
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

  color: white;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Предпросмотр изображения */
.upload-area img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.upload-area img:hover {
  transform: scale(1.02);
}

.desc {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 350px;
}

.title-input {
  width: 100%;
  padding: 18px 20px;
  font-size: 28px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #e2e8f0;
  outline: none;
  transition: all 0.3s ease;
  color: #1e293b;
  background: transparent;
}

.title-input::placeholder {
  color: #bababa;
  font-weight: 500;
}

.title-input:focus {
  border-bottom-color: #bababa;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.1);
}

.description-textarea {
  width: 100%;
  flex: 1;
  min-height: 300px;
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  resize: none;
  transition: all 0.3s ease;
  color: #334155;
  background: #f8fafc;
}

.description-textarea::placeholder {
  color: #bababa;
}

.description-textarea:focus {
  border-color: #bababa;
  background: white;
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.08);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.submit-button {
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  background: rgb(255,52,52);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.submit-button:hover:not(:disabled) {
  background: rgb(222, 42, 42)
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  
}

/* Адаптивность */
@media (max-width: 1000px) {
  .block {
    flex-direction: column;
    max-width: 600px;
    width: 100%;
    padding: 30px;
  }
  
  .upload-area {
    flex: none;
    width: 100%;
    height: 400px;
  }
  
  .desc {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .create-post-page {
    padding: 15px;
    min-height: calc(100vh - 60px);
  }
  
  .block {
    padding: 25px;
    gap: 25px;
  }
  
  .upload-area {
    height: 350px;
  }
  
  .upload-instructions p {
    font-size: 14px;
  }
  
  .title-input {
    font-size: 24px;
    padding: 15px;
  }
  
  .description-textarea {
    min-height: 250px;
    padding: 16px;
  }
  
  .submit-button {
    padding: 14px 32px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .create-post-page {
    padding: 10px;
  }
  
  .block {
    padding: 20px;
    border-radius: 16px;
  }
  
  .upload-area {
    height: 300px;
  }
  
  .upload-button {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }
}
</style>