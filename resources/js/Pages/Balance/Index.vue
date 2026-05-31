<template>
  <AppLayout>
    <Head title="Баланс" />

    <div class="balance-page">
      <div class="main">
        <!-- Top row: Funding + Analytics -->
        <section class="top-row">
          <!-- Funding card -->
          <div class="card">
            <h2 class="funding-card-title">{{ isWithdrawal ? 'Снятие средств' : 'Пополнение баланса' }}</h2>

            <div class="balance-row">
              <span class="balance-row-label">Текущий баланс:</span>
              <span class="balance-row-amount">{{ Number(balance).toLocaleString('ru-RU') }} ₽</span>
            </div>

            <div class="toggle-row">
              <button
                type="button"
                class="toggle-btn"
                :class="{ active: !isWithdrawal }"
                @click="isWithdrawal = false"
              >
                Пополнение
              </button>
              <button
                type="button"
                class="toggle-btn"
                :class="{ active: isWithdrawal }"
                :disabled="Number(balance) <= 0"
                @click="isWithdrawal = true"
              >
                Снятие
              </button>
            </div>

            <label class="input-label">{{ isWithdrawal ? 'Сумма снятия:' : 'Сумма пополнения:' }}</label>
            <div class="input-wrapper">
              <input
                v-model="formattedAmount"
                type="text"
                inputmode="numeric"
                placeholder="Введите сумму"
              />
              <span class="currency-suffix">₽</span>
            </div>
            <div class="message-wrapper" :class="{ visible: form.errors.amount || withdrawError || flashMessage }">
              <p v-if="form.errors.amount" class="error-text">{{ form.errors.amount }}</p>
              <p v-if="withdrawError" class="error-text">{{ withdrawError }}</p>
              <p v-if="flashMessage" class="success-text">{{ flashMessage }}</p>
            </div>

            <div class="quick-amounts">
              <button
                v-for="amount in (isWithdrawal ? withdrawalAmounts : quickAmounts)"
                :key="amount"
                type="button"
                class="quick-amount-btn"
                @click="setAmount(amount)"
              >
                {{ amount.toLocaleString('ru-RU') }} ₽
              </button>
            </div>

            <!-- Payout destination form -->
            <div v-if="isWithdrawal" class="payout-form">
              <label class="input-label">Способ вывода:</label>
              <div v-if="payoutMethods.length > 0" class="saved-methods">
                <button
                  v-for="m in payoutMethods"
                  :key="m.id"
                  type="button"
                  class="method-btn"
                  :class="{ active: selectedMethodId === m.id }"
                  @click="selectedMethodId = m.id; form.card_number = ''"
                >
                  Карта {{ m.masked_number }}
                </button>
                <button
                  type="button"
                  class="method-btn"
                  :class="{ active: !selectedMethodId }"
                  @click="selectedMethodId = null"
                >
                  Новый способ
                </button>
              </div>

              <div v-if="!selectedMethodId" class="new-method">
                <div class="input-group">
                  <label class="input-label">Номер карты:</label>
                  <div class="input-wrapper">
                    <input
                      v-model="form.card_number"
                      type="text"
                      inputmode="numeric"
                      placeholder="0000 0000 0000 0000"
                      maxlength="19"
                      @input="e => form.card_number = formatCardNumber(e.target.value)"
                    />
                  </div>
                  <p v-if="form.errors.card_number" class="error-text">{{ form.errors.card_number }}</p>
                </div>

                <label class="save-method-label">
                  <input v-model="form.save_method" type="checkbox" />
                  Сохранить реквизиты для следующих выводов
                </label>
              </div>

              <div v-else class="saved-method-info">
                <p class="method-info">Вывод на сохранённый реквизит</p>
                <button
                  type="button"
                  class="remove-method-btn"
                  @click="removeSavedMethod"
                >
                  Нажмите сюда, чтобы убрать
                </button>
              </div>
            </div>

            <button class="btn-cta" :disabled="form.processing" @click="submitBalance">
              {{ form.processing ? (isWithdrawal ? 'Снятие...' : 'Пополнение...') : (isWithdrawal ? 'Вывести средства' : 'Пополнить баланс') }}
            </button>
          </div>

          <!-- Analytics chart -->
          <div class="card chart-card">
            <div class="chart-header">
              <h2 class="chart-title">Аналитика</h2>
              <div class="toggle-row">
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: chartView === 'received' }"
                  @click="chartView = 'received'"
                >
                  Получено
                </button>
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: chartView === 'spent' }"
                  @click="chartView = 'spent'"
                >
                  Выведено
                </button>
              </div>
            </div>
            <div ref="chartWrapper" class="chart-wrapper">
              <div class="chart-container">
                <div class="y-axis">
                  <span v-for="val in yAxisValues" :key="val">{{ val.toLocaleString('ru-RU') }}</span>
                </div>
                <div class="grid-lines">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="grid-line"
                    :style="{ top: ((i - 1) * 20) + '%' }"
                  />
                </div>
                <div ref="barsContainer" class="chart-bars">
                  <div
                    v-for="(val, i) in chartData"
                    :key="i"
                    class="bar-group"
                  >
                    <div
                      class="bar"
                      :class="chartView"
                      :style="{ height: (val / chartMax * 100) + '%' }"
                      @mouseenter="showTooltip($event, i, val)"
                      @mouseleave="hideTooltip"
                    />
                  </div>
                </div>
              </div>
              <div class="x-axis">
                <span v-for="(m, i) in months" :key="i">{{ m }}</span>
              </div>
              <div
                class="chart-tooltip"
                :class="{ visible: tooltip.visible }"
                :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
                v-html="tooltip.text"
              />
            </div>
          </div>
        </section>

        <!-- Pending -->
        <div v-if="pendingTransactions && pendingTransactions.length > 0" class="card pending-section">
          <h2 class="funding-card-title">Ожидающие зачисления</h2>
          <div class="tx-list">
            <div v-for="tx in pendingTransactions" :key="tx.id" class="tx-item pending">
              <div class="tx-top">
                <span class="tx-amount positive">+{{ Number(tx.amount).toFixed(2) }} ₽</span>
                <span class="tx-status pending">Ожидание</span>
              </div>
              <div class="tx-desc">
                {{ tx.type === 'payment' ? 'Оплата за работу' : tx.description }}
                <span v-if="tx.from_user"> — {{ tx.from_user.name }}</span>
              </div>
              <div class="tx-date">Осталось: {{ getDaysRemaining(tx) }} дн.</div>
            </div>
          </div>
        </div>

        <!-- History -->
        <section class="history-section card">
          <div class="history-header">
            <h2 class="history-title">История транзакций</h2>
          </div>

          <div class="history-tabs">
            <button
              class="history-tab"
              :class="{ active: historyTab === 'received' }"
              @click="historyTab = 'received'"
            >
              Получено
            </button>
            <button
              class="history-tab"
              :class="{ active: historyTab === 'sent' }"
              @click="historyTab = 'sent'"
            >
              Отправлено
            </button>
            <button
              class="history-tab"
              :class="{ active: historyTab === 'withdrawn' }"
              @click="historyTab = 'withdrawn'"
            >
              Вывод
            </button>
          </div>

          <div class="history-columns">
            <!-- Received -->
            <div class="history-col" :class="{ active: historyTab === 'received' }">
              <div class="history-column-title">
                <span class="dot dot-received" />
                Получено
              </div>
              <div class="tx-list">
                <div v-for="tx in receivedTransactions" :key="tx.id" class="tx-item">
                  <div class="tx-top">
                    <span class="tx-amount positive">+{{ Number(tx.amount).toFixed(2) }} ₽</span>
                    <span :class="['tx-status', tx.status]">
                      {{ getStatusLabel(tx.status) }}
                    </span>
                  </div>
                  <div class="tx-desc">{{ getTransactionType(tx) }}</div>
                  <div class="tx-date">{{ formatDate(tx.created_at) }}</div>
                </div>
                <div v-if="receivedTransactions.length === 0" class="tx-item empty">Нет транзакций</div>
              </div>
            </div>

            <!-- Sent -->
            <div class="history-col" :class="{ active: historyTab === 'sent' }">
              <div class="history-column-title">
                <span class="dot dot-sent" />
                Отправлено
              </div>
              <div class="tx-list">
                <div v-for="tx in sentTransactions" :key="tx.id" class="tx-item">
                  <div class="tx-top">
                    <span class="tx-amount negative">−{{ Number(tx.amount).toFixed(2) }} ₽</span>
                    <span :class="['tx-status', tx.status]">
                      {{ getStatusLabel(tx.status) }}
                    </span>
                  </div>
                  <div class="tx-desc">{{ getTransactionType(tx) }}</div>
                  <div class="tx-date">{{ formatDate(tx.created_at) }}</div>
                </div>
                <div v-if="sentTransactions.length === 0" class="tx-item empty">Нет транзакций</div>
              </div>
            </div>

            <!-- Withdrawn -->
            <div class="history-col" :class="{ active: historyTab === 'withdrawn' }">
              <div class="history-column-title">
                <span class="dot dot-withdrawn" />
                Вывод средств
              </div>
              <div class="tx-list">
                <div v-for="tx in withdrawnTransactions" :key="tx.id" class="tx-item">
                  <div class="tx-top">
                    <span class="tx-amount withdrawn">−{{ Number(tx.amount).toFixed(2) }} ₽</span>
                    <span :class="['tx-status', tx.status]">
                      {{ getStatusLabel(tx.status) }}
                    </span>
                  </div>
                  <div class="tx-desc">{{ getTransactionType(tx) }}</div>
                  <div class="tx-date">{{ formatDate(tx.created_at) }}</div>
                  <button
                    v-if="tx.status === 'pending' && tx.payout && tx.payout.yookassa_payout_id"
                    type="button"
                    class="refresh-btn"
                    @click="refreshPayout(tx.id)"
                  >
                    Проверить статус
                  </button>
                </div>
                <div v-if="withdrawnTransactions.length === 0" class="tx-item empty">Нет транзакций</div>
              </div>
            </div>
          </div>

          <div v-if="transactions && transactions.last_page > 1" class="pagination">
            <button
              v-if="transactions.current_page > 1"
              class="pagination-btn"
              @click="loadPage(transactions.current_page - 1)"
            >
              ← Назад
            </button>
            <span class="pagination-info">Страница {{ transactions.current_page }} из {{ transactions.last_page }}</span>
            <button
              v-if="transactions.current_page < transactions.last_page"
              class="pagination-btn"
              @click="loadPage(transactions.current_page + 1)"
            >
              Вперёд →
            </button>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, router, useForm, usePage } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  balance: { type: [Number, String], default: 0 },
  pendingTransactions: { type: Array, default: () => [] },
  transactions: { type: Object, default: () => ({ data: [], current_page: 1, last_page: 1 }) },
  payoutMethods: { type: Array, default: () => [] }
})

