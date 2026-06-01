<template>
  <Head :title="mode === 'login' ? 'Вход' : 'Регистрация'" />
  <div class="Authblock" :class="{ 'register-mode': mode === 'register' }">
    <div class="form-wrapper">
      <transition name="slide" mode="out-in">
        <form v-if="mode === 'login'" @submit.prevent="submitLogin" key="login">
            <h1>Вход</h1>
            <div v-if="$page.props.errors.error" class="error-message global-error">
              {{ $page.props.errors.error }}
            </div>
            <div class="login-content">
              <div class="input-group">
                <label>Email</label>
                <input type="email" v-model="loginForm.email" placeholder="Введите email" required>
              </div>
              <div class="input-group">
                <label>Пароль</label>
                <input type="password" v-model="loginForm.password" placeholder="Введите пароль" required>
                <div v-if="loginError" class="field-error">{{ loginError }}</div>
              </div>
            </div>
          <button type="submit" :disabled="loginForm.processing">
            {{ loginForm.processing ? 'Вход...' : 'Войти' }}
          </button>
          <button type="button" class="switch-mode" @click="switchMode">
            Нет аккаунта? Зарегистрироваться
          </button>
          <div class="oauth-divider">
            <span>Или</span>
          </div>
          <div class="oauth-buttons">
            <a href="/auth/google/redirect" class="oauth-btn oauth-google" data-inertia="false">
              <img src="/images/google.svg" alt="">
              Войти через Google
            </a>
            <a href="/auth/vkontakte/redirect" class="oauth-btn oauth-vkontakte" data-inertia="false">
              <img src="/images/vkontakte.svg" alt="">
              Войти через ВКонтакте
            </a>
            <a href="/auth/yandex/redirect" class="oauth-btn oauth-yandex" data-inertia="false">
              <img src="/images/yandex.svg" alt="">
              Войти через Яндекс
            </a>
          </div>
        </form>

        <form v-else @submit.prevent="submitRegister" key="register" class="register-form">
          <h1>Регистрация</h1>
          
          <div class="step-indicator">
            <div 
              v-for="step in 3" 
              :key="step"
              class="step-dot"
              :class="{ active: currentStep === step, completed: currentStep > step }"
              @click="goToStep(step)"
            ></div>
          </div>

          <div class="step-content">
            <transition name="fade" mode="out-in">
              <div v-if="currentStep === 1" key="step1" class="step step-1">
                <div class="input-group">
                  <label>Имя</label>
                  <input type="text" v-model="registerData.name" placeholder="Введите имя" required>
                </div>
                <div class="input-group">
                  <label>Email</label>
                  <input type="email" v-model="registerData.email" placeholder="Введите email" required>
                </div>
                <div class="input-group">
                  <label>Пароль</label>
                  <input type="password" v-model="registerData.password" placeholder="Минимум 8 символов" required>
                </div>
                <div class="input-group">
                  <label>Подтверждение пароля</label>
                  <input type="password" v-model="registerData.password_confirmation" placeholder="Повторите пароль" required>
                </div>
                <div v-if="validationErrors.step1" class="error-message">{{ validationErrors.step1 }}</div>
                <div v-if="registerErrors.length > 0" class="error-message">
                  <div v-for="err in registerErrors" :key="err">{{ err }}</div>
                </div>
              </div>

              <div v-else-if="currentStep === 2" key="step2" class="step step-2">
                <p class="optional-notice">Опционально — вы сможете поменять данные в настройках личного кабинета</p>
                <div class="avatar-upload">
                  <label>Аватар</label>
                  <div class="avatar-preview" @click="$refs.avatarInput.click()">
                    <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar preview">
                    <span v-else class="avatar-placeholder">Нажмите для загрузки</span>
                  </div>
                  <input type="file" ref="avatarInput" @change="handleAvatarUpload" accept="image/*" hidden>
                  <button type="button" v-if="avatarPreview" class="remove-avatar" @click="removeAvatar">Удалить</button>
                </div>

                <div class="form-group">
                  <label>О себе</label>
                  <textarea v-model="registerData.bio" placeholder="Расскажите о себе..." rows="4"></textarea>
                </div>

                <div class="form-group">
                  <div class="label-with-tooltip">
                    <label>Навыки</label>
                    <div class="tooltip-trigger">
                      <span class="help-icon">?</span>
                      <div class="tooltip-content">
                        Выберите навыки, которыми вы владеете. Это поможет работодателям найти вас по соответствующим вакансиям.
                      </div>
                    </div>
                  </div>
                  <SkillsSelector
                    v-model="registerData.skills"
                    :skills="skills"
                  />
                </div>
              </div>

              <div v-else-if="currentStep === 3" key="step3" class="step step-3">
                <p class="optional-notice">Опционально — повысьте шансы на трудоустройство</p>

                <div class="form-group">
                  <label>Телефон</label>
                  <div class="phone-input-wrapper">
                    <input type="tel" v-model="registerData.phone" placeholder="+7 (___) ___-__-__">
                    <span class="phone-hint">Пригодится для двухфакторной аутентификации</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Резюме</label>
                  <div class="file-upload" @click="$refs.resumeInput.click()">
                    <span v-if="registerData.resume">{{ registerData.resume.name }}</span>
                    <span v-else>Нажмите для загрузки PDF, DOC, DOCX</span>
                  </div>
                  <input type="file" ref="resumeInput" @change="handleFileUpload('resume', $event)" accept=".pdf,.doc,.docx" hidden>
                </div>

                <div class="form-group">
                  <label>Паспорт</label>
                  <div class="file-upload" @click="$refs.passportInput.click()">
                    <span v-if="registerData.passport">{{ registerData.passport.name }}</span>
                    <span v-else>Загрузите скан паспорта или сфоткайте разворот</span>
                  </div>
                  <input type="file" ref="passportInput" @change="handleFileUpload('passport', $event)" accept="image/*,.pdf" hidden>
                </div>

                <div class="form-group">
                  <label>Диплом/Сертификаты</label>
                  <div class="file-upload" @click="$refs.certificatesInput.click()">
                    <span v-if="registerData.certificates">{{ registerData.certificates.name }}</span>
                    <span v-else>Загрузите документы об образовании</span>
                  </div>
                  <input type="file" ref="certificatesInput" @change="handleFileUpload('certificates', $event)" accept="image/*,.pdf" hidden>
                  <span class="phone-hint">(Вы сможете найти их в настройках в вкладке Мои файлы) </span>
                </div>

                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="registerData.email_confirmed">
                    <span>Подтвердить email</span>
                  </label>
                </div>

                <div class="checkbox-group">
                  <label class="checkbox-label verification-label">
                    <input type="checkbox" v-model="registerData.request_verification">
                    <span>Запросить верификацию аккаунта</span>
                    <div class="tooltip-trigger">
                      <span class="help-icon">?</span>
                      <div class="tooltip-content">
                        Верификация добавит галочку <img src="/images/verified.svg" alt=""> рядом с вашим именем, что повысит доверие работодателей.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </transition>
          </div>

          <div class="form-actions">
            <button v-if="currentStep > 1" type="button" class="btn-back" @click="prevStep">
              Назад
            </button>
            <button v-if="currentStep < 3" type="button" class="btn-next" @click="nextStep">
              Далее
            </button>
            <button v-else type="submit" :disabled="registerForm.processing" class="btn-submit">
              {{ registerForm.processing ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>
          </div>

          <button type="button" class="switch-mode" @click="switchMode">
            Уже есть аккаунт? Войти
          </button>
        </form>
      </transition>
    </div>
  </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, useForm } from '@inertiajs/vue3'
import { ref, reactive, computed, watch } from 'vue'
import SkillsSelector from '@/Components/SkillsSelector.vue'
import { getSkillClass } from '@/composables/useSkills'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  errors: Object,
  skills: {
    type: Array,
    default: () => []
  }
})

