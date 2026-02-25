<template>
  <AppLayout>
    <Head :title="'Профиль ' + user.name" />

    <div class="Profileblock">
      <div class="container">
        <div class="avatar">
          <div class="profile-header">
            <img v-if="user.avatar_url" :src="user.avatar_url" :alt="'Аватарка ' + user.name">
            <div v-else>
              <form v-if="isOwnProfile" @submit.prevent="submitAvatar" enctype="multipart/form-data">
                <label for="avatar">Загрузить аватарку:</label>
                <input type="file" name="avatar" id="avatar" accept="image/*" required @change="handleAvatarChange">
                <button type="submit" :disabled="avatarForm.processing">Сохранить</button>
              </form>
            </div>
          </div>
          <div class="desc">
            <h1>{{ user.name }}</h1>
          </div>
          <div v-if="user.rating" class="rating-display">
            <Link :href="'/ratings/' + user.id" class="rating-link">
              <div class="stars">
                <template v-for="i in 5" :key="i">
                  <img 
                    v-if="i <= Math.floor(user.rating)" 
                    src="/build/assets/star-svgrepo-com.svg" 
                    alt="star"
                    class="star-icon"
                  >
                  <img 
                    v-else-if="i - 1 < user.rating && user.rating % 1 >= 0.5" 
                    src="/build/assets/half-star-svgrepo-com.svg" 
                    alt="half-star"
                    class="star-icon"
                  >
                  <img 
                    v-else 
                    src="/build/assets/star-svgrepo-com.svg" 
                    alt="star-empty"
                    class="star-icon empty"
                  >
                </template>
              </div>
              <span class="rating-value">{{ user.rating }}</span>
            </Link>
          </div>
          <p v-if="user.created_at" class="created-at">Аккаунт создан {{ user.created_at }}</p>
        </div>
      </div>
      <div class="aboutme">
        <div class="aboutme-header">
          <h1>Обо мне</h1>
          <Link :href="'/profile/' + user.id + '/following'">
            Подписки<br> {{ user.following_count }}
          </Link>
          <Link :href="'/profile/' + user.id + '/followers'">
            Подписчики<br> {{ user.followers_count }}
          </Link>
          <Link :href="'/profile/' + user.id + '/liked-posts'">Лайки</Link>
          <Link v-if="isOwnProfile" :href="'/profile/' + user.id + '/edit'" class="btn-edit">
            <img src="../../../../public/images/54512.png" alt="Редактировать профиль">
          </Link>
        </div>

        <div v-if="isOwnProfile">
          <div v-if="!user.aboutme" class="aboutme-form">
            <p>Расскажите о себе</p>
            <form @submit.prevent="submitAboutMe">
              <textarea draggable="false" v-model="aboutMeForm.aboutme" placeholder="Напишите что-нибудь о себе..."></textarea>
              <button type="submit" :disabled="aboutMeForm.processing">Сохранить</button>
            </form>
          </div>
          <div v-else class="aboutme-content" :class="{ expanded: isExpanded }" :style="{ maxHeight: expandedHeight }" ref="aboutmeContent">
            <p ref="aboutmeText">{{ user.aboutme }}</p>
          </div>
        </div>
        <div v-else class="aboutme-body">
          <div class="aboutme-content" :class="{ expanded: isExpanded }" :style="{ maxHeight: expandedHeight }" ref="aboutmeContent">
            <p class="truncated-text" ref="aboutmeText">{{ user.aboutme || 'Пользователь пока не добавил информацию о себе.' }}</p>
          </div>
        </div>

        <a v-if="showExpandButton" @click="toggleExpand" class="expand">
          {{ isExpanded ? 'Свернуть' : 'Развернуть' }}
        </a>

        <div v-if="!isOwnProfile && auth.user" class="profile-actions">
          <form @submit.prevent="toggleSubscription">
            <button type="submit">
              {{ user.is_subscribed ? 'Отписаться' : 'Подписаться' }}
            </button>
          </form>
          <Link href="'/chats/start/' + user.id">
            <button>Написать сообщение</button>
          </Link>
        </div>
      </div>
    </div>

    <h2>Посты {{ user.name }}</h2>
    <div v-if="posts.length > 0 || isOwnProfile" class="posts">
      <div v-if="isOwnProfile" class="post add-post-block">
        <Link href="/posts/create" class="add-post-link">
          <p>Добавить новый пост</p>
          <button class="add-post-button">+</button>
        </Link>
      </div>
      <Post
        v-for="post in posts"
        :key="post.id"
        :post="post"
      />
    </div>
    
    <div v-else class="noposts">
      <h1>у {{ user.name }} пока что нет постов...</h1>
    </div>

  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { Head, Link, useForm, usePage, router } from '@inertiajs/vue3';
