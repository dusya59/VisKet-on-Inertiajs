<template>
  <AppLayout>
    <div class="notifications-container">
      <div class="notifications-header">
        <h1>Уведомления</h1>
        <button 
          v-if="unreadCount > 0" 
          @click="markAllAsRead"
          class="mark-all-btn"
        >
          Отметить все как прочитанные
        </button>
      </div>

      <div v-if="notifications.length === 0" class="empty-notifications">
        <p>У вас пока нет уведомлений</p>
      </div>

      <div v-else class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.is_read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <span v-if="notification.type === 'message'">💬</span>
            <span v-else-if="notification.type === 'post_warning'">⚠️</span>
            <span v-else-if="notification.type === 'post_hidden'">🚫</span>
            <span v-else>🔔</span>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-text">{{ notification.content }}</div>
            <div class="notification-time">{{ notification.created_at }}</div>
          </div>
          <div v-if="!notification.is_read" class="unread-dot"></div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'
import axios from 'axios'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  },
  unreadCount: {
    type: Number,
    default: 0
  }
})

useDarkMode()

const notifications = ref([...props.notifications])
const unreadCount = ref(props.unreadCount)

const handleNotificationClick = async (notification) => {
  if (!notification.is_read) {
    try {
      await axios.post('/notifications/mark-read', { id: notification.id })
      notification.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (err) {
      console.error('Ошибка обновления уведомления:', err)
    }
  }
  
  if (notification.link) {
    router.visit(notification.link)
  }
}

const markAllAsRead = async () => {
  try {
    await axios.post('/notifications/mark-read', { all: true })
    notifications.value.forEach(n => n.is_read = true)
    unreadCount.value = 0
  } catch (err) {
    console.error('Ошибка обновления уведомлений:', err)
  }
}
</script>

<style scoped>
.notifications-container {
  min-height: 100vh;
  padding: 50px;
  margin: 0 auto;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  font-size: 32px;
  color: #333;
}

.mark-all-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s;
}

.mark-all-btn:hover {
  background: #f8fafc;
  color: #333;
}

.empty-notifications {
  text-align: center;
  padding: 60px;
  color: #94a3b8;
  font-size: 18px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  width: 50%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.notification-item.unread {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.notification-text {
  line-height: 1.5;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
}

.unread-dot {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 10px;
  height: 10px;
  background: rgb(255, 52, 52);
  border-radius: 50%;
}

@media(max-width: 768px) {
  .notifications-container {
    padding: 100px 20px 50px;
  }

  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  h1 {
    font-size: 24px;
  }
}

html.dark h1 {
  color: #f1f5f9;
}

html.dark .mark-all-btn {
  border-color: #334155;
  color: #94a3b8;
}

html.dark .mark-all-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

html.dark .notification-item {
  background: #1e293b;
  border-color: #334155;
}

html.dark .notification-item:hover {
  border-color: #475569;
}

html.dark .notification-item.unread {
  background: #334155;
  border-color: #475569;
}

html.dark .notification-title {
  color: #f1f5f9;
}

html.dark .notification-text {
  color: #e2e8f0;
}
</style>