useDarkMode()

const page = usePage()
const authUser = computed(() => page.props.auth?.user || page.props.authUser || null)
const flashMessage = computed(() => page.props.flash?.success || page.props.flash?.message || '')

const quickAmounts = [100, 300, 500, 1000, 3000, 5000]
const withdrawalAmounts = [100, 300, 500, 1000, 3000, 5000]
const isWithdrawal = ref(false)
const historyTab = ref('received')

const form = useForm({
  amount: '',
  card_number: '',
  save_method: false,
  payout_method_id: null,
})
const displayAmount = ref('')
const formError = ref('')
const selectedMethodId = ref(null)

const withdrawError = computed(() => {
  if (formError.value) return formError.value
  if (!isWithdrawal.value) return ''
  return page.props.flash?.error || ''
})

const formattedAmount = computed({
  get: () => displayAmount.value,
  set: (val) => {
    const raw = val.replace(/[^\d]/g, '')
    displayAmount.value = raw ? parseInt(raw, 10).toLocaleString('ru-RU') : ''
    form.amount = raw
  }
})

const setAmount = (amount) => {
  displayAmount.value = amount.toLocaleString('ru-RU')
  form.amount = String(amount)
}

const luhnCheck = (cardNumber) => {
  const clean = cardNumber.replace(/\D/g, '')
  if (clean.length < 13) return false
  let sum = 0
  let alternate = false
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean.substring(i, i + 1), 10)
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }
  return sum % 10 === 0
}

