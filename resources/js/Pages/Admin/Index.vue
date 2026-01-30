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
import { onMounted } from 'vue';
import { Link } from '@inertiajs/vue3';
  
  onMounted(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/admin.css';
    document.head.appendChild(link);
  });
  </script>
  
  <style scoped>
  </style>