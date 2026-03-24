<template>
  <AppLayout>
    <div class="admin-container">
      <h1>{{ mode === 'verification' ? 'Список заявок на получение подтвержденного аккаунта' : 'Управление пользователями' }}</h1>
      <div class="admin-nav">
        <Link href="/admin" class="admin-nav-item">
          Главная
        </Link>
        <Link href="/admin/users" class="admin-nav-item active">
          Пользователи
        </Link>
        <Link href="/admin/posts" class="admin-nav-item">
          Посты
        </Link>
        <Link href="/admin/comments" class="admin-nav-item">
          Комментарии
        </Link>
      </div>

      <div class="search-container">
        <input 
          type="text" 
          id="userSearch" 
          v-model="searchQuery"
          placeholder="Поиск пользователя..."
          @input="handleSearch"
        >
      </div>

      <div v-if="loading" class="loading">
        Загрузка...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="users-list">
        <div 
          v-for="user in filteredUsers" 
          :key="user.id" 
          class="user-item"
        >
          <img 
            :src="getUserAvatar(user)" 
            :alt="user.name"
            class="user-avatar"
            @error="handleImageError"
          >
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
            <p v-if="user.phone" class="user-phone">{{ user.phone }}</p>
            <div v-if="mode === 'verification'" class="verification-info">
              <button 
                class="attempts-toggle"
                @click="toggleRejections(user.id)"
              >
                Кол-во попыток получить верификацию: {{ user.verification_attempts || 0 }}
                <span class="arrow" :class="{ open: openRejections[user.id] }">▼</span>
              </button>
              <div v-if="openRejections[user.id] && user.verification_rejections?.length" class="rejections-dropdown">
                <div 
                  v-for="rejection in user.verification_rejections" 
                  :key="rejection.id"
                  class="rejection-item"
                >
                  <div class="rejection-date">{{ formatDate(rejection.rejected_at) }}</div>
                  <div class="rejection-reason">{{ rejection.reason }}</div>
                </div>
              </div>
              <div v-else-if="openRejections[user.id]" class="no-rejections">
                История отказов пуста
              </div>
            </div>
          </div>
          <div class="user-actions">
            <Link 
              :href="`/profile/${user.id}`" 
              class="btn"
            >
              Профиль
            </Link>
            
            <template v-if="mode === 'verification'">
              <button 
                @click="approveUser(user.id)" 
                class="btn btn-approve"
                :disabled="processingUser === user.id"
              >
                {{ processingUser === user.id ? '...' : 'Одобрить' }}
              </button>
              <button 
                @click="showRejectModal(user.id)" 
                class="btn btn-reject"
                :disabled="processingUser === user.id"
              >
                Отказать
              </button>
            </template>
            <template v-else>
              <button 
                @click="startConversation(user.id)" 
                class="btn"
                :disabled="sendingMessage === user.id"
              >
                {{ sendingMessage === user.id ? 'Отправка...' : 'Сообщение' }}
              </button>
            </template>
          </div>
        </div>

        <div v-if="filteredUsers.length === 0" class="no-results">
          {{ mode === 'verification' ? 'Заявок на подтверждение нет' : 'Пользователи не найдены' }}
        </div>
      </div>

      <div v-if="rejectingUserId" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal">
          <h3>Укажите причину отказа</h3>
          <textarea 
            v-model="rejectionReason" 
            placeholder="Причина отказа..."
            rows="4"
          ></textarea>
          <div class="modal-actions">
            <button @click="closeRejectModal" class="btn btn-cancel">Отмена</button>
            <button @click="confirmReject" class="btn btn-reject" :disabled="!rejectionReason.trim()">
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
  
<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import axios from 'axios';

const props = defineProps({
  mode: {
    type: String,
    default: 'users'
  }
});