const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const parts = []
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4))
  }
  return parts.length ? parts.join(' ') : value
}

const submitBalance = () => {
  formError.value = ''
  form.clearErrors()

  if (isWithdrawal.value) {
    const balanceVal = typeof props.balance === 'number' ? props.balance : parseFloat(props.balance) || 0
    const amount = parseFloat(form.amount)
    if (amount > balanceVal) {
      formError.value = 'Недостаточно средств на балансе! Максимум: ' + balanceVal.toLocaleString('ru-RU') + ' ₽'
      return
    }
    if (amount < 100) {
      formError.value = 'Минимальная сумма вывода — 100 ₽'
      return
    }
    if (!selectedMethodId.value) {
      if (!form.card_number) {
        formError.value = 'Введите номер банковской карты'
        return
      }
      if (!luhnCheck(form.card_number)) {
        formError.value = 'Неверный номер банковской карты. Проверьте правильность ввода.'
        return
      }
    }
    form.payout_method_id = selectedMethodId.value
  }

  const url = isWithdrawal.value ? '/balance/withdraw' : '/balance/add'
  form.post(url, {
    preserveScroll: true,
    onSuccess: () => {
      form.reset()
      displayAmount.value = ''
      formError.value = ''
      selectedMethodId.value = null
    },
    onFinish: () => {
      form.processing = false
    },
    onError: (errors) => {
      if (errors?.amount) {
        form.setError('amount', errors.amount)
      }
      if (errors?.card_number) {
        form.setError('card_number', errors.card_number)
      }
      if (errors?.error) {
        form.setError('amount', errors.error)
      }
    }
  })
}

