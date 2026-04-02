<template>
  <div>
    <Head :title="post.title" />

    <div class="block">
      <div class="image-container">
        <img
          v-if="post.image_url"
          :src="post.image_url"
          :alt="post.title"
          class="post-image"
        >
        <div v-else class="no-image">
          <span>Изображение отсутствует</span>
        </div>
      </div>

      <div class="content-wrapper">
        <div v-if="post.is_hidden" class="hidden-warning">
          ⚠️ Этот пост скрыт администрацией и виден только вам
        </div>
        <div class="desc">
          <div class="header-actions">
            <template v-if="post.is_vacancy">
              <h2 class="title">Вакансия: {{ post.vacancy.position }}</h2>
            </template>
            <template v-else>
              <h2 class="title">{{ post.title }}</h2>
            </template>
            <div class="menu-container" v-if="canEdit || canReport">
              <button @click="toggleMenu" class="menu-btn" type="button">
                <img src="/images/dots.svg" alt="меню">
              </button>
              <div v-if="menuOpen" class="post-dropdown-menu">
                <button @click="sharePost" class="menu-item">
                  <img src="/images/share.svg" alt="">Поделиться
                </button>
                <Link v-if="post.edit_url" :href="post.edit_url" class="menu-item">
                  <img src="/images/edit.svg" alt="">Редактировать
                </Link>
                <button v-if="post.delete_url" @click="deletePost" class="menu-item delete">
                  <img src="/images/trash.svg" alt=""> Удалить
                </button>
                <button v-if="canReport" @click="showReportModal = true" class="menu-item">
                  <img src="/images/flag.svg" alt="">Пожаловаться
                </button>
              </div>
            </div>
          </div>

          <Link :href="post.user.profile_url" class="author-link">
            <img
              v-if="post.user.avatar_url"
              :src="post.user.avatar_url"
              class="author-avatar"
              :alt="post.user.name"
            >
            <img
              v-else
              src="/images/User-avatar.png"
              class="author-avatar"
              :alt="post.user.name"
            >
            {{ post.user.name }}
          </Link>

          <div class="post-actions">
            <button @click="toggleLike" type="button" class="like-btn" :class="{ liked: post.is_liked }">
              {{ post.is_liked ? '❤️' : '🤍' }} {{ post.likes_count }}
            </button>
          </div>

          <template v-if="post.is_vacancy">
            <div class="vacancy-info">
              <div v-if="post.vacancy.budget_min || post.vacancy.budget_max" class="vacancy-budget">
                <span class="label">Бюджет:</span>
                <span class="value">
                  {{ post.vacancy.budget_min ? post.vacancy.budget_min + ' ₽' : '' }}
                  {{ post.vacancy.budget_min && post.vacancy.budget_max ? ' - ' : '' }}
                  {{ post.vacancy.budget_max ? post.vacancy.budget_max + ' ₽' : '' }}
                </span>
              </div>

              <div v-if="post.vacancy.deadline" class="vacancy-deadline">
                <span class="label">Срок:</span>
                <span class="value">{{ formatDeadline(post.vacancy.deadline) }}</span>
              </div>

              <div v-if="post.vacancy.skills && post.vacancy.skills.length > 0" class="vacancy-skills">
                <span class="label">Требуемые навыки:</span>
                <div class="skills-list">
                  <span 
                    v-for="skill in post.vacancy.skills" 
                    :key="skill.id" 
                    class="skill-tag"
                    :class="getSkillClass(skill.name)"
                  >
                    {{ skill.name }}
                    <span class="skill-level">★ {{ skill.level }}</span>
                  </span>
                </div>

              <div v-if="post.vacancy.requirements" class="vacancy-requirements">
                <span class="label">Требования:</span>
                <p class="requirements-text">{{ post.vacancy.requirements }}</p>
              </div>
            </div>
            </div>

            <div v-if="post.vacancy && post.vacancy.status === 'open'" class="vacancy-actions">
              <div v-if="post.vacancy.applications_count > 0" class="applications-count">
                {{ post.vacancy.applications_count }} {{ getApplicationsWord(post.vacancy.applications_count) }} на эту вакансию
              </div>
              <button 
                v-if="!isAuthor && post.respond_url" 
                @click="showRespondModal = true" 
                class="respond-btn"
                :disabled="post.has_application"
              >
                {{ post.has_application ? 'Вы уже откликнулись' : 'Откликнуться' }}
              </button>
            </div>
          </template>
          <template v-else>
            <p class="description">{{ post.description }}</p>
          </template>

          <div class="meta">
            <small>{{ formattedDate }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="comments-section-wrapper">
      <div v-if="post.is_vacancy && canEdit" class="tabs">
        <button 
          class="tab" 
          :class="{ active: activeTab === 'applications' }"
          @click="activeTab = 'applications'"
        >
          Список откликнувшихся ({{ post.vacancy.applications?.length || 0 }})
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'comments' }"
          @click="activeTab = 'comments'"
        >
          Комментарии ({{ post.comments.length }})
        </button>
      </div>

      <div class="comments-section">
        <template v-if="!post.is_vacancy || !canEdit || activeTab === 'comments'">
          <div v-if="$page.props.auth.user" class="comment-form">
            <form @submit.prevent="submitComment">
              <div v-if="commentErrors.text" class="error">{{ commentErrors.text }}</div>
              <textarea
                v-model="commentForm.text"
                required
                placeholder="Напишите комментарий"
                :disabled="commentForm.processing"
              ></textarea>
              <button type="submit" :disabled="commentForm.processing">
                {{ commentForm.processing ? 'Отправка...' : 'Добавить комментарий' }}
              </button>
            </form>
          </div>
          <div v-else class="login-prompt">
            <p>Чтобы оставить комментарий, <Link href="/login">войдите</Link> или <Link href="/register">зарегистрируйтесь</Link></p>
          </div>

          <h3>Комментарии ({{ post.comments.length }})</h3>

          <div v-if="post.comments.length === 0" class="no-comments">
            <p>Комментариев пока нет. Будьте первым!</p>
          </div>

          <div v-else class="comments">
            <div v-for="comment in post.comments" :key="comment.id" class="comment">
              <div class="comment-header">
                <Link :href="comment.user.profile_url" class="comment-author">
                  <img
                    v-if="comment.user.avatar_url"
                    :src="comment.user.avatar_url"
                    class="comment-avatar"
                    :alt="comment.user.name"
                  >
                  <img
                    v-else
                    src="/images/User-avatar.png"
                    class="comment-avatar"
                    :alt="comment.user.name"
                  >
                  <span class="comment-author-name">{{ comment.user.name }}</span>
                </Link>
                <small class="comment-date">{{ formatDate(comment.created_at) }}</small>
              </div>
              <div class="comment-body">
                <p>{{ comment.text }}</p>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'applications'">
          <h3>Список откликнувшихся ({{ post.vacancy.applications?.length || 0 }})</h3>
          
          <div v-if="!post.vacancy.applications || post.vacancy.applications.length === 0" class="no-comments">
            <p>На эту вакансию пока никто не откликнулся.</p>
          </div>

          <div v-else class="comments">
            <div v-for="application in post.vacancy.applications" :key="application.id" class="comment">
              <div class="comment-header">
                <Link :href="application.user.profile_url" class="comment-author">
                  <img
                    v-if="application.user.avatar_url"
                    :src="application.user.avatar_url"
                    class="comment-avatar"
                    :alt="application.user.name"
                  >
                  <img
                    v-else
                    src="/images/User-avatar.png"
                    class="comment-avatar"
                    :alt="application.user.name"
                  >
                  <span class="comment-author-name">{{ application.user.name }}</span>
                </Link>
                <div class="comment-header-right">
                  <small class="comment-date">{{ formatDate(application.created_at) }}</small>
                </div>
              </div>
              <div class="comment-body">
                <div>
                  <p v-if="application.cover_letter">{{ application.cover_letter }}</p>
                  <p v-if="application.proposed_price" class="proposed-price">Предложенная цена: {{ application.proposed_price }} ₽</p>
                </div>
                <Link v-if="application.chat_url" :href="application.chat_url" class="chat-btn">
                  Открыть чат
                </Link>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showRespondModal" class="modal-overlay" @click.self="showRespondModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showRespondModal = false">&times;</button>
        <h2>Отклик на вакансию</h2>
        <form @submit.prevent="submitRespond">
          <div class="form-group">
            <label for="cover_letter">Сопроводительное письмо *</label>
            <textarea
              id="cover_letter"
              v-model="respondForm.cover_letter"
              required
              placeholder="Расскажите о себе и почему вы подходите на эту вакансию..."
              rows="6"
            ></textarea>
            <div v-if="respondForm.errors.cover_letter" class="error">{{ respondForm.errors.cover_letter }}</div>
          </div>

          <div class="form-group">
            <label for="proposed_price">Предложенная цена (₽)</label>
            <input
              type="number"
              id="proposed_price"
              v-model="respondForm.proposed_price"
              min="1"
              max="9999999999"
              placeholder="Ваша цена"
            >
            <div v-if="respondForm.errors.proposed_price" class="error">{{ respondForm.errors.proposed_price }}</div>
          </div>

          <button type="submit" class="submit-btn" :disabled="respondForm.processing">
            {{ respondForm.processing ? 'Отправка...' : 'Отправить отклик' }}
          </button>
        </form>
      </div>
    </div>

    <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showReportModal = false">&times;</button>
        <h2>Пожаловаться на пост</h2>
        <form @submit.prevent="submitReport">
          <div class="form-group">
            <label for="report_reason">Причина жалобы *</label>
            <textarea
              id="report_reason"
              v-model="reportForm.reason"
              required
              placeholder="Опишите причину жалобы..."
              rows="4"
            ></textarea>
            <div v-if="reportErrors.reason" class="error">{{ reportErrors.reason }}</div>
          </div>

          <button type="submit" class="submit-btn" :disabled="reportForm.processing">
            {{ reportForm.processing ? 'Отправка...' : 'Отправить жалобу' }}
          </button>
        </form>
      </div>
    </div>
    
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showShareModal = false">&times;</button>
        <h2>Поделиться постом</h2>
        <form @submit.prevent="submitShare">
          <div class="form-group">
            <label>Выберите чаты для отправки *</label>
            <div v-if="sharedChats.length === 0" class="no-chats">
              <p>У вас нет чатов для отправки поста.</p>
            </div>
            <div v-else class="chat-list">
              <div v-for="chat in sharedChats" :key="chat.id" class="chat-item">
                <label class="chat-label">
                  <input
                    type="checkbox"
                    :value="chat.id"
                    v-model="shareForm.users"
                  >
                  <span class="chat-info">
                    <img
                      v-if="chat.other_user && chat.other_user.avatar_url"
                      :src="chat.other_user.avatar_url"
                      class="chat-avatar"
                      :alt="chat.other_user.name"
                    >
                    <img
                      v-else
                      src="/images/User-avatar.png"
                      class="chat-avatar"
                      :alt="chat.other_user ? chat.other_user.name : 'Неизвестный пользователь'"
                    >
                    <span class="chat-name">{{ chat.other_user ? chat.other_user.name : 'Неизвестный пользователь' }}</span>
                  </span>
                </label>
              </div>
            </div>
            <div v-if="shareErrors.users" class="error">{{ shareErrors.users }}</div>
          </div>

          <div class="form-group">
            <label for="share_message">Текст сообщения</label>
            <textarea
              id="share_message"
              v-model="shareForm.message"
              placeholder="Напишите сообщение к посту..."
              rows="4"
            ></textarea>
          </div>

          <button type="submit" class="submit-btn" :disabled="shareForm.processing">
            {{ shareForm.processing ? 'Отправка...' : 'Отправить' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { getSkillClass } from '@/composables/useSkills'
import { Head, Link, useForm, usePage, router } from '@inertiajs/vue3'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const menuOpen = ref(false)
  const activeTab = ref('comments')
  const commentErrors = ref({})
  const showRespondModal = ref(false)
  const showReportModal = ref(false)
  const showShareModal = ref(false)
  const reportErrors = ref({})
  const shareErrors = ref({})
  const respondForm = useForm({
    cover_letter: '',
    proposed_price: ''
  })
  const reportForm = useForm({
    reason: ''
  })
  const shareForm = useForm({
    users: [],
    message: ''
  })

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const page = usePage()

const commentForm = useForm({
  text: ''
})

const canEdit = computed(() => {
  return page.props.auth.user && page.props.auth.user.id === props.post.user.id
})

const isAuthor = computed(() => {
  return page.props.auth.user && page.props.auth.user.id === props.post.user.id
})

const canReport = computed(() => {
    return page.props.auth.user && page.props.auth.user.id !== props.post.user.id
  })

  const sharedChats = computed(() => {
    // Assuming post has a shared_chats property with users/chats that have common chats
    // If not available in props, we would need to fetch it from an API endpoint
    return props.post.shared_chats || []
  })

const submitRespond = () => {
  respondForm.clearErrors()
  
  if (!respondForm.cover_letter || respondForm.cover_letter.trim().length < 10) {
    respondForm.errors.cover_letter = 'Сопроводительное письмо должно содержать минимум 10 символов'
  }
  
  if (respondForm.proposed_price && respondForm.proposed_price > 9999999999) {
    respondForm.errors.proposed_price = 'Максимальная сумма - 9 999 999 999 ₽'
  }
  
  if (Object.keys(respondForm.errors).length > 0) {
    return
  }
  
  respondForm.post(props.post.respond_url, {
    preserveScroll: true,
    onSuccess: () => {
      showRespondModal.value = false
      respondForm.reset()
    }
  })
}

const formattedDate = computed(() => {
  if (props.post.created_at) {
    const date = new Date(props.post.created_at)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return ''
})

const getApplicationsWord = (count) => {
  const cases = [2, 0, 1, 1, 1, 2]
  return ['отклик', 'отклика', 'откликов'][count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]]
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'только что'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: diffInSeconds > 31536000 ? 'numeric' : undefined
  })
}

