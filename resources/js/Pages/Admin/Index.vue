<template>
  <AppLayout>
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
      </div>
      <div class="banners">
        <div class="banner">
          <Link href="/admin/verification-requests" class="link">
            Заявки на подтверждение аккаунта
            <span class="badge">{{ pendingCount }}</span>
          </Link>
        </div>
        <div class="banner">
          <Link href=" " class="link">
            Репорты
            <span class="badge">{{ pendingCount }}</span>
          </Link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
  
<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { Link } from '@inertiajs/vue3';
  
  const props = defineProps({
    pendingVerificationCount: {
      type: Number,
      default: 0
    }
  });

  const pendingCount = ref(props.pendingVerificationCount || 0);
  
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
.banners{
  display: flex;
  gap: 20px;
}
.banner {
  width: max-content;
  margin-top: 30px;
  padding: 20px;
  background: #f0f0f0;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

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
</style>