<template>
  <AppLayout>
    <Head title="Пополнение баланса" />

    <div class="balance-page">
      <div class="balance-container">
        <div class="back-link">
          <Link href="#" onclick="history.back(); return false;">
            ← Назад
          </Link>
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
  }
})

const page = usePage()
const authUser = computed(() => page.props.auth?.user || page.props.user || null)

const quickAmounts = [100, 300, 500, 1000, 3000, 5000]
const withdrawalAmounts = [100, 300, 500, 1000, 3000, 5000]
const isWithdrawal = ref(false)

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
</script>

<style scoped>
.balance-page {
  min-height: 100vh;
}

.balance-container {
  width: 600px;
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
}

.balance-card h1 {
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

@media(max-width: 1000px) {
  .balance-page {
    padding: 150px 20px 50px;
  }

  .balance-card {
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
