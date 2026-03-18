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

      <div class="verification-banner">
        <Link href="/admin/verification-requests" class="verification-link">
          Заявки на подтверждение аккаунта
          <span class="badge">{{ pendingCount }}</span>
        </Link>
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
.verification-banner {
  margin-top: 30px;
  padding: 20px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
}

.verification-link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #92400e;
  text-decoration: none;
  font-weight: 500;
}

.verification-link:hover {
  text-decoration: underline;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: #f59e0b;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
}
</style>