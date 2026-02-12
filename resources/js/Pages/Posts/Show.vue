<template>
  <div>
    <Head :title="post.title" />

    <div class="block">
      <img v-if="post.image_url" :src="post.image_url" :alt="post.title" class="post-image">
      <div v-else class="no-image">
        <span>Изображение отсутствует</span>
      </div>

      <div class="desc">

        <h2 class="title">{{ post.title }}</h2>
        
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
import { computed, ref,} from 'vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const page = usePage()
const commentErrors = ref({})

const commentForm = useForm({
  text: ''
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

const toggleLike = () => {
  router.post(props.post.like_url, {}, { 
    preserveScroll: true,
    forceFormData: true
  })
}


const submitComment = () => {
  commentForm.post_id(route('comments.store', props.post.id), {
    preserveScroll: true,
    onSuccess: () => {
      commentForm.reset()
      commentErrors.value = {}
      router.reload({ only: ['post'] })
      delete commentForm.post_id; 
    },
    onError: (errors) => {
      commentErrors.value = errors
    }
  })
}
</script>
<style scoped>
header{
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
  overflow: hidden;
  transition: all 0.3s ease;
}

.post-image {
  flex: 0 0 50%;
  max-width: 50%;
  object-fit: cover;
  display: block;
}

.no-image {
  flex: 0 0 50%;
  background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 500;
  padding: 40px;
  text-align: center;
  min-height: 400px;
}

.desc {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  word-break: break-word;
  margin: 0;
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

.comment-form {
  margin-top: 16px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
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
  margin-top: 20px;
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
  margin: 24px 0 16px;
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

/* Адаптивность */
@media (max-width: 1000px) {
  .block {
    flex-direction: column;
    margin: 20px;
    border-radius: 20px;
  }

  .post-image,
  .no-image {
    flex: none;
    max-width: 100%;
    width: 100%;
    height: auto;
    max-height: 500px;
  }

  .no-image {
    min-height: 300px;
  }

  .desc {
    padding: 28px;
  }

  .title {
    font-size: 28px;
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
}
</style>

<script>
export default {
  layout: AppLayout
}
</script>