const removeSavedMethod = () => {
  if (!selectedMethodId.value) return
  if (!confirm('Удалить сохранённый способ вывода?')) return

  form.delete(`/balance/payout-methods/${selectedMethodId.value}`, {
    preserveScroll: true,
    onSuccess: () => {
      selectedMethodId.value = null
    },
  })
}

const getDaysRemaining = (transaction) => {
  if (!transaction.completed_at) return 7
  const completed = new Date(transaction.completed_at)
  const now = new Date()
  const diffDays = Math.ceil((completed - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, 7 - diffDays)
}

const isIncoming = (tx) => tx.to_user_id === authUser.value?.id
const isOutgoing = (tx) => tx.from_user_id === authUser.value?.id

const allTransactions = computed(() => props.transactions?.data || [])

const receivedTransactions = computed(() =>
  allTransactions.value.filter(tx => isIncoming(tx) && tx.type !== 'withdrawal')
)

const sentTransactions = computed(() =>
  allTransactions.value.filter(tx => isOutgoing(tx) && tx.type !== 'withdrawal')
)

const withdrawnTransactions = computed(() =>
  allTransactions.value.filter(tx => tx.type === 'withdrawal')
)

const getTransactionType = (tx) => {
  if (tx.status === 'pending') return 'Ожидание зачисления'
  if (tx.status === 'cancelled') return 'Отменено'
  if (tx.type === 'deposit') return 'Пополнение баланса'
  if (tx.type === 'withdrawal') return 'Снятие средств'
  if (tx.type === 'payment') return tx.description || 'Оплата'
  return tx.description || 'Перевод'
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

/* Chart */
const chartView = ref('received')
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

const chartData = computed(() => {
  const data = new Array(12).fill(0)
  allTransactions.value.forEach(tx => {
    const d = new Date(tx.created_at)
    const month = d.getMonth()
    if (chartView.value === 'received') {
      if (isIncoming(tx) && tx.type !== 'withdrawal') data[month] += Number(tx.amount)
    } else {
      if (isOutgoing(tx) || tx.type === 'withdrawal') data[month] += Number(tx.amount)
    }
  })
  return data
})

const chartMax = computed(() => {
  const max = Math.max(...chartData.value, 1)
  return Math.ceil(max / 1000) * 1000
})

const yAxisValues = computed(() => {
  const step = chartMax.value / 5
  return [5, 4, 3, 2, 1, 0].map(i => Math.round(step * i))
})

const refreshPayout = (transactionId) => {
  router.post('/balance/refresh-payout', {
    transaction_id: transactionId,
  }, {
    preserveScroll: true,
    onError: (errors) => {
      alert(errors?.error || 'Ошибка обновления статуса')
    }
  })
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed': return 'Завершён'
    case 'cancelled': return 'Отменён'
    case 'pending': return 'Ожидание'
    default: return status
  }
}

const tooltip = ref({ visible: false, x: 0, y: 0, text: '' })
const barsContainer = ref(null)
const chartWrapper = ref(null)

const showTooltip = (event, i, val) => {
  const bar = event.target
  const wrapper = chartWrapper.value
  if (!wrapper) return
  const rect = bar.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: rect.left - wrapperRect.left + rect.width / 2,
    y: rect.top - wrapperRect.top - 48,
    text: `${months[i]}: <strong>${val.toLocaleString('ru-RU')} ₽</strong>`
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}
</script>

<style scoped>
.balance-page {
  font-family: var(--font-body);
  line-height: 1.5;
  min-height: 100vh;
}

.main {
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0 80px;
}

.card {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 32px;
  transition: box-shadow var(--transition);
}
.card:hover { box-shadow: var(--shadow-lg); }

.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.funding-card-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: oklch(96% 0.005 250);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  margin-bottom: 24px;
}
.balance-row-label {
  font-size: 15px;
  color: var(--muted);
  font-weight: 500;
}
.balance-row-amount {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
}