const formatDeadline = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenuOnClickOutside = (event) => {
  const menuContainer = document.querySelector('.menu-container')
  if (menuContainer && !menuContainer.contains(event.target)) {
    menuOpen.value = false
  }
}

const sharePost = () => {
    showShareModal.value = true
    menuOpen.value = false
  }

const deletePost = () => {
  if (confirm('Вы уверены, что хотите удалить этот пост?')) {
    router.delete(props.post.delete_url)
  }
  menuOpen.value = false
}

const toggleLike = () => {
  router.post(props.post.like_url, {}, {
    preserveScroll: true,
    forceFormData: true
  })
}

const submitComment = () => {
  commentForm.post(`/posts/${props.post.id}/comments`, {
    preserveScroll: true,
    onSuccess: () => {
      commentForm.reset()
      commentErrors.value = {}
      router.reload({ only: ['post'] })
    },
    onError: (errors) => {
      commentErrors.value = errors
    }
  })
}

const submitReport = () => {
    reportErrors.value = {}
   
    if (!reportForm.reason || reportForm.reason.trim().length < 5) {
      reportErrors.value.reason = 'Причина должна содержать минимум 5 символов'
      return
    }
   
    reportForm.post(`/posts/${props.post.id}/report`, {
      preserveScroll: true,
      onSuccess: () => {
        showReportModal.value = false
        reportForm.reset()
        menuOpen.value = false
      },
      onError: (errors) => {
        reportErrors.value = errors
      }
    })
  }

  const submitShare = () => {
    shareErrors.value = {}
   
    if (!shareForm.users || shareForm.users.length === 0) {
      shareErrors.value.users = 'Выберите хотя бы один чат'
      return
    }
   
    router.post(`/posts/${props.post.id}/share`, {
      users: shareForm.users,
      message: shareForm.message
    }, {
      preserveScroll: true,
      onSuccess: () => {
        showShareModal.value = false
        shareForm.reset()
        menuOpen.value = false
      },
      onError: (errors) => {
        shareErrors.value = errors
      }
    })
  }

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<style scoped>
header {
  position: relative;
}

