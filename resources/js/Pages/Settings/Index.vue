<template>
  <AppLayout>
    <div class="settings-container">
      <div class="settings-header">
        <h1>Настройки</h1>
      </div>

      <div class="settings-content">
        <nav class="settings-nav">
          <Link 
            href="/settings/profile" 
            class="settings-nav-item"
            :class="{ active: section === 'profile' }"
          >
            Профиль
          </Link>
          <Link 
            href="/settings/privacy" 
            class="settings-nav-item"
            :class="{ active: section === 'privacy' }"
          >
            Приватность
          </Link>
          <Link 
            href="/settings/files" 
            class="settings-nav-item"
            :class="{ active: section === 'files' }"
          >
            Мои Файлы
          </Link>
        </nav>

        <div class="settings-panel">
          <div v-if="section === 'profile'" class="panel-profile">
            <div class="edit-content">
              <div class="avatar">
                <div 
                  class="profile-header avatar-upload"
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
                    v-if="avatarPreview || user.avatar" 
                    :src="avatarPreview || '/storage/' + user.avatar" 
                    class="avatar-preview"
                  >
                  <div v-else class="no-avatar">
                    <span>Нажмите для загрузки</span>
                  </div>

                  <div v-if="avatarPreview || user.avatar" class="avatar-overlay">
                    <button type="button" @click.stop="handleAreaClick" class="change-avatar-btn">
                      Изменить фото
                    </button>
                  </div>
                </div>

                <div v-if="!user.is_verified || user.is_verified !== 'verified'" class="verification-links">
                  <Link 
                    v-if="!user.is_verified || user.is_verified === 'rejected'" 
                    href="#" 
                    @click.prevent="requestVerification"
                    class="verification-link"
                  >
                    Запросить верификацию
                  </Link>
                  <Link 
                    v-if="!user.email_verified_at" 
                    href="#" 
                    @click.prevent="resendEmailVerification"
                    class="verification-link"
                  >
                    Подтвердить почту
                  </Link>
                  <p v-if="user.is_verified === 'pending'" class="verification-status">
                    Заявка на верификацию на рассмотрении
                  </p>
                </div>
              </div>

              <div class="desc">
                <form @submit.prevent="submit" enctype="multipart/form-data">                 
                  <div class="form-group">
                    <label for="name">Имя:</label>
                    <div style="display: flex; gap: 20px;">
                    <input 
                      type="text" 
                      name="name" 
                      id="name" 
                      v-model="form.name"
                      required
                    >
                    <button
                      type="button"
                      class="theme-toggle-btn"
                      :class="{ dark: isDark }"
                      @click="toggleDarkMode"
                    >
                      <span class="theme-toggle-track">
                        <span class="theme-toggle-thumb">
                          <span v-if="isDark">🌙</span>
                          <span v-else>☀️</span>
                        </span>
                      </span>
                      <span class="theme-toggle-label">{{ isDark ? 'Тёмная' : 'Светлая' }}</span>
                    </button>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="aboutme">О себе:</label>
                    <textarea 
                      name="aboutme" 
                      id="aboutme"
                      v-model="form.aboutme"
                      :maxlength="maxLength"
                    ></textarea>
                    <div class="char-counter" :class="{ warning: remainingChars <= warningThreshold }">
                      <span v-if="remainingChars <= warningThreshold">
                        Осталось {{ remainingChars }} {{ pluralizeChars(remainingChars) }}
                      </span>
                      <span v-else>
                        {{ currentLength }} / {{ maxLength }}
                      </span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Ваши навыки:</label>
                    <SkillsSelector
                      :skills="skills"
                      v-model="form.skills"
                    />
                  </div>

                  <div class="form-actions">
                    <button type="submit" class="btn-save" :disabled="form.processing">
                      {{ form.processing ? 'Сохранение...' : 'Сохранить изменения' }}
                    </button>
                    <Link :href="'/profile/' + user.id" class="btn-cancel">
                      Отмена
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div v-else-if="section === 'privacy'" class="panel-privacy">
            <h2>Настройки приватности</h2>
            <p class="coming-soon">Раздел в разработке</p>
          </div>
          <div v-else-if="section === 'files'" class="panel-files">
            <h2>Ваши файлы</h2>
            
            <div v-if="userFiles && userFiles.length > 0" class="files-list">
              <div v-for="file in userFiles" :key="file.type" class="file-item">
                <div class="file-info">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ file.name }}</span>
                </div>
                <div class="file-actions">
                  <a :href="file.url" target="_blank" class="file-view-btn">Просмотр</a>
                </div>
              </div>
            </div>
            <div v-else class="no-files">
              <p>У вас пока нет загруженных файлов</p>
              <p class="no-files-hint">Файлы можно загрузить при регистрации или редактировании профиля</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import SkillsSelector from '@/Components/SkillsSelector.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'