import { computed, ref, onMounted, nextTick } from 'vue';
import Post from '@/Components/Post.vue'

const props = defineProps({
  user: Object,
  posts: Object, 
  auth: Object 
});

const page = usePage();
const auth = computed(() => page.props.auth);
const isOwnProfile = computed(() => auth.value.user && auth.value.user.id === props.user.id);

const aboutmeText = ref(null);
const aboutmeContent = ref(null);
const showExpandButton = ref(false);
const isExpanded = ref(false);
const expandedHeight = ref('15em');

const checkTextHeight = () => {
  if (aboutmeText.value) {
    const lineHeight = parseFloat(getComputedStyle(aboutmeText.value).lineHeight);
    const textHeight = aboutmeText.value.scrollHeight;
    const maxHeight = lineHeight * 15;
    
    showExpandButton.value = textHeight > maxHeight;
  }
};

const toggleExpand = () => {
  if (!isExpanded.value) {
    expandedHeight.value = aboutmeText.value.scrollHeight + 'px';
  } else {
    expandedHeight.value = '15em';
  }
  isExpanded.value = !isExpanded.value;
};

onMounted(() => {
  nextTick(() => {
    checkTextHeight();
  });
});

const aboutMeForm = useForm({
  aboutme: props.user.aboutme || '',
});

const submitAboutMe = () => {

  aboutMeForm.put(route('profile.update-aboutme', props.user.username), {
    preserveScroll: true,
    onSuccess: () => {
      nextTick(() => {
        checkTextHeight();
      });
    },
  });
};

const avatarForm = useForm({
    avatar: null,
});

const handleAvatarChange = (event) => {
    avatarForm.avatar = event.target.files[0];
};

const submitAvatar = () => {
    avatarForm.post(route('profile.update-avatar'), {
        forceFormData: true, 
        onSuccess: () => {
            avatarForm.reset();
        },
    });
};

const toggleSubscription = () => {
  if (!props.auth?.user) {
    router.visit('/login');
    return;
  }

  if (!props.user?.id) {
    console.error("ID пользователя не найден в props.user");
    return;
  }
  
  const url = `/profile/${props.user.id}/${props.user.is_subscribed ? 'unsubscribe' : 'subscribe'}`;
  const method = props.user.is_subscribed ? 'delete' : 'post';

  router[method](url, {}, {
    preserveScroll: true,
    preserveState: true, 
  });
};
</script>
<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Neucha&family=Rubik+Spray+Paint&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Montserrat", serif;
}

.Profileblock {
  padding: 70px;
  width: 100%;
  display: flex;
  gap: 100px;
  justify-content: center;
}

.container {
  width: 350px;
  height: min-content;
}

.avatar h1 {
  padding: 5px;
}

