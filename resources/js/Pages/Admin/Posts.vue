<template>
  <AppLayout>
    <Head :title="mode === 'reports' ? 'Жалобы на посты' : 'Управление постами'" />
    <div class="admin-container">
      <h1>{{ mode === 'reports' ? 'Жалобы на посты' : 'Управление постами' }}</h1>
      <div class="admin-nav">
        <Link href="/admin" class="admin-nav-item">
          Главная
        </Link>
        <Link href="/admin/users" class="admin-nav-item">
          Пользователи
        </Link>
        <Link :href="mode === 'reports' ? '/admin/posts?mode=reports' : '/admin/posts'" class="admin-nav-item active">
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
            <div v-if="mode === 'reports' && post.reports?.length" class="reports-info">
              <p class="reports-count">Жалоб: {{ post.reports.length }}</p>
              <button 
                class="attempts-toggle"
                @click="toggleReports(post.id)"
              >
                Подробнее
                <span class="arrow" :class="{ open: openReports[post.id] }">▼</span>
              </button>
              <div v-if="openReports[post.id]" class="rejections-dropdown">
                <div 
                  v-for="report in post.reports" 
                  :key="report.id"
                  class="rejection-item"
                >
                  <div class="rejection-date">{{ formatDate(report.created_at) }}</div>
                  <div class="rejection-reason">{{ report.reason }}</div>
                  <Link v-if="report.reporter" :href="`/profile/${report.reporter.id}`" class="reporter-info">
                    От: {{ report.reporter.name }}
                  </Link>
                  <div v-else class="reporter-info">От: Неизвестный</div>
                </div>
              </div>
            </div>
          </div>
          <div class="post-actions">
            <Link 
              :href="`/posts/${post.id}`" 
              class="btn"
            >
              Просмотр
            </Link>
            <template v-if="mode === 'reports'">
              <button 
                @click="dismissPostReports(post.id)" 
                class="btn btn-dismiss"
                :disabled="deleting === post.id"
              >
                {{ deleting === post.id ? '...' : 'Игнорировать' }}
              </button>
              <button 
                @click="warnPost(post.id)" 
                class="btn btn-warn"
                :disabled="deleting === post.id"
              >
                Предупреждение
              </button>
              <button 
                @click="hidePost(post.id)" 
                class="btn btn-danger"
                :disabled="deleting === post.id"
              >
                Скрыть
              </button>
            </template>
            <template v-else>
              <button 
                @click="deletePost(post.id)" 
                class="btn btn-danger"
                :disabled="deleting === post.id"
              >
                {{ deleting === post.id ? 'Удаление...' : 'Удалить' }}
              </button>
            </template>
          </div>
        </div>
  
        <div v-if="filteredPosts.length === 0" class="no-results">
          {{ mode === 'reports' ? 'Нет жалоб на посты' : 'Посты не найдены' }}
        </div>
      </div>
    </div>
  </AppLayout>
</template>
  
<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import axios from 'axios';
import { useDarkMode } from '@/composables/useDarkMode';

const props = defineProps({
  mode: {
    type: String,
    default: 'posts'
  }
});

useDarkMode();
let adminLink = null;

const mode = computed(() => props.mode || 'posts');

const posts = ref([]);
const searchQuery = ref('');
const loading = ref(true);
const error = ref(null);
const deleting = ref(null);
const openReports = ref({});

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
  
  const fetchPosts = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      let params = '';
      if (mode.value === 'reports') {
        params = '?mode=reports';
      }
      const response = await axios.get(`/admin/posts/data${params}`);
      posts.value = response.data.posts || response.data;
    } catch (err) {
      console.error('Ошибка загрузки постов:', err);
      error.value = 'Не удалось загрузить посты';
    } finally {
      loading.value = false;
    }
  };
  
  const formatDate = (dateString) => {
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

  const toggleReports = (postId) => {
    openReports.value[postId] = !openReports.value[postId];
  };

  const dismissPostReports = async (postId) => {
    try {
      deleting.value = postId;
      await axios.post(`/admin/posts/${postId}/dismiss-reports`);
      posts.value = posts.value.filter(post => post.id !== postId);
    } catch (err) {
      console.error('Ошибка игнорирования жалоб:', err);
      alert('Не удалось игнорировать жалобы');
    } finally {
      deleting.value = null;
    }
  };

  const warnPost = async (postId) => {
    try {
      deleting.value = postId;
      await axios.post(`/admin/posts/${postId}/warn`);
      posts.value = posts.value.filter(post => post.id !== postId);
      alert('Предупреждение отправлено');
    } catch (err) {
      console.error('Ошибка отправки предупреждения:', err);
      alert('Не удалось отправить предупреждение');
    } finally {
      deleting.value = null;
    }
  };

  const hidePost = async (postId) => {
    if (!confirm('Вы уверены, что хотите скрыть этот пост?')) {
      return;
    }
  
    try {
      deleting.value = postId;
      await axios.post(`/admin/posts/${postId}/hide`);
      posts.value = posts.value.filter(post => post.id !== postId);
      alert('Пост скрыт');
    } catch (err) {
      console.error('Ошибка скрытия поста:', err);
      alert('Не удалось скрыть пост');
    } finally {
      deleting.value = null;
    }
  };
  
  const deletePost = async (postId) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }
  
    try {
      deleting.value = postId;
      
      await axios.delete(`/admin/posts/${postId}`);
      
      posts.value = posts.value.filter(post => post.id !== postId);
      
      alert('Пост успешно удален');
    } catch (err) {
      console.error('Ошибка удаления поста:', err);
      alert('Не удалось удалить пост');
    } finally {
      deleting.value = null;
    }
  };
  
  const handleSearch = () => {};
  
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
    position: absolute;
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

  .btn-warn {
    background-color: #8b5cf6 !important;
  }

  .btn-warn:hover {
    background-color: #7c3aed !important;
  }

  .reporter-info {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
    text-decoration: none;
  }

  .reporter-info:hover {
    text-decoration: underline;
    color: #4f46e5;
  }
  html.dark .loading,
html.dark .error,
html.dark .no-results {
  color: #94a3b8;
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

html.dark .reporter-info:hover {
  color: #818cf8;
}
</style>