.block {
  display: flex;
  max-width: 1200px;
  width: 100%;
  margin: 40px auto;
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  flex-wrap: wrap;
}

.image-container {
  flex: 0 0 50%;
  max-width: 50%;
  height: fit-content;
  min-height: 400px;
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
  position: sticky;
  top: 80px;
  align-self: flex-start;
  z-index: 10;
}

.post-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  border-radius: 22px 0 0 22px;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 500;
  padding: 40px;
  text-align: center;
  min-height: 400px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hidden-warning {
  background: #fef3c7;
  color: #92400e;
  padding: 12px 20px;
  text-align: center;
  font-weight: 500;
  border-bottom: 2px solid #f59e0b;
}

.desc {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  word-break: break-word;
  margin: 0;
  flex: 1;
}

.menu-container {
  position: relative;
}

.menu-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f1f5f9;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 8px;
}

.menu-btn:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.menu-btn img {
  width: 75%;
  height: 75%;
}

.post-dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  z-index: 100;
  animation: fadeIn 0.2s ease;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 20px;
  border: none;
  background: white;
  color: #334155;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item.delete {
  color: #ef4444;
}

.menu-item.delete:hover {
  background: #fee2e2;
}

.menu-item img {
  width: 18px;
  height: 18px;
}

.author-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #334155;
  font-weight: 500;
  transition: color 0.2s ease;
  width: fit-content;
}

