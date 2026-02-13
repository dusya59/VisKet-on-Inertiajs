<template>
  <AppLayout>
    <div class="admin-container">
      <h1>Управление пользователями</h1>
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
          </div>
          <div class="user-actions">
            <Link 
              :href="`/profile/${user.id}`" 
              class="btn"
            >
              Профиль
            </Link>
            <button 
              @click="startConversation(user.id)" 
              class="btn"
              :disabled="sendingMessage === user.id"
            >
              {{ sendingMessage === user.id ? 'Отправка...' : 'Сообщение' }}
            </button>
          </div>
        </div>
  
        <div v-if="filteredUsers.length === 0" class="no-results">
          Пользователи не найдены
        </div>
      </div>
    </div>
  </AppLayout>
</template>
  
<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, computed, onMounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import axios from 'axios';
  
  // Состояние
  const users = ref([]);
  const searchQuery = ref('');
  const loading = ref(true);
  const error = ref(null);
  const sendingMessage = ref(null);
  
  // Константы
  const DEFAULT_AVATAR = '/images/User-avatar.svg.png';
  
  // Вычисляемые свойства
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
      
      const response = await axios.get('/api/admin/users');
      users.value = response.data.users || response.data;
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
      
      // Перенаправляем на страницу чата/сообщений
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
  
  const handleSearch = () => {

  };

  onMounted(() => {
    // Загрузка стилей
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/admin.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = '/js/admin.js';
    document.body.appendChild(script);

    fetchUsers();
  });
</script>
  