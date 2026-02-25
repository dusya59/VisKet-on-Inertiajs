<template>
      <AppLayout>
    <div class="admin-container">
      <h1>Управление комментариями</h1>
      <div class="admin-nav">
        <Link href="/admin" class="admin-nav-item">
          Главная
        </Link>
        <Link href="/admin/users" class="admin-nav-item">
          Пользователи
        </Link>
        <Link href="/admin/posts" class="admin-nav-item">
          Посты
        </Link>
        <Link href="/admin/comments" class="admin-nav-item active">
          Комментарии
        </Link>
      </div>
  
      <div class="search-container">
        <input 
          type="text" 
          id="commentSearch" 
          v-model="searchQuery"
          placeholder="Поиск комментария..."
          @input="handleSearch"
        >
      </div>
  
      <div v-if="loading" class="loading">
        Загрузка...
      </div>
  
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
  
      <div v-else class="comments-list">
        <div 
          v-for="comment in filteredComments" 
          :key="comment.id" 
          class="comment-item"
        >
          <div class="comment-info">
            <div class="comment-header">
              <img 
                :src="getUserAvatar(comment.user)" 
                :alt="comment.user?.name"
                class="comment-avatar"
                @error="handleImageError"
              >
              <div>
                <h3>{{ comment.user?.name || 'Неизвестный пользователь' }}</h3>
                <small>{{ formatDate(comment.created_at) }}</small>
              </div>
            </div>
            <p>{{ comment.text }}</p>
            <small>К посту: {{ comment.post?.title || 'Пост удален' }}</small>
          </div>
          <div class="comment-actions">
            <Link 
              v-if="comment.post" 
              :href="`/posts/${comment.post.id}`" 
              class="btn"
            >
              К посту
            </Link>
            <button 
              @click="deleteComment(comment.id)" 
              class="btn btn-danger"
              :disabled="deleting === comment.id"
            >
              {{ deleting === comment.id ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
  
        <div v-if="filteredComments.length === 0" class="no-results">
          Комментарии не найдены
        </div>
      </div>
    </div>
    </AppLayout>
  </template>
<script setup>
    import AppLayout from '@/Layouts/AppLayout.vue';
    import { ref, computed, onMounted } from 'vue';
    import { Link } from '@inertiajs/vue3';
    import axios from 'axios';

  const comments = ref([]);
  const searchQuery = ref('');
  const loading = ref(true);
  const error = ref(null);
  const deleting = ref(null);
  
  const DEFAULT_AVATAR = '../../../../public/images/User-avatar.png';

  const filteredComments = computed(() => {
    if (!searchQuery.value) {
      return comments.value;
    }
    
    const query = searchQuery.value.toLowerCase();
    return comments.value.filter(comment => 
      comment.text.toLowerCase().includes(query) ||
      comment.user?.name.toLowerCase().includes(query) ||
      comment.post?.title.toLowerCase().includes(query)
    );
  });
  
  const fetchComments = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await axios.get('/api/admin/comments');
      comments.value = response.data.comments || response.data;
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
      error.value = 'Не удалось загрузить комментарии';
    } finally {
      loading.value = false;
    }
  };
  
  const getUserAvatar = (user) => {
    if (user?.avatar) {
      return `/storage/${user.avatar}`;
    }
    return DEFAULT_AVATAR;
  };
  
  const handleImageError = (event) => {
    event.target.src = DEFAULT_AVATAR;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'только что';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${pluralize(diffInMinutes, 'минуту', 'минуты', 'минут')} назад`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${pluralize(diffInHours, 'час', 'часа', 'часов')} назад`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${pluralize(diffInDays, 'день', 'дня', 'дней')} назад`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${pluralize(diffInWeeks, 'неделю', 'недели', 'недель')} назад`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${pluralize(diffInMonths, 'месяц', 'месяца', 'месяцев')} назад`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${pluralize(diffInYears, 'год', 'года', 'лет')} назад`;
  };
  
  const pluralize = (number, one, few, many) => {
    const mod10 = number % 10;
    const mod100 = number % 100;
    
    if (mod10 === 1 && mod100 !== 11) {
      return one;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return few;
    }
    return many;
  };
  
  const deleteComment = async (commentId) => {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }
  
    try {
      deleting.value = commentId;
      
      await axios.delete(`/api/admin/comments/${commentId}`);

      comments.value = comments.value.filter(comment => comment.id !== commentId);
      
      alert('Комментарий успешно удален');
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
      alert('Не удалось удалить комментарий');
    } finally {
      deleting.value = null;
    }
  };
  
  const handleSearch = () => {

  };

  onMounted(() => {

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/admin.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = '/js/admin.js';
    document.body.appendChild(script);

    fetchComments();
  });
  </script>
