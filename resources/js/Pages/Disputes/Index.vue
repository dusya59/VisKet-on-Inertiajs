<template>
  <AppLayout>
    <Head title="Управление спорами" />

    <div class="disputes-page">
      <div class="page-header">
        <h1>Управление спорами</h1>
      </div>

      <div class="disputes-list" v-if="disputes && disputes.data && disputes.data.length > 0">
        <div v-for="dispute in disputes.data" :key="dispute.id" class="dispute-card">
          <div class="dispute-header">
            <div class="dispute-status" :class="dispute.status">
              {{ getStatusLabel(dispute.status) }}
            </div>
            <div class="dispute-date">
              {{ formatDate(dispute.created_at) }}
            </div>
          </div>

          <div class="dispute-body">
            <div class="dispute-initiator">
              <strong>Инициатор:</strong> {{ dispute.initiator?.name || 'Неизвестно' }}
            </div>
            <div class="dispute-application" v-if="dispute.application">
              <strong>Вакансия:</strong> {{ dispute.application.vacancy?.position || 'Неизвестно' }}
            </div>
            <div class="dispute-reason">
              <strong>Причина:</strong>
              <p>{{ dispute.reason }}</p>
            </div>
            <div class="dispute-admin" v-if="dispute.admin">
              <strong>Администратор:</strong> {{ dispute.admin.name }}
            </div>
            <div class="dispute-resolution" v-if="dispute.resolution">
              <strong>Решение:</strong>
              <p>{{ dispute.resolution }}</p>
            </div>
          </div>

          <div class="dispute-actions">
            <template v-if="dispute.status === 'open'">
              <button 
                v-if="!dispute.admin_id" 
                @click="takeDispute(dispute.id)" 
                class="btn-take"
                :disabled="processing === dispute.id"
              >
                {{ processing === dispute.id ? 'Принимаем...' : 'Взять в работу' }}
              </button>
              <template v-else>
                <button @click="showResolveModal(dispute)" class="btn-resolve">
                  Вынести решение
                </button>
              </template>
            </template>
            <button @click="viewChat(dispute.chat_id)" class="btn-chat">
              Перейти в чат
            </button>
          </div>
        </div>
      </div>

      <div v-else class="no-disputes">
        <p>Нет открытых споров</p>
      </div>

      <div v-if="disputes && disputes.last_page > 1" class="pagination">
        <button 
          v-if="disputes.current_page > 1"
          @click="goToPage(disputes.current_page - 1)"
          class="pagination-btn"
        >
          ← Назад
        </button>
        <span class="pagination-info">
          Страница {{ disputes.current_page }} из {{ disputes.last_page }}
        </span>
        <button 
          v-if="disputes.current_page < disputes.last_page"
          @click="goToPage(disputes.current_page + 1)"
          class="pagination-btn"
        >
          Вперёд →
        </button>
      </div>

      <div v-if="resolveModal.show" class="modal-overlay" @click.self="closeResolveModal">
        <div class="resolve-modal">
          <div class="modal-header">
            <h3>Вынести решение по спору</h3>
            <button @click="closeResolveModal" class="modal-close">&times;</button>
          </div>
          <form @submit.prevent="submitResolution">
            <div class="modal-body">
              <label for="resolution">Решение:</label>
              <textarea 
                id="resolution" 
                v-model="resolveModal.resolution" 
                rows="5"
                minlength="10"
                required
                placeholder="Опишите ваше решение (минимум 10 символов)"
              ></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" @click="closeResolveModal" class="btn-cancel">Отмена</button>
              <button type="submit" class="btn-submit">Отправить решение</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, router } from '@inertiajs/vue3'
import { ref } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  disputes: {
    type: Object,
    default: () => ({ data: [], current_page: 1, last_page: 1 })
  }
})

useDarkMode()

const processing = ref(null)
const resolveModal = ref({
  show: false,
  disputeId: null,
  resolution: ''
})