.author-link:hover {
  color: rgb(222, 42, 42);
  text-decoration: none;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.post-actions {
  display: flex;
  align-items: center;
}

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  background: white;
  color: #1e293b;
  border-radius: 40px;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.like-btn:hover {
  background: #fef2f2;
  transform: scale(1.05);
}

.like-btn.liked {
  color: #ef4444;
  background: #fee2e2;
}

.description {
  font-size: 16px;
  line-height: 1.7;
  color: #334155;
  word-break: break-word;
  white-space: pre-wrap;
}

.meta {
  color: #64748b;
  font-size: 14px;
}

.vacancy-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.vacancy-budget,
.vacancy-deadline {
  display: flex;
  gap: 8px;
}

.vacancy-budget .label,
.vacancy-deadline .label,
.vacancy-skills .label,
.vacancy-requirements .label {
  font-weight: 600;
  color: #334155;
}

.vacancy-budget .value,
.vacancy-deadline .value {
  color: #0f172a;
}

.vacancy-skills {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  gap: 3px;
  align-items: center;
}

.skill-tag.skill-php {
  background: #6b21a8;
  color: white;
}

.skill-tag.skill-laravel {
  background: #ff5722;
  color: white;
}

.skill-tag.skill-js {
  background: #fbbf24;
  color: #1f2937;
}

.skill-tag.skill-vue {
  background: #16a34a;
  color: white;
}

.skill-tag.skill-react {
  background: #0ea5e9;
  color: white;
}

.skill-tag.skill-node {
  background: #15803d;
  color: white;
}

.skill-tag.skill-python {
  background: #2563eb;
  color: white;
}

.skill-tag.skill-django {
  background: #0f766e;
  color: white;
}

.skill-tag.skill-design,
.skill-tag.skill-uiux {
  background: #ec4899;
  color: white;
}

.skill-tag.skill-figma {
  background: #f59e0b;
  color: #1f2937;
}

.skill-tag.skill-photoshop,
.skill-tag.skill-illustrator {
  background: #3b82f6;
  color: white;
}

.skill-tag.skill-copywriting,
.skill-tag.skill-content {
  background: #8b5cf6;
  color: white;
}

.skill-tag.skill-marketing,
.skill-tag.skill-seo,
.skill-tag.skill-smm {
  background: #14b8a6;
  color: white;
}

.skill-tag.skill-video {
  background: #ef4444;
  color: white;
}

.skill-tag.skill-3d {
  background: #f97316;
  color: white;
}

.skill-tag.skill-animation,
.skill-tag.skill-motion {
  background: #d946ef;
  color: white;
}

.skill-tag.skill-translation {
  background: #06b6d4;
  color: white;
}

.skill-tag.skill-data,
.skill-tag.skill-excel {
  background: #22c55e;
  color: white;
}

.skill-tag.skill-default {
  background: #64748b;
  color: white;
}

.skill-level {
  font-size: 11px;
  opacity: 0.8;
}

.vacancy-requirements {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requirements-text {
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
}

.comments-section-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 40px;
}

.comments-section {
  background: white;
  border-radius: 24px;
}

.comment-form {
  margin-bottom: 24px;
}

.comment-form form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-form textarea {
  width: 100%;
  min-height: 120px;
  padding: 16px 20px;
  font-size: 15px;
  font-family: "Montserrat", serif;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
  background: #f8fafc;
  color: #0f172a;
}

.comment-form textarea:focus {
  border-color: rgb(255, 142, 142);
  background: white;
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.08);
}

