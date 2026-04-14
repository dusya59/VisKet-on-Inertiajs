<template>
  <AppLayout>
    <Head title="Баланс" />

    <div class="balance-page">
      <div class="back-link">
          <Link href="#" onclick="history.back(); return false;">
            ← Назад
          </Link>
        </div>
      <div class="balance-container">
        <div v-if="pendingTransactions && pendingTransactions.length > 0" class="pending-section">
          <h2>Ожидающие зачисления</h2>
          <div class="transactions-list">
            <div v-for="transaction in pendingTransactions" :key="transaction.id" class="transaction-item pending">
              <div class="transaction-icon">⏳</div>
              <div class="transaction-details">
                <div class="transaction-type">
                  {{ transaction.type === 'payment' ? 'Оплата за работу' : transaction.description }}
                </div>
                <div class="transaction-from" v-if="transaction.from_user">
                  От: {{ transaction.from_user.name }}
                </div>
                <div class="transaction-vacancy" v-if="transaction.application?.vacancy">
                  Вакансия: {{ transaction.application.vacancy.position }}
                </div>
                <div class="transaction-status">
                  Ожидание: {{ getDaysRemaining(transaction) }} дн.
                </div>
              </div>
              <div class="transaction-amount">+{{ Number(transaction.amount).toFixed(2) }} ₽</div>
            </div>
          </div>
        </div>

        <div class="history-section">
          <h1>История транзакций</h1>
          
          <div class="filter-tabs">
            <button 
              :class="{ active: filter === 'all' }"
              @click="filter = 'all'"
            >
              Все
            </button>
            <button 
              :class="{ active: filter === 'incoming' }"
              @click="filter = 'incoming'"
            >
              Входящие
            </button>
            <button 
              :class="{ active: filter === 'outgoing' }"
              @click="filter = 'outgoing'"
            >
              Исходящие
            </button>
          </div>

          <div class="transactions-list" v-if="filteredTransactions.length > 0">
            <div 
              v-for="transaction in filteredTransactions" 
              :key="transaction.id" 
              class="transaction-item"
              :class="{
                pending: transaction.status === 'pending',
                cancelled: transaction.status === 'cancelled'
              }"
            >
              <div class="transaction-icon">
                {{ getTransactionIcon(transaction) }}
              </div>
              <div class="transaction-details">
                <div class="transaction-type">
                  {{ getTransactionType(transaction) }}
                </div>
                <div class="transaction-party" v-if="getTransactionParty(transaction)">
                  {{ getTransactionParty(transaction) }}
                </div>
                <div class="transaction-date">
                  {{ formatDate(transaction.created_at) }}
                </div>
              </div>
              <div 
                class="transaction-amount"
                :class="{ 
                  incoming: isIncoming(transaction),
                  outgoing: isOutgoing(transaction)
                }"
              >
                {{ isIncoming(transaction) ? '+' : '-' }}{{ Number(transaction.amount).toFixed(2) }} ₽
              </div>
            </div>
          </div>
          <div v-else class="no-transactions">
            Транзакций пока нет
          </div>

          <div v-if="transactions && transactions.last_page > 1" class="pagination">
            <button 
              v-if="transactions.current_page > 1"
              @click="loadPage(transactions.current_page - 1)"
              class="pagination-btn"
            >
              ← Назад
            </button>
            <span class="pagination-info">
              Страница {{ transactions.current_page }} из {{ transactions.last_page }}
            </span>
            <button 
              v-if="transactions.current_page < transactions.last_page"
              @click="loadPage(transactions.current_page + 1)"
              class="pagination-btn"
            >
              Вперёд →
            </button>
          </div>
        </div>
        <div class="balance-card">
          <h1>{{ isWithdrawal ? 'Снятие средств' : 'Пополнение баланса' }}</h1>
          
          <div class="current-balance">
            <span class="label">Текущий баланс:</span>
            <span class="amount">{{ Number(balance) }} ₽</span>
          </div>

          <div class="type-toggle">
            <button 
              :class="{ active: !isWithdrawal }"
              @click="isWithdrawal = false"
            >
              Пополнение
            </button>
            <button 
              :class="{ active: isWithdrawal }"
              @click="isWithdrawal = true"
              :disabled="Number(balance) <= 0"
            >
              Снятие
            </button>
          </div>

          <form @submit.prevent="submitBalance" class="balance-form">
            <div class="form-group">
              <label for="amount">{{ isWithdrawal ? 'Сумма снятия:' : 'Сумма пополнения:' }}</label>
              <input 
                type="number" 
                name="amount" 
                id="amount" 
                v-model="form.amount"
                :min="1"
                :max="isWithdrawal ? Number(balance) : 100000"
                required
                placeholder="Введите сумму"
              >
            </div>

            <div class="quick-amounts" v-if="!isWithdrawal">
              <button 
                type="button" 
                v-for="amount in quickAmounts" 
                :key="amount"
                @click="form.amount = amount"
                :class="{ active: form.amount === amount }"
              >
                {{ amount }} ₽
              </button>
            </div>

            <div class="quick-amounts" v-else>
              <button 
                type="button" 
                v-for="amount in withdrawalAmounts" 
                :key="amount"
                @click="form.amount = amount"
                :class="{ active: form.amount === amount }"
              >
                {{ amount }} ₽
              </button>
            </div>

            <button type="submit" class="btn-submit" :disabled="form.processing">
              {{ form.processing ? (isWithdrawal ? 'Снятие...' : 'Пополнение...') : (isWithdrawal ? 'Снять средства' : 'Пополнить баланс') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

const props = defineProps({
  balance: {
    type: [Number, String],
    default: 0
  },
  pendingTransactions: {
    type: Array,
    default: () => []
  },
  transactions: {
    type: Object,
    default: () => ({ data: [], current_page: 1, last_page: 1 })
  }
})

const page = usePage()
const authUser = computed(() => page.props.auth?.user || page.props.authUser || null)

const quickAmounts = [100, 300, 500, 1000, 3000, 5000]
const withdrawalAmounts = [100, 300, 500, 1000, 3000, 5000]
const isWithdrawal = ref(false)
const filter = ref('all')

const form = useForm({
  amount: ''
})

const submitBalance = () => {
  const url = isWithdrawal.value ? '/balance/withdraw' : '/balance/add'
  form.post(url, {
    preserveScroll: true,
    onSuccess: () => {
      form.reset()
    }
  })
}

const getDaysRemaining = (transaction) => {
  if (!transaction.completed_at) return 7
  const completed = new Date(transaction.completed_at)
  const now = new Date()
  const diffTime = completed - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, 7 - diffDays)
}

const filteredTransactions = computed(() => {
  if (!props.transactions || !props.transactions.data) return []
  
  return props.transactions.data.filter(transaction => {
    if (filter.value === 'all') return true
    if (filter.value === 'incoming') return transaction.to_user_id === authUser.value?.id
    if (filter.value === 'outgoing') return transaction.from_user_id === authUser.value?.id
    return true
  })
})

const isIncoming = (transaction) => {
  return transaction.to_user_id === authUser.value?.id
}

const isOutgoing = (transaction) => {
  return transaction.from_user_id === authUser.value?.id
}

const getTransactionIcon = (transaction) => {
  if (transaction.status === 'pending') return '⏳'
  if (transaction.status === 'cancelled') return '❌'
  if (transaction.type === 'deposit') return '💰'
  if (transaction.type === 'withdrawal') return '💸'
  if (transaction.type === 'payment') return '💳'
  return '💱'
}

const getTransactionType = (transaction) => {
  if (transaction.status === 'pending') return 'Ожидание зачисления'
  if (transaction.status === 'cancelled') return 'Отменено'
  if (transaction.type === 'deposit') return 'Пополнение баланса'
  if (transaction.type === 'withdrawal') return 'Снятие средств'
  if (transaction.type === 'payment') return transaction.description || 'Оплата'
  return transaction.description || 'Перевод'
}

const getTransactionParty = (transaction) => {
  if (transaction.type === 'deposit' || transaction.type === 'withdrawal') return null
  if (isIncoming(transaction) && transaction.from_user) {
    return `От: ${transaction.from_user.name}`
  }
  if (isOutgoing(transaction) && transaction.to_user) {
    return `Кому: ${transaction.to_user.name}`
  }
  return null
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadPage = (pageNum) => {
  window.location.href = `/balance?page=${pageNum}`
}
</script>

<style scoped>
.balance-page {
  min-height: 100vh;
}

.balance-container {
  display: flex;
  flex-direction: row;
  gap: 30px;
  width: 1200px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: 30px;
}

.back-link a {
  color: #666;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.2s;
}

.back-link a:hover {
  color: rgb(255, 52, 52);
}

.balance-card {
  background: white;
  border-radius: 24px;
  border: 2px solid rgb(182, 182, 182);
  padding: 40px;
  margin-bottom: 30px;
  width: 500px;
  height: min-content;
}

.balance-container h1 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

.type-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.type-toggle button {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid rgb(182, 182, 182);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.type-toggle button:hover:not(:disabled) {
  border-color: rgb(255, 52, 52);
}

.type-toggle button.active {
  background: rgb(255, 52, 52);
  border-color: rgb(255, 52, 52);
  color: white;
}

.type-toggle button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 30px;
}

.current-balance .label {
  font-size: 16px;
  color: #666;
}

.current-balance .amount {
  font-size: 24px;
  font-weight: 600;
  color: rgb(255, 52, 52);
}

.balance-form .form-group {
  margin-bottom: 20px;
}

.balance-form label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.balance-form input[type="number"] {
  width: 100%;
  padding: 12px;
  border: 1px solid rgb(182, 182, 182);
  border-radius: 5px;
  font-size: 16px;
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.quick-amounts button {
  padding: 10px 20px;
  border: 1px solid rgb(182, 182, 182);
  border-radius: 5px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.quick-amounts button:hover {
  border-color: rgb(255, 52, 52);
  color: rgb(255, 52, 52);
}

.quick-amounts button.active {
  background: rgb(255, 52, 52);
  border-color: rgb(255, 52, 52);
  color: white;
}

.btn-submit {
  width: 100%;
  background-color: rgb(255, 52, 52);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 14px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
  font-weight: 500;
}

.btn-submit:hover {
  background-color: rgb(230, 45, 45);
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pending-section,
.history-section {
  background: white;
  border-radius: 24px;
  border: 2px solid rgb(182, 182, 182);
  padding: 30px;
  margin-bottom: 30px;
  min-width: 500px;
}

.pending-section h2,
.history-section h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.transaction-item.pending {
  background: #fef3c7;
  border-color: #fbbf24;
}

.transaction-item.cancelled {
  background: #fee2e2;
  border-color: #fca5a5;
  opacity: 0.7;
}

.transaction-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.transaction-details {
  flex: 1;
}

.transaction-type {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.transaction-from,
.transaction-party,
.transaction-vacancy {
  font-size: 13px;
  color: #666;
}

.transaction-date {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.transaction-status {
  font-size: 12px;
  color: #d97706;
  font-weight: 500;
  margin-top: 4px;
}

.transaction-amount {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.transaction-amount.incoming {
  color: #22c55e;
}

.transaction-amount.outgoing {
  color: #ef4444;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-tabs button {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-tabs button:hover {
  border-color: rgb(255, 52, 52);
}

.filter-tabs button.active {
  background: rgb(255, 52, 52);
  border-color: rgb(255, 52, 52);
  color: white;
}

.no-transactions {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
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
  border-color: rgb(255, 52, 52);
  color: rgb(255, 52, 52);
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

@media(max-width: 1000px) {
  .balance-page {
    padding: 150px 20px 50px;
  }

  .balance-card,
  .pending-section,
  .history-section {
    padding: 25px;
  }

  .balance-card h1 {
    font-size: 24px;
  }

  .current-balance .amount {
    font-size: 20px;
  }
}
</style>
