<template>
  <AppLayout>
    <div class="admin-container">
      <h1>Управление постами</h1>
      <div class="admin-nav">
        <Link href="/admin" class="admin-nav-item">
          Главная
        </Link>
        <Link href="/admin/users" class="admin-nav-item">
          Пользователи
        </Link>
        <Link href="/admin/posts" class="admin-nav-item active">
          Посты
        </Link>
        <Link href="/admin/comments" class="admin-nav-item">
          Комментарии
        </Link>
      </div>
  
      <div class="search-container">
        <input 
          type="text" 
          id="postSearch" 
          v-model="searchQuery"
          placeholder="Поиск поста..."
          @input="handleSearch"
        >
      </div>
  
      <div v-if="loading" class="loading">
        Загрузка...
      </div>
  
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
  
      <div v-else class="posts-list">
        <div 
          v-for="post in filteredPosts" 
          :key="post.id" 
          class="post-item"
        >
          <img 
            :src="`/storage/${post.image}`" 
            :alt="post.title"
            class="post-image"
          >
          <div class="post-info">
            <h3>{{ post.title }}</h3>
            <p>{{ post.description }}</p>
            <small>Автор: {{ post.user?.name }}</small>
          </div>
          <div class="post-actions">
            <Link 
              :href="`/posts/${post.id}`" 
              class="btn"
            >
              Просмотр
            </Link>
            <button 
              @click="deletePost(post.id)" 
              class="btn btn-danger"
              :disabled="deleting === post.id"
            >
              {{ deleting === post.id ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
  
        <div v-if="filteredPosts.length === 0" class="no-results">
          Посты не найдены
        </div>
      </div>
    </div>
  </AppLayout>
</template>
  
<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link } from '@inertiajs/vue3';
import axios from 'axios';

let adminLink = null;

onMounted(() => {
  adminLink = document.createElement('link');
  adminLink.rel = 'stylesheet';
  adminLink.href = '/css/admin.css';
  document.head.appendChild(adminLink);
});

onUnmounted(() => {
  if (adminLink) {
    document.head.removeChild(adminLink);
    adminLink = null;
  }
});

  const posts = ref([]);
  const searchQuery = ref('');
  const loading = ref(true);
  const error = ref(null);
  const deleting = ref(null);

  const filteredPosts = computed(() => {
    if (!searchQuery.value) {
      return posts.value;
    }
    
    const query = searchQuery.value.toLowerCase();
    return posts.value.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.user?.name.toLowerCase().includes(query)
    );
  });
  
  // Методы
  const fetchPosts = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await axios.get('/api/admin/posts');
      posts.value = response.data.posts || response.data;
    } catch (err) {
      console.error('Ошибка загрузки постов:', err);
      error.value = 'Не удалось загрузить посты';
    } finally {
      loading.value = false;
    }
  };
  
  const deletePost = async (postId) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }
  
    try {
      deleting.value = postId;
      
      await axios.delete(`/api/admin/posts/${postId}`);
      
      posts.value = posts.value.filter(post => post.id !== postId);
      
      alert('Пост успешно удален');
    } catch (err) {
      console.error('Ошибка удаления поста:', err);
      alert('Не удалось удалить пост');
    } finally {
      deleting.value = null;
    }
  };
  
  const handleSearch = () => {

  };
  onMounted(() => {
    const script = document.createElement('script');
    script.src = '/js/admin.js';
    document.body.appendChild(script);
    fetchPosts();
  });
  </script>
  
  <style scoped>
  .loading,
  .error,
  .no-results {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .error {
    color: #dc3545;
  }
  
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  </style>