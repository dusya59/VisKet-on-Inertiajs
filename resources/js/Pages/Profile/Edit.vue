<template>
  <AppLayout>
    <Head :title="'Редактирование профиля ' + user.name" />

    <div class="editblock">
      <div class="edit-container">
        <div class="back-link">
          <Link :href="'/profile/' + user.id">← Вернуться в профиль</Link>
        </div>

        <div class="edit-content">
          <div class="avatar">
            <div class="profile-header">
              <img 
                v-if="avatarPreview" 
                :src="avatarPreview" 
                :alt="'Аватарка ' + form.name"
              >
              <img 
                v-else-if="user.avatar_url" 
                :src="user.avatar_url" 
                :alt="'Аватарка ' + user.name"
              >
              <img 
                v-else 
                src="../../../../public/images/User-avatar.png" 
                alt="Аватарка по умолчанию"
              >
            </div>
          </div>

          <div class="desc">
            <form @submit.prevent="submit" enctype="multipart/form-data">
              <div class="form-group">
                <label for="name">Имя:</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  v-model="form.name"
                  required
                >
              </div>

              <div class="form-group">
                <label for="avatar">Аватарка:</label>
                <input 
                  type="file" 
                  name="avatar" 
                  id="avatar" 
                  accept="image/*"
                  @change="handleAvatarChange"
                >
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
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'
import { ref, computed } from 'vue'

const props = defineProps({
  user: Object
})

const avatarPreview = ref(null)
const maxLength = 1000
const warningThreshold = 50

const form = useForm({
  name: props.user.name,
  aboutme: props.user.aboutme || '',
  avatar: null,
  _method: 'PUT'
})

const currentLength = computed(() => (form.aboutme || '').length)
const remainingChars = computed(() => maxLength - currentLength.value)

const pluralizeChars = (count) => {
  if (count === 1) return 'символ'
  if (count >= 2 && count <= 4) return 'символа'
  return 'символов'
}

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.avatar = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function submit() {
  form.post(`/profile/${props.user.id}`, {
    forceFormData: true,
    preserveScroll: true,
    onSuccess: () => {
      form.reset('avatar')
      avatarPreview.value = null
    }
  })
}
</script>

<style scoped>

.editblock {
    min-height: 100vh;
    padding: 100px 50px 50px;
}

.edit-container {
    width: 1200px;
    margin: 0 auto;
    padding: 30px;
    border-radius: 24px;
    border: 2px solid #e2e8f0;
}

.edit-container .back-link {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
}

.edit-container .back-link a {
    color: #666;
    text-decoration: none;
    font-size: 16px;
    transition: color 0.2s;
}

.edit-container .back-link a:hover {
    color: rgb(255, 52, 52);
}

.edit-content {
    display: flex;
    gap: 50px;
    align-items: flex-start;
}

.edit-content .avatar {
    flex: 0 0 350px;
}

.edit-content .profile-header {
    width: 350px;
    height: 350px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgb(182, 182, 182);
}

.edit-content .profile-header img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.edit-content .desc {
    flex: 1;
    padding: 20px;
}

.edit-content .form-group {
    margin-bottom: 25px;
    position: relative;
}

.edit-content .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
}

.edit-content .form-group input[type="text"] {
    width: 100%;
    padding: 12px;
    border: 1px solid rgb(182, 182, 182);
    border-radius: 5px;
    font-size: 16px;
}

.edit-content .form-group textarea {
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

.edit-content .form-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.edit-content .btn-save {
    background-color: rgb(255, 52, 52);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 12px 24px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 16px;
}

.edit-content .btn-save:hover {
    background-color: rgb(230, 45, 45);
}

.edit-content .btn-save:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.edit-content .btn-cancel {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid rgb(182, 182, 182);
    border-radius: 5px;
    padding: 12px 24px;
    text-decoration: none;
    transition: background-color 0.2s;
    font-size: 16px;
}

.edit-content .btn-cancel:hover {
    background-color: #e0e0e0;
}

@media(max-width: 1000px) {
    .editblock {
        padding: 150px 20px 50px;
    }

    .edit-container {
        padding: 20px;
        width: 100%;
    }

    .edit-content {
        flex-direction: column;
        gap: 30px;
    }

    .edit-content .avatar {
        flex: 0 0 auto;
    }

    .edit-content .profile-header {
        width: 100%;
        height: 300px;
    }

    .edit-content .form-group input[type="text"],
    .edit-content .form-group textarea {
        font-size: 18px;
        padding: 15px;
    }

    .edit-content .btn-save,
    .edit-content .btn-cancel {
        font-size: 18px;
        padding: 15px 30px;
    }
}
</style>