useDarkMode()

const mode = ref('login')
const currentStep = ref(1)
const loginError = ref('')
const avatarPreview = ref('')

const loginForm = useForm({
  email: '',
  password: ''
})

const registerForm = useForm({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  avatar: null,
  bio: '',
  skills: [],
  phone: '',
  resume: null,
  passport: null,
  certificates: null,
  email_confirmed: false,
  request_verification: false
})

const registerData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  avatar: null,
  bio: '',
  skills: [],
  phone: '',
  resume: null,
  passport: null,
  certificates: null,
  email_confirmed: false,
  request_verification: false
})

const validationErrors = reactive({
  step1: ''
})

const registerErrors = ref([])

watch(() => props.errors, (newErrors) => {
  registerErrors.value = newErrors ? Object.values(newErrors).flat() : []
}, { immediate: true, deep: true })

const switchMode = () => {
  loginError.value = ''
  registerErrors.value = []
  mode.value = mode.value === 'login' ? 'register' : 'login'
  currentStep.value = 1
  resetForms()
}

const resetForms = () => {
  loginForm.reset()
  Object.assign(registerData, {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    avatar: null,
    bio: '',
    skills: [],
    phone: '',
    resume: null,
    passport: null,
    certificates: null,
    email_confirmed: false,
    request_verification: false
  })
  avatarPreview.value = ''
  loginError.value = ''
  validationErrors.step1 = ''
}