import { ref, computed } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  section: String,
  user: Object,
  skills: {
    type: Array,
    default: () => []
  },
  userSkills: {
    type: Array,
    default: () => []
  },
  userFiles: {
    type: Array,
    default: () => []
  }
})

const { isDark, toggleDarkMode } = useDarkMode()

const avatarPreview = ref(null)
const fileInputRef = ref(null)
const isDragging = ref(false)
const maxLength = 1000
const warningThreshold = 50

const requestVerification = () => {
  axios.post('/settings/request-verification')
    .then(response => {
      window.location.reload()
    })
    .catch(error => {
      alert(error.response?.data?.error || 'Error')
    })
}

const resendEmailVerification = () => {
  axios.post('/settings/resend-email-verification')
    .then(response => {
      alert('Email отправлен! Проверьте почту (mailhog на порту 8025)')
    })
    .catch(error => {
      alert(error.response?.data?.error || 'Error')
    })
}

const form = useForm({
  name: props.user.name,
  aboutme: props.user.aboutme || '',
  avatar: null,
  skills: props.userSkills || [],
  _method: 'PUT'
})

const currentLength = computed(() => (form.aboutme || '').length)
const remainingChars = computed(() => maxLength - currentLength.value)

const pluralizeChars = (count) => {
  if (count === 1) return 'символ'
  if (count >= 2 && count <= 4) return 'символа'
  return 'символов'
}

const handleAreaClick = () => {
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
  form.avatar = file
  const reader = new FileReader()
  
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  
  reader.readAsDataURL(file)
}

function submit() {
  if (!form.avatar) {
    form.transform((data) => {
      delete data.avatar;
      return data;
    });
  }

  form.post(`/profile/${props.user.id}`, {
    forceFormData: true,
    preserveScroll: true,
    onSuccess: () => {
      if (form.avatar) {
        form.reset('avatar');
        avatarPreview.value = null;
      }
    }
  });
}
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  padding: 50px;
}

.settings-header {
  margin: 0 auto 30px;
}

.settings-header h1 {
  font-size: 32px;
  color: #333;
}

.settings-content {
  min-height: 70vh;
  margin: 0 auto;
  display: flex;
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
}

.settings-nav {
  border-radius: 24px 0 0 24px;
  width: 250px;
  background: #f8fafc;
  padding: 30px 0;
  border-right: 1px solid #e2e8f0;
}

.settings-nav-item {
  display: block;
  padding: 15px 30px;
  color: #64748b;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.settings-nav-item:hover {
  background: #f1f5f9;
  color: #333;
}

.settings-nav-item.active {
  background: white;
  color: rgb(255, 52, 52);
  border-left-color: rgb(255, 52, 52);
}

.settings-panel {
  flex: 1;
  padding: 30px;
}

.panel-profile .back-link {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.panel-profile .back-link a {
  color: #666;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.2s;
}

.panel-profile .back-link a:hover {
  color: rgb(255, 52, 52);
}

.edit-content {
  display: flex;
  gap: 50px;
  align-items: flex-start;
}

.avatar {
  flex: 0 0 350px;
}

.profile-header {
  width: 350px;
  height: 350px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgb(182, 182, 182);
  cursor: pointer;
  position: relative;
}

.avatar-preview,
.avatar-upload img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 500;
  padding: 40px;
  text-align: center;
  background: #f8fafc;
}