.created-at {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.rating-display {
  margin-bottom: 10px;
}

.rating-link {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: inherit;
}

.stars {
    display: flex;
    gap: 2px;
}

.star-icon {
    width: 20px;
    height: 20px;
}

.star-icon.empty {
    opacity: 0.3;
}

.rating-value {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.profile-header {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 350px;
    height: 350px;
    border-bottom: 1px solid black;
}

.profile-header form {
    gap: 10px;
    text-align: center;
    width: 150px;
    display: flex;
    flex-direction: column;
}

.profile-header form button {
    background-color: rgb(255, 52, 52);
    border: none;
    border-radius: 5px;
    padding: 10px;
}

.profile-header form button:hover {
    background-color: rgb(230, 45, 45);
}

.profile-header form button:active {
    background-color: rgb(205, 45, 45);
}

.profile-header img {
    width: 350px;
    height: 350px;
    object-fit: cover;
}

.sendmes {
    width: 350px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid black;
}

.sendmes button {    
    border: none;
    border-radius: 5px;
    padding: 8px;
    background-color: rgb(255, 52, 52);
}

.expand{
    align-self: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px 0;
    margin: 10px 0;
    font-size: 18px;
    text-decoration: underline;
    user-select: none;
    display: block;
}
.aboutme-body {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.aboutme {
    padding: 20px 30px;
    min-height: 400px;
    width: 600px;
    display: flex;
    flex-direction: column;
    border: 1px solid rgb(182, 182, 182);
    background-color: white;
    position: relative;
    transition: all .5s ease;
}
.aboutme-content{
    padding: 5px;
    overflow: hidden;
    max-height: 15em; 
    transition: all .5s ease;
}
.aboutme-content p{
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.aboutme h1 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
}
.truncated-text{
    transition: all .5s ease;
}
.aboutme p {
    line-height: 1.5;
}

.aboutme p a {
    color: rgb(255, 52, 52);
    text-decoration: none;
}

.aboutme p a:hover {
    text-decoration: underline;
}

.aboutme button {
    background-color: rgb(255, 52, 52);
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 20px;
}

.aboutme button:hover {
    background-color: rgb(230, 45, 45);
}

.aboutme button:active {
    background-color: rgb(205, 45, 45);
}

.aboutme-header {
    border-bottom:1px solid rgb(182,182,182) ;
    height: 45px;
    width: 100%;    
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.aboutme-header a {
    display: flex;
    align-items: flex-start;
    text-decoration: none;
    color: black;
    text-align: center;
    font-size: 14px;
}

.aboutme-header img {
    width: 30px;
    height: 30px;
}
.aboutme textarea{
    margin: 20px 0 0 0;
    padding: 10px;
    width: 100%;
    height: 200px;
    resize: none;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
}

.form-group input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    min-height: 150px;
    resize: vertical;
}

.form-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.form-actions form {
    width: min-content;
}

.btn-save {
    background-color: rgb(255, 52, 52);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 12px 24px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 16px;
}

.btn-save:hover {
    background-color: rgb(230, 45, 45);
}

.btn-cancel {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 12px 24px;
    text-decoration: none;
    transition: background-color 0.2s;
    font-size: 16px;
}

.btn-cancel:hover {
    background-color: #e0e0e0;
}

.posts {
    position: relative;
    width: fit-content;
    margin: 0 auto;
    min-height: 70vh;
}

.noposts {
    width: 100%;
    height: 60vh;
    display: flex;
    justify-content: flex-start;
    padding: 50px 0 0 150px;
}

h2 {
    margin-left: 130px;
}

.post {
    overflow: hidden;
    margin: 10px;
    display: flex;
    flex-direction: column;
    width: 300px; 
    text-overflow: ellipsis;
}

.post a {
    color: black; 
    text-decoration: none;
}

.post img {
    width: 300px; 
    height: auto; 
}

.post-content {
    position: absolute; 
    min-width: 300px;
    bottom: 4px; 
    background-color: rgba(0, 0, 0, 0.7);
    color: white; 
    padding: 10px; 
    opacity: 0; 
    transition: opacity 0.3s ease;
}

.post:hover .post-content {
    opacity: 1; 
}

.post-actions button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: white; 
}
.profile-actions {
    justify-self: flex-end;
    display: flex;
    gap: 10px;
}
.add-post-block {
    display: flex; 
    justify-content: center; 
    align-items: center; 
    background-color: lightgray; 
    height: 450px; 
}
.add-post-link {
    display:flex; 
    flex-direction: column; 
    align-items: center;
}
.add-post-button {
    height: 50px; 
    width: 50px; 
    border-radius: 50%; 
    font-size: 25px; 
    border:none; 
    margin-top: 20px; 
    cursor: pointer;
}
</style>