let adminLink = null;
let adminScript = null;
  
  const users = ref([]);
  const searchQuery = ref('');
  const loading = ref(true);
  const error = ref(null);
  const sendingMessage = ref(null);
  const processingUser = ref(null);
  const rejectingUserId = ref(null);
  const rejectionReason = ref('');
  const pendingCount = ref(0);
  const openRejections = ref({});
  const mode = computed(() => props.mode || 'users');
  
  const DEFAULT_AVATAR = '/images/User-avatar.png';
  
  const filteredUsers = computed(() => {
    if (!searchQuery.value) {
      return users.value;
    }
    
    const query = searchQuery.value.toLowerCase();
    return users.value.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const fetchUsers = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const params = mode.value === 'verification' ? '?mode=verification' : '';
      const response = await axios.get(`/api/admin/users${params}`);
      users.value = response.data.users || response.data;
      
      if (mode.value === 'verification') {
        pendingCount.value = users.value.length;
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      error.value = 'Не удалось загрузить пользователей';
    } finally {
      loading.value = false;
    }
  };

  const getUserAvatar = (user) => {
    if (user.avatar) {
      return `/storage/${user.avatar}`;
    }
    return DEFAULT_AVATAR;
  };
  
  const handleImageError = (event) => {
    event.target.src = DEFAULT_AVATAR;
  };
  
  const startConversation = async (userId) => {
    try {
      sendingMessage.value = userId;
      const response = await axios.post(`/api/conversations/start/${userId}`);
    
      if (response.data.conversation_id) {
        router.visit(`/messages/${response.data.conversation_id}`);
      } else {
        router.visit('/messages');
      }
    } catch (err) {
      console.error('Ошибка создания диалога:', err);
      alert('Не удалось начать диалог');
    } finally {
      sendingMessage.value = null;
    }
  };

  const toggleRejections = (userId) => {
    openRejections.value[userId] = !openRejections.value[userId];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const approveUser = async (userId) => {
    try {
      processingUser.value = userId;
      await axios.post(`/api/admin/users/${userId}/approve`);
      users.value = users.value.filter(u => u.id !== userId);
      pendingCount.value = Math.max(0, pendingCount.value - 1);
    } catch (err) {
      console.error('Ошибка одобрения:', err);
      alert('Не удалось одобрить заявку');
    } finally {
      processingUser.value = null;
    }
  };

  const showRejectModal = (userId) => {
    rejectingUserId.value = userId;
    rejectionReason.value = '';
  };

  const closeRejectModal = () => {
    rejectingUserId.value = null;
    rejectionReason.value = '';
  };

  const confirmReject = async () => {
    if (!rejectionReason.value.trim()) return;
    
    try {
      processingUser.value = rejectingUserId.value;
      await axios.post(`/api/admin/users/${rejectingUserId.value}/reject`, {
        reason: rejectionReason.value
      });
      users.value = users.value.filter(u => u.id !== rejectingUserId.value);
      pendingCount.value = Math.max(0, pendingCount.value - 1);
      closeRejectModal();
    } catch (err) {
      console.error('Ошибка отказа:', err);
      alert('Не удалось отклонить заявку');
    } finally {
      processingUser.value = null;
    }
  };
  
  const handleSearch = () => {};

  onMounted(() => {
    adminLink = document.createElement('link');
    adminLink.rel = 'stylesheet';
    adminLink.href = '/css/admin.css';
    document.head.appendChild(adminLink);

    adminScript = document.createElement('script');
    adminScript.src = '/js/admin.js';
    document.body.appendChild(adminScript);

    fetchUsers();
  });

  onUnmounted(() => {
    if (adminLink) {
      document.head.removeChild(adminLink);
      adminLink = null;
    }
    if (adminScript) {
      document.body.removeChild(adminScript);
      adminScript = null;
    }
  });
</script>

<style scoped>
.user-phone {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.verification-info {
  margin-top: 8px;
}

.attempts-toggle {
  background: none;
  border: none;
  color: #f59e0b;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.attempts-toggle:hover {
  text-decoration: underline;
}

.arrow {
  font-size: 10px;
  transition: transform 0.2s;
  display: inline-block;
}

.arrow.open {
  transform: rotate(180deg);
}

.rejections-dropdown {
  margin-top: 8px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.rejection-item {
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.rejection-item:last-child {
  border-bottom: none;
}

.rejection-date {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
}

.rejection-reason {
  font-size: 13px;
  color: #334155;
}

.no-rejections {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

.btn-approve {
  background-color: #22c55e !important;
}

.btn-approve:hover {
  background-color: #16a34a !important;
}

.btn-reject {
  background-color: #ff2525 !important;
}

.btn-reject:hover {
  background-color: #c91c1c !important;
}

.btn-cancel {
  background-color: #e2e8f0 !important;
  color: #64748b !important;
}

.btn-cancel:hover {
  background-color: #cbd5e1 !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.modal h3 {
  margin-bottom: 16px;
  font-size: 18px;
  color: #333;
}

.modal textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.modal textarea:focus {
  outline: none;
  border-color: rgb(255, 52, 52);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}

.modal-actions .btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.modal-actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
  