.avatar-overlay {
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

.avatar-upload:hover .avatar-overlay {
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
}

.change-avatar-btn {
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

.change-avatar-btn:hover {
  background: #f8fafc;
  transform: scale(1.05);
}

.verification-links {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verification-link {
  color: black;
  text-decoration: underline;
  font-size: 16px;
  cursor: pointer;
}

.verification-link:hover {
  color: rgb(230, 45, 45);
}

.verification-status {
  color: #f59e0b;
  font-size: 14px;
  text-align: center;
}

.profile-header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.desc {
  flex: 1;
  padding: 20px;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input[type="text"] {
  padding: 12px;
  border: 1px solid rgb(182, 182, 182);
  border-radius: 5px;
  font-size: 16px;
}

.form-group textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid rgb(182, 182, 182);
  border-radius: 5px;
  font-size: 16px;
  resize: none;
  overflow-y: auto;
}

.char-counter {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
  text-align: right;
  transition: color 0.3s;
}

.char-counter.warning {
  color: rgb(255, 52, 52);
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-save {
  background-color: rgb(255, 52, 52);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.btn-save:hover {
  background-color: rgb(230, 45, 45);
}

.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid rgb(182, 182, 182);
  border-radius: 5px;
  padding: 12px 24px;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 16px;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.panel-privacy {
  text-align: center;
  padding: 50px;
}

.panel-privacy h2 {
  margin-bottom: 20px;
  color: #333;
}

.coming-soon {
  color: #94a3b8;
  font-size: 16px;
}

.panel-files h2 {
  margin-bottom: 30px;
  color: #333;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
}

.file-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.file-view-btn {
  padding: 8px 16px;
  background: rgb(255, 52, 52);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 14px;
  transition: background 0.2s;
}

.file-view-btn:hover {
  background: rgb(230, 45, 45);
}

.no-files {
  text-align: center;
  padding: 50px 20px;
  color: #64748b;
}

.no-files p {
  font-size: 16px;
}

.no-files-hint {
  font-size: 14px !important;
  color: #94a3b8 !important;
  margin-top: 10px;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.theme-toggle-track {
  display: block;
  width: 50px;
  height: 26px;
  background: #e2e8f0;
  border-radius: 13px;
  position: relative;
  transition: background 0.3s ease;
}

.theme-toggle-btn.dark .theme-toggle-track {
  background: #334155;
}

.theme-toggle-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  font-size: 12px;
}

.theme-toggle-btn.dark .theme-toggle-thumb {
  transform: translateX(24px);
  background: #1e293b;
}

.theme-toggle-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

html.dark .settings-header h1 {
  color: #f1f5f9;
}

html.dark .settings-content {
  background: #1e293b;
  border-color: #334155;
}

html.dark .settings-nav {
  background: #0f172a;
  border-color: #334155;
}

html.dark .settings-nav-item {
  color: #94a3b8;
}

html.dark .settings-nav-item:hover {
  background: #1e293b;
  color: #f1f5f9;
}

html.dark .settings-nav-item.active {
  background: #1e293b;
}

html.dark .settings-panel {
  color: #f1f5f9;
}

html.dark .panel-profile .back-link {
  border-bottom-color: #334155;
}

html.dark .panel-profile .back-link a {
  color: #94a3b8;
}

html.dark .profile-header {
  border-color: #334155;
}

html.dark .no-avatar {
  background: #1e293b;
  color: #94a3b8;
}

html.dark .change-avatar-btn {
  background: #1e293b;
  color: #f1f5f9;
}

html.dark .change-avatar-btn:hover {
  background: #334155;
}

html.dark .verification-link {
  color: #f1f5f9;
}

html.dark .desc {
  color: #f1f5f9;
}

html.dark .form-group label {
  color: #e2e8f0;
}

html.dark .form-group input[type="text"] {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark .form-group textarea {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark .char-counter {
  color: #94a3b8;
}

html.dark .btn-cancel {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

html.dark .btn-cancel:hover {
  background: #475569;
}

html.dark .panel-privacy h2 {
  color: #f1f5f9;
}

html.dark .coming-soon {
  color: #94a3b8;
}

html.dark .panel-files h2 {
  color: #f1f5f9;
}

html.dark .file-item {
  background: #1e293b;
  border-color: #334155;
}

html.dark .file-name {
  color: #f1f5f9;
}

html.dark .no-files {
  color: #94a3b8;
}

html.dark .no-files-hint {
  color: #64748b;
}

@media(max-width: 1000px) {
  .settings-container {
    padding: 150px 20px 50px;
  }

  .settings-content {
    flex-direction: column;
  }

  .settings-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 0;
  }

  .settings-nav-item {
    padding: 15px 20px;
  }

  .edit-content {
    flex-direction: column;
    gap: 30px;
  }

  .avatar {
    flex: 0 0 auto;
  }

  .profile-header {
    width: 100%;
    height: 300px;
  }

  .form-group input[type="text"],
  .form-group textarea {
    font-size: 18px;
    padding: 15px;
  }

  .btn-save,
  .btn-cancel {
    font-size: 18px;
    padding: 15px 30px;
  }
}
</style>
