<template>
  <div>
    <Head :title="post.title" />

    <div class="block">
      <div class="image-container" :class="{ sticky: isSticky }">
        <img v-if="post.image_url" :src="post.image_url" :alt="post.title" class="post-image">
        <div v-else class="no-image">
          <span>Изображение отсутствует</span>
        </div>
      </div>

      <div class="content-wrapper">
        <div class="desc">
          <div class="header-actions">
            <h2 class="title">{{ post.title }}</h2>
            <div class="menu-container" v-if="canEdit">
              <button @click="toggleMenu" class="menu-btn" type="button">
                <img src="../../../../public/build/assets/dots-vertical-svgrepo-com.svg" alt="">
              </button>
              <div v-if="menuOpen" class="dropdown-menu">
                <button @click="sharePost" class="menu-item">
                  <img src="../../../../public/build/assets/share-1-svgrepo-com.svg" alt="">Поделиться
                </button>
                <Link :href="post.edit_url" class="menu-item">
                  <img src="../../../../public/build/assets/pencil-box-svgrepo-com.svg" alt="" style="width: 16px;height: 16px;">Редактировать
                </Link>
                <button @click="deletePost" class="menu-item delete">
                  <img src="../../../../public/build/assets/trash-blank-svgrepo-com.svg" alt=""> Удалить
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
              src="../../../../public/images/User-avatar.svg.png" 
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

          <p class="description">{{ post.description }}</p>
          
          <div class="meta">
            <small>{{ formattedDate }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="comments-section-wrapper">
      <div class="comments-section">
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
                  src="../../../../public/images/User-avatar.svg.png" 
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
      </div>
    </div>
  </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, useForm, usePage, router } from '@inertiajs/vue3' 
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const page = usePage()
const commentErrors = ref({})
const menuOpen = ref(false)
const isSticky = ref(false)

const commentForm = useForm({
  text: ''
})

const canEdit = computed(() => {
  return page.props.auth.user && page.props.auth.user.id === props.post.user.id
})

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

const handleScroll = () => {
  const block = document.querySelector('.block')
  if (block) {
    const rect = block.getBoundingClientRect()
    isSticky.value = rect.top <= 0 && rect.bottom > window.innerHeight
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', closeMenuOnClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeMenuOnClickOutside)
})

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
  if (navigator.share) {
    navigator.share({
      title: props.post.title,
      text: props.post.description,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('Ссылка скопирована в буфер обмена')
  }
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
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  overflow: visible;
  transition: all 0.3s ease;
}

.image-container {
  flex: 0 0 50%;
  max-width: 50%;
  height: fit-content;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
  min-height: 400px;
  display: flex;
  align-items: flex-start;
}

.image-container.sticky {
  position: sticky;
  top: 20px;
}

.post-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
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

.desc {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
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

.dropdown-menu {
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
  color: #4f46e5;
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

.comments-section-wrapper {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 40px;
}

.comments-section {
  padding: 32px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
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
  color: #4338ca;
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
    flex: none;
    max-width: 100%;
    width: 100%;
    position: static !important;
  }

  .image-container.sticky {
    position: static !important;
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
</style>

<script>
export default {
  layout: AppLayout
}
</script>