.toggle-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.toggle-btn {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--fg);
}
.toggle-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
.toggle-btn:hover:not(.active):not(:disabled) {
  border-color: var(--muted);
}
.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 8px;
  display: block;
}

.message-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, margin 0.3s ease;
  margin-bottom: 0;
}

.message-wrapper.visible {
  max-height: 60px;
  margin-bottom: 12px;
}


.input-wrapper {
  position: relative;
  margin-bottom: 20px;
}
.input-wrapper input {
  width: 100%;
  font-family: var(--font-body);
  font-size: 16px;
  padding: 14px 60px 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--transition);
  background: var(--surface);
  color: var(--fg);
}
.input-wrapper input:focus {
  border-color: var(--accent);
}
.input-wrapper input::placeholder {
  color: var(--muted);
}
.currency-suffix {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  font-weight: 600;
  color: var(--muted);
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}
.quick-amount-btn {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--fg);
  cursor: pointer;
  transition: all var(--transition);
}
.quick-amount-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.quick-amount-btn:active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-cta {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  width: 100%;
  background: var(--accent);
  color: white;
}
.btn-cta:hover:not(:disabled) { background: var(--accent-deep); }
.btn-cta:disabled { opacity: 0.6; cursor: not-allowed; }

.error-text {
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
}

.success-text {
  color: var(--success);
  font-size: 13px;
  font-weight: 600;
}

.payout-form {
  margin-bottom: 24px;
}

.saved-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.method-btn {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--fg);
  cursor: pointer;
  transition: all var(--transition);
}

.method-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.method-btn:hover:not(.active) {
  border-color: var(--muted);
}

.new-method {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.save-method-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.save-method-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
  cursor: pointer;
}

.saved-method-info {
  padding: 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.method-info {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

.remove-method-btn {
  margin-top: 8px;
  font-size: 13px;
  color: var(--accent);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}
.remove-method-btn:hover {
  color: var(--accent-deep);
}

.input-wrapper select {
  width: 100%;
  font-family: var(--font-body);
  font-size: 16px;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--transition);
  background: var(--surface);
  color: var(--fg);
  cursor: pointer;
}

.input-wrapper select:focus {
  border-color: var(--accent);
}

/* Chart */
.chart-card { display: flex; flex-direction: column; }
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.chart-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
}
.chart-wrapper { position: relative; }
.chart-container {
  position: relative;
  height: 280px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 0 0 40px 60px;
}
.y-axis {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 40px;
  width: 55px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.y-axis span {
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.grid-lines {
  position: absolute;
  left: 60px;
  right: 0;
  top: 0;
  bottom: 40px;
  pointer-events: none;
}
.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border);
}
.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: 1;
  height: 100%;
  position: relative;
}
.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  height: 100%;
  justify-content: flex-end;
}
.bar {
  width: 100%;
  max-width: 48px;
  border-radius: 4px 4px 0 0;
  transition: opacity var(--transition);
  cursor: pointer;
  position: relative;
}
.bar:hover { opacity: 0.8; }
.bar.received { background: var(--success); }
.bar.spent { background: var(--accent); }
.x-axis {
  display: flex;
  gap: 8px;
  padding-left: 60px;
  margin-top: 8px;
}
.x-axis span {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}
.chart-tooltip {
  position: absolute;
  background: var(--fg);
  color: black;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 10;
  white-space: nowrap;
  transform: translateX(-50%);
}
.chart-tooltip.visible { opacity: 1; }
.chart-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--fg);
}

