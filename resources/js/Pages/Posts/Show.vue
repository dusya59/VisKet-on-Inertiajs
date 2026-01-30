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
import { computed, ref, watchEffect } from 'vue'

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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Neucha&family=Rubik+Spray+Paint&display=swap');
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Montserrat", serif;;
}
body{
    display: flex;
    flex-direction: column;
}
a.logo{
    display: flex;
    font-size: 36px;
    font-weight: 700;
    text-decoration: none;
}
.l1{
    color: rgb(255, 52, 52);
    text-decoration: none;
}
.l2{
    color: rgb(99, 99, 99);
    text-decoration: none;
}
header nav{
    display: flex;
    gap: 20px;
    align-items: center;
}
header{
    padding: 0 50px 0 50px;
    position: absolute;
    width: 100%;
    height: 70px;
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    background-color: rgb(211, 211, 211);
}
header div{
    display: flex;
    gap: 20px;
    align-items: center;
}
header a{
    text-decoration: none;
    color: black;
}
header a:hover{
    text-decoration: underline;
}
a.logo:hover{
    text-decoration: none;
}
header button{
    color: white;
    background-color: rgb(255, 52, 52);
    border: none;
    border-radius: 5px;
    padding: 10px;
}
header button:hover{
    background-color: rgb(230, 45, 45);
}

header button:active{
    background-color: rgb(205, 45, 45);
}

.block{
    display: flex;
    width: 1000px;
    height: min-content;
    border:1px solid gray;
    border-radius: 5px; 
    overflow: hidden;
}

.block img{
    width: 500px;
    height: auto;
    align-self: center;
}
.desc{
    width:500px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    background-color: white;
}

.block div h1{   
    word-wrap: break-word;
    border-bottom: 1px solid gray;
    border-top:1px solid gray; ;
    padding: 10px 10px 10px 0;
    margin: 0 0 10px 0;
}
.block div p{
    word-wrap: break-word;
}
.block div a img{
    width: 30px;
    height: 30px;
    border-radius: 50%;
}
.block div a{
    color: black;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 5px;
}
.block div a:hover{
    text-decoration: underline;
}
.post-actions button{ 
    font-size: 18px;
    width: 50px;
    height: 20px;
    gap:5px;
    display: flex;
    align-items: center;
    border: none;
    background-color: white;
    color: black;
}
.post-actions button:hover{
    cursor: pointer;
}
.comm{
    display: flex;
    align-items: сenter;
    padding: 20px 0 10px 0;
}
.comments{
    flex: 1; 
    overflow-y: auto; 
}
.comment{
    padding: 10px 0;
}
textarea{
    width: 350px;
    resize: none;
}
footer{
    justify-content: space-evenly;
    width: 100%;
    height: 200px;
    background-color: rgb(211, 211, 211);
    display: flex;

}
footer div{
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}
footer div a{
    cursor: pointer;
}

.desc {
    display: flex;
    flex-direction: column;
    flex: 1; 
    gap: 10px;
    padding: 10px;
}

.comments {
    flex: 1; 
    overflow-y: auto; 
}
.main{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 100px;
    min-height: 95vh;
    height: fit-content;
}
@media(max-width:1000px){
    header{
        height: 100px;
        font-size: 32px;
        z-index: 10;
    }
    header button{
        width: 150px;
        height: 60px;
        font-size: 26px;
    }
    header div{
        gap: 40px;
        font-size:38px ;
    }
    header div a{
        width: min-content;
    }
    a.logo{
        font-size: 68px;
    }
    footer{
        font-size: 28px;
        height:300px;
    }
    footer div{
        width: 33vw;
        height:300px;
        display: flex;
        align-items: center;
        text-align: center;
    }
    footer div a{
        height: 70px;
    }
    main{
        padding:150px 0;
    }
    .block{
        width: 800px;
        font-size: 38px;
        flex-direction: column;
    }
    .block>img{
        width: 800px;
    }
    .desc{
        width: 780px;
        
        gap: 10px;
    }
    .desc a{
        font-size: 48px;
    }
    .block div a img{
        width: 100px;
        height: 100px;
    }
    .post-actions button{
        font-size: 42px;
        width: 100px;
        height: 60px;
    }
    textarea{
        width: 500px;
        height: 100px;
        padding: 10px;
        border-radius: 10px 0 0 10px;
        font-size: 32px;
    }
    .comm button{
        padding: 10px;
        font-size: 28px;
        border-radius: 0 10px 10px 0;
    }

}
</style>
<script>
export default {
  layout: AppLayout
}
</script>