const submitLogin = () => {
  loginForm.post('/login', {
    onSuccess: () => {},
    onError: (errors) => {
      loginError.value = Object.values(errors)[0] || 'Ошибка входа'
    }
  })
}

const validateStep1 = () => {
  validationErrors.step1 = ''
  
  if (!registerData.name || registerData.name.trim().length < 2) {
    validationErrors.step1 = 'Имя должно содержать минимум 2 символа'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerData.email || !emailRegex.test(registerData.email)) {
    validationErrors.step1 = 'Введите корректный email'
    return false
  }
  
  if (!registerData.password || registerData.password.length < 8) {
    validationErrors.step1 = 'Пароль должен содержать минимум 8 символов'
    return false
  }
  
  if (registerData.password !== registerData.password_confirmation) {
    validationErrors.step1 = 'Пароли не совпадают'
    return false
  }
  
  return true
}

const goToStep = (step) => {
  if (step === 1 || validateStep1()) {
    currentStep.value = step
  }
}

const nextStep = () => {
  if (currentStep.value === 1 && !validateStep1()) {
    return
  }
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    registerData.avatar = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeAvatar = () => {
  registerData.avatar = null
  avatarPreview.value = ''
  if (registerForm.avatar) {
    registerForm.avatar = null
  }
}

const removeSkill = (skillId) => {
  registerData.skills = registerData.skills.filter(s => s.id !== skillId)
}

const handleFileUpload = (field, event) => {
  const file = event.target.files[0]
  if (file) {
    registerData[field] = file
  }
}

const submitRegister = () => {
  registerForm.name = registerData.name
  registerForm.email = registerData.email
  registerForm.password = registerData.password
  registerForm.password_confirmation = registerData.password_confirmation
  registerForm.avatar = registerData.avatar
  registerForm.bio = registerData.bio
  registerForm.skills = registerData.skills
  registerForm.phone = registerData.phone
  registerForm.resume = registerData.resume
  registerForm.passport = registerData.passport
  registerForm.certificates = registerData.certificates
  registerForm.email_confirmed = registerData.email_confirmed
  registerForm.request_verification = registerData.request_verification
  
  registerForm.post('/register', {
    forceFormData: true,
    onSuccess: () => {
      window.location.href = '/profile'
    }
  })
}
</script>

<script>
export default {
  layout: AppLayout
}
</script>

<style scoped>
.Authblock {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.form-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  z-index: 2;
}

.form-container {
  width: 100%;
  max-width: 500px;
}

form {
  width: 600px;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 100px;
}

form h1 {
  font-family: 'Unbounded';
  color: #333;
  font-size: 32px;
  margin-bottom: 20px;
}

form input[type="email"],
form input[type="password"],
form input[type="text"],
form input[type="tel"] {
  width: 300px;
  height: 40px;
  padding: 8px 12px;
  border: solid black 1px;
  border-radius: 5px;
  font-size: 14px;
}

form textarea {
  margin-top: 10px;
  min-width:350px;
  padding: 8px 12px;
  border: solid black 1px;
  border-radius: 5px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

form button[type="submit"] {
  margin-top: 30px;
  width: 300px;
  height: 50px;
  background-color: rgb(255, 52, 52);
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

form button[type="submit"]:hover:not(:disabled) {
  background-color: rgb(230, 45, 45);
}

form button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.switch-mode {
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  margin-top: 20px;
  text-decoration: underline;
  padding: 0;
  height: auto;
  width: auto;
}

.switch-mode:hover {
  color: rgb(255, 52, 52);
}

.oauth-divider {
  display: flex;
  align-items: center;
  width: 300px;
  margin: 20px 0 15px;
}

.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.oauth-divider span {
  padding: 0 15px;
  color: #94a3b8;
  font-size: 13px;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 300px;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: white;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.oauth-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.oauth-btn img {
  width: 20px;
  height: 20px;
}

.login-content {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px 0 50px 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.input-group input {
  margin-top: 0;
}

.field-error {
  color: rgb(255, 52, 52);
  font-size: 12px;
  margin-top: 4px;
}

.error-message {
  color: rgb(255, 52, 52);
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
  max-width: 300px;
}

.global-error {
  margin-bottom: 15px;
  font-weight: 500;
}

.label-with-tooltip {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.label-with-tooltip label {
  margin-bottom: 0;
}

.tooltip-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.help-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tooltip-content {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  width: 300px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
}

.tooltip-trigger:hover .tooltip-content {
  opacity: 1;
  visibility: visible;
}

.tooltip-content img{
  width: 20px;
  height: 20px;
  margin: 0 0 -5px 0;
}
.step-indicator {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
}

.step-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #475569;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #22c55e;
}

.step-content {
  width: 100%;
  max-width: 350px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-1 {
  gap: 20px;
}

.step-1 .input-group {
  width: 100%;
  max-width: 320px;
}

.step-2 {
  align-items: stretch;
}

.step-3 {
  align-items: stretch;
}

.verification-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.verification-label .tooltip-trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.optional-notice {
  font-size: 13px;
  color: #64748b;
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  min-width:350px;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-upload label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  margin-top: 10px;
  transition: border-color 0.2s;
}

.avatar-preview:hover {
  border-color: rgb(255, 52, 52);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  padding: 10px;
}

.remove-avatar {
  margin-top: 10px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  height: auto;
  width: auto;
}

.remove-avatar:hover {
  color: rgb(255, 52, 52);
}

.selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
}

.skill-tag .remove-skill {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  padding: 0 2px;
  height: auto;
  width: auto;
}

.skill-tag .remove-skill:hover {
  opacity: 1;
}

.skill-tag.skill-php { background: #6b21a8; color: white; }
.skill-tag.skill-laravel { background: #ff5722; color: white; }
.skill-tag.skill-js { background: #fbbf24; color: #1f2937; }
.skill-tag.skill-vue { background: #16a34a; color: white; }
.skill-tag.skill-react { background: #0ea5e9; color: white; }
.skill-tag.skill-node { background: #15803d; color: white; }
.skill-tag.skill-python { background: #2563eb; color: white; }
.skill-tag.skill-django { background: #0f766e; color: white; }
.skill-tag.skill-design,
.skill-tag.skill-uiux { background: #ec4899; color: white; }
.skill-tag.skill-figma { background: #f59e0b; color: #1f2937; }
.skill-tag.skill-photoshop,
.skill-tag.skill-illustrator { background: #3b82f6; color: white; }
.skill-tag.skill-copywriting,
.skill-tag.skill-content { background: #8b5cf6; color: white; }
.skill-tag.skill-marketing,
.skill-tag.skill-seo,
.skill-tag.skill-smm { background: #14b8a6; color: white; }
.skill-tag.skill-video { background: #ef4444; color: white; }
.skill-tag.skill-3d { background: #f97316; color: white; }
.skill-tag.skill-animation,
.skill-tag.skill-motion { background: #d946ef; color: white; }
.skill-tag.skill-translation { background: #06b6d4; color: white; }
.skill-tag.skill-data,
.skill-tag.skill-excel { background: #22c55e; color: white; }
.skill-tag.skill-default { background: #64748b; color: white; }

.phone-input-wrapper {
  position: relative;
}

.phone-hint {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #94a3b8;
}

.file-upload {
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
  color: #64748b;
  transition: border-color 0.2s;
}

.file-upload:hover {
  border-color: rgb(255, 52, 52);
}

.checkbox-group {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.badge-hint {
  color: #22c55e;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: auto;
  padding-top: 20px;
  width: 100%;
  justify-content: center;
  align-items: flex-end;
}

.btn-back,
.btn-next 
{
  max-width: 300px;
  flex: 1;
  height: 45px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back {
  background: #e2e8f0;
  color: #64748b;
}

.btn-back:hover {
  background: #cbd5e1;
}

.btn-next {
  background: rgb(255, 52, 52);
  color: white;
}

.btn-next:hover {
  background: rgb(230, 45, 45);
}

.btn-submit {
  flex: 1;
  background: rgb(255, 52, 52);
  color: white;
  height: 45px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: rgb(230, 45, 45);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

html.dark .Authblock {
  border-color: #334155;
}

html.dark .form-wrapper {
  background: #0f172a;
}

html.dark form h1 {
  color: #f1f5f9;
}

html.dark form input[type="email"],
html.dark form input[type="password"],
html.dark form input[type="text"],
html.dark form input[type="tel"] {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark form textarea {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark .switch-mode {
  color: #94a3b8;
}

html.dark .oauth-divider::before,
html.dark .oauth-divider::after {
  background: #334155;
}

html.dark .oauth-divider span {
  color: #94a3b8;
}

html.dark .oauth-btn {
  border-color: #334155;
  background: #1e293b;
  color: #e2e8f0;
}

html.dark .oauth-btn:hover {
  background: #334155;
}

html.dark .input-group label {
  color: #94a3b8;
}

html.dark .help-icon {
  background: #334155;
  color: #94a3b8;
}

html.dark .step-dot {
  background: #334155;
}

html.dark .optional-notice {
  color: #94a3b8;
}

html.dark .form-group label {
  color: #94a3b8;
}

html.dark .avatar-upload label {
  color: #94a3b8;
}

html.dark .avatar-preview {
  border-color: #334155;
}

html.dark .avatar-placeholder {
  color: #94a3b8;
}

html.dark .remove-avatar {
  color: #94a3b8;
}

html.dark .file-upload {
  border-color: #334155;
  color: #94a3b8;
}

html.dark .btn-back {
  background: #334155;
  color: #94a3b8;
}

html.dark .btn-back:hover {
  background: #475569;
}

html.dark .checkbox-label {
  color: #e2e8f0;
}

@media (max-width: 1000px) {
  .Authblock {
    flex-direction: column;
    min-height: auto;
  }

  .panel {
    width: 100%;
    min-width: 100%;
    height: 200px;
    position: relative;
  }

  .panel h1 {
    font-size: 48px;
  }

  .panel p {
    font-size: 24px;
  }

  .register-mode .panel-left {
    transform: translateY(-100%);
  }

  .register-mode .panel-right {
    transform: translateY(-100%);
  }
  form {
    padding: 20px;
  }

  form input[type="email"],
  form input[type="password"],
  form input[type="text"],
  form input[type="tel"],
  form textarea {
    width: 100%;
    height: 50px;
    font-size: 16px;
  }

  form button[type="submit"],
  .btn-submit {
    height: 60px;
    font-size: 18px;
  }

  .step-content {
    min-height: 400px;
  }

  .step-dot {
    width: 20px;
    height: 20px;
  }

  .switch-mode {
    font-size: 16px;
  }

  .form-actions {
    width: 350px;
  }

  .tooltip-content::after {
    display: none;
  }

  .tooltip-content {
    left: 320%;
  }

  .btn-back,
  .btn-next {
    height: 50px;
    font-size: 16px;
  }
}
</style>
