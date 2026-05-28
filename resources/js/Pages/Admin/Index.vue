<template>
  <AppLayout>
    <Head title="Админ панель" />
    <div class="admin-container">
      <h1>Админ панель</h1>
      <div class="admin-nav">
        <Link href="/admin" class="admin-nav-item active">
          Главная
        </Link>
        <Link href="/admin/users" class="admin-nav-item">
          Пользователи
        </Link>
        <Link href="/admin/posts" class="admin-nav-item">
          Посты
        </Link>
        <Link href="/admin/comments" class="admin-nav-item">
          Комментарии
        </Link>
        <Link href="/admin/disputes" class="admin-nav-item">
          Споры
          <span v-if="disputesCount > 0" class="badge">{{ disputesCount }}</span>
        </Link>
      </div>

      <h2>Заявки</h2>
      <div class="banner">
        <Link href="/admin/verification-requests" class="link">
          Заявки на подтверждение аккаунта
          <span class="badge">{{ pendingCount }}</span>
        </Link>
      </div>

      <h2>Репорты</h2>
      <div class="banners">
        <div class="banner">
          <Link :href="`/admin/users?mode=reports`" class="link">
            Пользователи
            <span class="badge">{{ usersReportCount }}</span>
          </Link>
        </div>
        <div class="banner">
          <Link :href="`/admin/posts?mode=reports`" class="link">
            Посты
            <span class="badge">{{ postsReportCount }}</span>
          </Link>
        </div>
        <div class="banner">
          <Link :href="`/admin/comments?mode=reports`" class="link">
            Комментарии
            <span class="badge">{{ commentsReportCount }}</span>
          </Link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import { useDarkMode } from '@/composables/useDarkMode';

const props = defineProps({
  pendingVerificationCount: { type: Number, default: 0 },
  usersReportCount:         { type: Number, default: 0 },
  postsReportCount:         { type: Number, default: 0 },
  commentsReportCount:      { type: Number, default: 0 },
  disputesCount:            { type: Number, default: 0 },
});

const pendingCount = ref(props.pendingVerificationCount || 0);
useDarkMode();

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
</script>

<style scoped>
/* ─── Banners layout ─────────────────────────────────────── */
.banners {
  display: flex;
  flex-wrap: wrap;   /* ← на узких экранах переносится в колонку */
  gap: 16px;
}

.banner {
  width: max-content;
  margin: 30px 0;
  padding: 20px;
  background: #f0f0f0;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

/* ─── Link ───────────────────────────────────────────────── */
.link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: black;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* ─── Badge ──────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: #64748b;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
}

/* ─── Dark mode ──────────────────────────────────────────── */
html.dark .banner {
  background: #1e293b;
  border-color: #334155;
}

html.dark .link {
  color: #f1f5f9;
}

/* ─── Mobile ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  /* Навигация — горизонтальный скролл без переноса */
  .admin-nav {
    display: flex;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;        /* Firefox */
    gap: 4px;
    padding-bottom: 4px;
    margin-bottom: 4px;
  }
  .admin-nav::-webkit-scrollbar {
    display: none;                /* Chrome/Safari */
  }
  .admin-nav-item {
    white-space: nowrap;          /* не ломаем текст пунктов */
    flex-shrink: 0;
  }

  /* Баннеры — в колонку, на всю ширину */
  .banners {
    flex-direction: column;
    gap: 12px;
  }

  .banner {
    width: 100%;
    box-sizing: border-box;
    margin: 12px 0;
  }

  /* Немного уменьшаем шрифт ссылки */
  .link {
    font-size: 15px;
  }
}
</style>