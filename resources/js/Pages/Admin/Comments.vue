<template>
      <AppLayout>
    <div class="admin-container">
      <h1>{{ mode === 'reports' ? 'Жалобы на комментарии' : 'Управление комментариями' }}</h1>
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
        <Link :href="mode === 'reports' ? '/admin/comments?mode=reports' : '/admin/comments'" class="admin-nav-item" :class="{ active: mode !== 'reports' }">
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
            <div v-if="mode === 'reports' && comment.reports?.length" class="reports-info">
              <p class="reports-count">Жалоб: {{ comment.reports.length }}</p>
              <button 
                class="attempts-toggle"
                @click="toggleReports(comment.id)"
              >
                Подробнее
                <span class="arrow" :class="{ open: openReports[comment.id] }">▼</span>
              </button>
              <div v-if="openReports[comment.id]" class="rejections-dropdown">
                <div 
                  v-for="report in comment.reports" 
                  :key="report.id"
                  class="rejection-item"
                >
                  <div class="rejection-date">{{ formatReportDate(report.created_at) }}</div>
                  <div class="rejection-reason">{{ report.reason }}</div>
                  <div class="reporter-info">От: {{ report.reporter?.name || 'Неизвестный' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="comment-actions">
            <Link 
              v-if="comment.post" 
              :href="`/posts/${comment.post.id}`" 
              class="btn"
            >
              К посту
            </Link>
            <template v-if="mode === 'reports'">
              <button 
                @click="dismissCommentReports(comment.id)" 
                class="btn btn-dismiss"
                :disabled="deleting === comment.id"
              >
                {{ deleting === comment.id ? '...' : 'Игнорировать' }}
              </button>
              <button 
                @click="deleteComment(comment.id)" 
                class="btn btn-danger"
                :disabled="deleting === comment.id"
              >
                Удалить
              </button>
            </template>
            <template v-else>
              <button 
                @click="deleteComment(comment.id)" 
                class="btn btn-danger"
                :disabled="deleting === comment.id"
              >
                {{ deleting === comment.id ? 'Удаление...' : 'Удалить' }}
              </button>
            </template>
          </div>
        </div>
  
        <div v-if="filteredComments.length === 0" class="no-results">
          {{ mode === 'reports' ? 'Нет жалоб на комментарии' : 'Комментарии не найдены' }}
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
import { useDarkMode } from '@/composables/useDarkMode';

    const props = defineProps({
      mode: {
        type: String,
        default: 'comments'
      }
    });

    useDarkMode();
    let adminLink = null;
    let adminScript = null;

  const comments = ref([]);
  const searchQuery = ref('');
  const loading = ref(true);
  const error = ref(null);
  const deleting = ref(null);
  const openReports = ref({});
  
  const DEFAULT_AVATAR = '/images/User-avatar.png';
  const mode = computed(() => props.mode || 'comments');

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
      
      let params = '';
      if (mode.value === 'reports') {
        params = '?mode=reports';
      }
      const response = await axios.get(`/admin/comments/data${params}`);
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
      
      await axios.delete(`/admin/comments/${commentId}`);

      comments.value = comments.value.filter(comment => comment.id !== commentId);
      
      alert('Комментарий успешно удален');
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
      alert('Не удалось удалить комментарий');
    } finally {
      deleting.value = null;
    }
  };

  const toggleReports = (commentId) => {
    openReports.value[commentId] = !openReports.value[commentId];
  };

  const dismissCommentReports = async (commentId) => {
    try {
      deleting.value = commentId;
      await axios.post(`/admin/comments/${commentId}/dismiss-reports`);
      comments.value = comments.value.filter(comment => comment.id !== commentId);
    } catch (err) {
      console.error('Ошибка игнорирования жалоб:', err);
      alert('Не удалось игнорировать жалобы');
    } finally {
      deleting.value = null;
    }
  };

  const formatReportDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleSearch = () => {

  };

  onMounted(() => {
    adminLink = document.createElement('link');
    adminLink.rel = 'stylesheet';
    adminLink.href = '/css/admin.css';
    document.head.appendChild(adminLink);

    adminScript = document.createElement('script');
    adminScript.src = '/js/admin.js';
    document.body.appendChild(adminScript);

    fetchComments();
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
.reports-info {
  margin-top: 8px;
}

.reports-count {
  font-size: 13px;
  color: #ef4444;
  font-weight: 500;
  margin-bottom: 4px;
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

.reporter-info {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.btn-dismiss {
  background-color: #f59e0b !important;
}

.btn-dismiss:hover {
  background-color: #d97706 !important;
}

.btn-danger {
  background-color: #ef4444 !important;
}

.btn-danger:hover {
  background-color: #dc2626 !important;
}
html.dark .rejections-dropdown {
  background: #1e293b;
  border-color: #334155;
}

html.dark .rejection-item {
  border-bottom-color: #334155;
}

html.dark .rejection-date {
  color: #94a3b8;
}

html.dark .rejection-reason {
  color: #e2e8f0;
}

html.dark .reporter-info {
  color: #94a3b8;
}
</style>