const getStatusLabel = (status) => {
  const labels = {
    'open': 'Открыт',
    'resolved': 'Решён',
    'cancelled': 'Отменён'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const takeDispute = (disputeId) => {
  processing.value = disputeId
  router.post(`/admin/disputes/${disputeId}/take`, {}, {
    preserveScroll: true,
    onFinish: () => {
      processing.value = null
    }
  })
}

const showResolveModal = (dispute) => {
  resolveModal.value = {
    show: true,
    disputeId: dispute.id,
    resolution: ''
  }
}

const closeResolveModal = () => {
  resolveModal.value = {
    show: false,
    disputeId: null,
    resolution: ''
  }
}

const submitResolution = () => {
  if (resolveModal.value.resolution.length < 10) {
    return
  }

  router.post(`/admin/disputes/${resolveModal.value.disputeId}/resolve`, {
    resolution: resolveModal.value.resolution
  }, {
    preserveScroll: true,
    onSuccess: () => {
      closeResolveModal()
    }
  })
}

const viewChat = (chatId) => {
  if (chatId) {
    router.visit(`/chats/${chatId}`)
  }
}

const goToPage = (page) => {
  router.visit(`/admin/disputes?page=${page}`)
}
</script>

<style scoped>
.disputes-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
}

.disputes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dispute-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.dispute-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.dispute-status {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.dispute-status.open {
  background: #fee2e2;
  color: #dc2626;
}

.dispute-status.resolved {
  background: #dcfce7;
  color: #16a34a;
}

.dispute-status.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.dispute-date {
  font-size: 13px;
  color: #666;
}

.dispute-body {
  margin-bottom: 15px;
}

.dispute-initiator,
.dispute-application {
  margin-bottom: 8px;
  font-size: 14px;
}

.dispute-initiator strong,
.dispute-application strong {
  color: #333;
}

.dispute-reason {
  margin-top: 15px;
}

.dispute-reason strong {
  font-size: 14px;
  color: #333;
}

.dispute-reason p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #555;
  background: #f9fafb;
  padding: 10px;
  border-radius: 6px;
}

.dispute-admin {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.dispute-resolution {
  margin-top: 15px;
  padding: 12px;
  background: #dcfce7;
  border-radius: 6px;
}

.dispute-resolution strong {
  font-size: 14px;
  color: #16a34a;
}

.dispute-resolution p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #333;
}

.dispute-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-take,
.btn-resolve,
.btn-chat {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-take {
  background: #007bff;
  color: white;
}

.btn-take:hover:not(:disabled) {
  background: #0056b3;
}

.btn-take:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-resolve {
  background: #16a34a;
  color: white;
}

.btn-resolve:hover {
  background: #15803d;
}

.btn-chat {
  background: #f3f4f6;
  color: #333;
}

.btn-chat:hover {
  background: #e5e7eb;
}

.no-disputes {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  color: #666;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.resolve-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-body label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.modal-body textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #007bff;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 10px 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-submit {
  padding: 10px 20px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-submit:hover {
  background: #15803d;
}

html.dark .page-header h1 {
  color: #f1f5f9;
}

html.dark .dispute-card {
  background: #1e293b;
  border-color: #334155;
}

html.dark .dispute-header {
  border-bottom-color: #334155;
}

html.dark .dispute-status.open {
  background: #450a0a;
  color: #fca5a5;
}

html.dark .dispute-status.resolved {
  background: #052e16;
  color: #4ade80;
}

html.dark .dispute-status.cancelled {
  background: #334155;
  color: #94a3b8;
}

html.dark .dispute-date {
  color: #94a3b8;
}

html.dark .dispute-initiator strong,
html.dark .dispute-application strong {
  color: #f1f5f9;
}

html.dark .dispute-reason strong {
  color: #f1f5f9;
}

html.dark .dispute-reason p {
  color: #e2e8f0;
  background: #0f172a;
}

html.dark .dispute-admin {
  color: #94a3b8;
}

html.dark .dispute-resolution {
  background: #0f172a;
}

html.dark .dispute-resolution strong {
  color: #22c55e;
}

html.dark .dispute-resolution p {
  color: #f1f5f9;
}

html.dark .btn-chat {
  background: #334155;
  color: #f1f5f9;
}

html.dark .btn-chat:hover {
  background: #475569;
}

html.dark .no-disputes {
  background: #1e293b;
  color: #94a3b8;
}

html.dark .pagination-btn {
  border-color: #334155;
  background: #1e293b;
  color: #f1f5f9;
}

html.dark .pagination-btn:hover {
  border-color: #60a5fa;
  color: #60a5fa;
}

html.dark .pagination-info {
  color: #94a3b8;
}

html.dark .resolve-modal {
  background: #1e293b;
}

html.dark .modal-header {
  border-bottom-color: #334155;
}

html.dark .modal-header h3 {
  color: #f1f5f9;
}

html.dark .modal-close {
  color: #94a3b8;
}

html.dark .modal-body label {
  color: #e2e8f0;
}

html.dark .modal-body textarea {
  border-color: #334155;
  background: #1e293b;
  color: #f1f5f9;
}

html.dark .modal-body textarea:focus {
  border-color: #60a5fa;
}

html.dark .modal-footer {
  border-top-color: #334155;
}

html.dark .btn-cancel {
  background: #1e293b;
  border-color: #475569;
  color: #f1f5f9;
}

html.dark .btn-cancel:hover {
  background: #334155;
}

@media(max-width: 1000px) {
  .disputes-page {
    padding: 150px 20px 50px;
  }
}
</style>