/* History */
.history-section { margin-bottom: 32px; }
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.history-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
}
.history-tabs {
  display: none;
  gap: 0;
  border-bottom: 2px solid var(--border);
  margin-bottom: 20px;
}
.history-tab {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all var(--transition);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}
.history-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.history-tab:hover:not(.active) { color: var(--fg); }

.history-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.history-column-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot-received { background: var(--success); }
.dot-sent { background: var(--info); }
.dot-withdrawn { background: var(--accent); }

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tx-item {
  padding: 14px 16px;
  background: var(--bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: box-shadow var(--transition);
}
.tx-item:hover { box-shadow: var(--shadow-card); }
.tx-item.empty {
  text-align: center;
  color: var(--muted);
  background: transparent;
  border: none;
  box-shadow: none;
}
.tx-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.tx-amount {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tx-amount.positive { color: var(--success); }
.tx-amount.negative { color: var(--fg); }
.tx-amount.withdrawn { color: var(--accent); }
.tx-date {
  font-size: 12px;
  color: var(--muted);
}
.tx-desc {
  font-size: 13px;
  color: var(--muted);
}
.tx-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.tx-status.completed { background: var(--success-bg); color: var(--success); }
.tx-status.pending { background: oklch(95% 0.04 80); color: oklch(75% 0.16 80); }
.tx-status.cancelled { background: oklch(95% 0.02 10); color: oklch(60% 0.15 10); }

.pending-section { margin-bottom: 32px; }

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}
.pagination-btn {
  font-family: var(--font-body);
  padding: 8px 16px;
  border: 2px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--fg);
  transition: all var(--transition);
}
.pagination-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.pagination-info {
  font-size: 14px;
  color: var(--muted);
}

.refresh-btn {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--accent);
  cursor: pointer;
  transition: all var(--transition);
}
.refresh-btn:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

/* Responsive */
@media (max-width: 1000px) {
  .main { width: 92%; padding: 24px 0 60px; }
  .top-row { grid-template-columns: 1fr; }
  .history-columns { grid-template-columns: 1fr; }
  .history-col { display: none; }
  .history-col.active { display: block; }
  .history-tabs { display: flex; }
  .chart-container { height: 220px; }
}

@media (max-width: 768px) {
  .card { padding: 20px; }
  .chart-bars { gap: 4px; }
  .x-axis { gap: 4px; }
  .x-axis span { font-size: 11px; }
}

@media (max-width: 480px) {
  .main { width: 96%; }
  .funding-card-title { font-size: 20px; }
  .balance-row-amount { font-size: 18px; }
  .toggle-btn { padding: 8px 16px; font-size: 14px; }
  .quick-amounts { gap: 8px; }
  .quick-amount-btn { padding: 6px 12px; font-size: 13px; }
}

</style>

<style>
:root {
  --bg: oklch(97.5% 0.003 250);
  --surface: oklch(100% 0 0);
  --fg: oklch(28% 0.025 260);
  --muted: oklch(55% 0.02 250);
  --border: oklch(90% 0.008 250);
  --accent: oklch(62% 0.22 25);
  --accent-deep: oklch(55% 0.20 25);
  --success: oklch(72% 0.18 145);
  --success-bg: oklch(95% 0.04 145);
  --info: oklch(55% 0.20 250);
  --font-display: 'Unbounded', system-ui, sans-serif;
  --font-body: 'Montserrat', system-ui, sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 24px;
  --radius-pill: 40px;
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 20px rgba(0,0,0,0.1);
  --transition: 0.2s ease;
}

html.dark {
  --bg: #0f172a;
  --surface: #1e293b;
  --fg: #f1f5f9;
  --muted: #94a3b8;
  --border: #334155;
  --accent: #f87171;
  --accent-deep: #ef4444;
  --success: #4ade80;
  --success-bg: #14532d;
  --info: #60a5fa;
}

html.dark .card {
  background: var(--surface);
  border-color: var(--border);
}
html.dark .balance-row {
  background: #1e293b;
}
html.dark .input-wrapper input {
  background: var(--surface);
  color: var(--fg);
}
html.dark .tx-item {
  background: #0f172a;
  border-color: var(--border);
}
html.dark .tx-status.pending {
  background: #451a03;
  color: #fbbf24;
}
</style>