.comment-form textarea:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.comment-form button {
  align-self: flex-end;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  background: rgb(255,52,52);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.comment-form button:hover:not(:disabled) {
  background: rgb(222, 42, 42);
}

.comment-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.login-prompt {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  text-align: center;
  color: #475569;
  font-size: 15px;
}

.login-prompt a {
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.login-prompt a:hover {
  text-decoration: underline;
  color: rgb(222,42,42);
}

h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px;
}

.no-comments {
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 16px;
  text-align: center;
  color: #64748b;
  font-size: 15px;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.comment {
  background: #f8fafc;
  border-radius: 20px;
  padding: 20px;
  transition: background 0.2s;
}

.comment:hover {
  background: #f1f5f9;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 50px;
  background: rgb(255, 52, 52);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.chat-btn:hover {
  background: rgb(222, 42, 42);
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #0f172a;
  font-weight: 600;
  font-size: 15px;
}

.comment-author:hover {
  color: #4f46e5;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.comment-author-name {
  font-weight: 600;
}

.comment-date {
  color: #64748b;
  font-size: 13px;
}
.comment-body{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.comment-body p {
  font-size: 15px;
  line-height: 1.6;
  color: #334155;
  word-break: break-word;
  white-space: pre-wrap;
}

@media (max-width: 1000px) {
  .block {
    flex-direction: column;
    margin: 20px;
    border-radius: 20px;
  }

  .image-container {
    position: static;
    width: 100%;
    max-width: 100%;
    margin: 0;
  }

  .desc {
    padding: 28px;
  }

  .title {
    font-size: 28px;
  }

  .comments-section-wrapper {
    margin: 0 20px 20px;
  }

  .comments-section {
    padding: 28px;
  }
}

@media (max-width: 768px) {
  .block {
    margin: 16px;
    border-radius: 16px;
  }

  .desc {
    padding: 24px;
  }

  .title {
    font-size: 24px;
  }

  .author-avatar {
    width: 40px;
    height: 40px;
  }

  .comments-section-wrapper {
    margin: 0 16px 16px;
  }

  .comments-section {
    padding: 24px;
  }

  .comment-form button {
    width: 100%;
    align-self: center;
  }
}

@media (max-width: 480px) {
  .desc {
    padding: 20px;
  }

  .title {
    font-size: 22px;
  }

  .author-link {
    font-size: 14px;
  }

  .like-btn {
    padding: 8px 16px;
    font-size: 16px;
  }

  .description {
    font-size: 15px;
  }

  .comments-section {
    padding: 20px;
  }

  .comment {
    padding: 16px;
  }

  .comment-author {
    gap: 8px;
  }

  .comment-avatar {
    width: 32px;
    height: 32px;
  }

  .comment-author-name {
    font-size: 14px;
  }

  .comment-date {
    font-size: 12px;
  }

  .comment-body p {
    font-size: 14px;
  }

  .menu-btn {
    width: 36px;
    height: 36px;
  }
}

.vacancy-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.applications-count {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.respond-btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  background: rgb(255, 52, 52);
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.respond-btn:hover:not(:disabled) {
  background: rgb(222, 42, 42);
}

.respond-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 16px;
  min-height: 300px;
  max-height: 90vh;
  max-width: 500px;
  width: 90%;
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
}

.modal-content h2 {
  margin-bottom: 24px;
  font-size: 24px;
  color: #0f172a;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #334155;
}

.form-group textarea,
.form-group input {
  resize: vertical;
  width: 100%;
  max-height: 585px;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
}

.form-group textarea:focus,
.form-group input:focus {
    border-color: rgb(255, 52, 52);
    outline: none;
  }
  
  .chat-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
    max-height: 250px;
    overflow-y: auto;
  }
  
  .chat-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .chat-item:hover {
    background: #f8fafc;
  }
  
  .chat-label {
    display: flex !important; 
    align-items: center;
    gap: 12px;
    width: 100%;
    cursor: pointer;
  }
  
  .chat-label input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  .chat-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }
  
  .chat-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }
  
  .chat-name {
    font-weight: 500;
    color: #0f172a;
  }
  
  .no-chats {
    text-align: center;
    padding: 20px;
    color: #64748b;
    font-size: 14px;
  }

.submit-btn {
  width: 100%;
  padding: 14px;
  background: rgb(255, 52, 52);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: rgb(222, 42, 42);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: white;
  padding: 8px;
  border-radius: 16px;
}

.tab {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tab:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab.active {
  background: rgb(255, 52, 52);
  color: white;
}

.proposed-price {
  font-weight: 600;
  color: #0f172a;
  margin-top: 8px;
}
</style>

<script>
export default {
  layout: AppLayout
}
</script>