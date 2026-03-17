<template>
  <AppLayout>
    <div class="admin-container">
      <h1>Админ панель</h1>
      <div class="admin-nav">
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
    </div>
  </AppLayout>
</template>
  
<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { onMounted, onUnmounted } from 'vue';
import { Link } from '@inertiajs/vue3';
  
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