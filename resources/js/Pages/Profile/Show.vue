<template>
  <AppLayout>
    <Head :title="'Профиль ' + user.name" />

    <div class="Profileblock">
      <div class="container">
        <div class="avatar">
          <div class="profile-header">
            <img v-if="user.avatar_url" :src="user.avatar_url" :alt="'Аватарка ' + user.name">
            <img v-else src="/images/User-avatar.png" :alt="'Аватарка ' + user.name">
            
          </div>
          <div class="desc">
            <h1>{{ user.name }} </h1>
            <img v-if="user.is_verified === 'verified'" src="/images/verified.svg" alt="Аккаунт верифицирован">
          </div>
          <div v-if="user.rating" class="rating-display">
            <Link :href="'/ratings/' + user.id" class="rating-link">
              <div class="stars">
                <template v-for="i in 5" :key="i">
                  <img 
                    v-if="i <= Math.floor(user.rating)" 
                    src="/images/star.svg" 
                    alt="star"
                    class="star-icon"
                  >
                  <img 
                    v-else-if="i - 1 < user.rating && user.rating % 1 >= 0.5" 
                    src="/images/star.svg" 
                    alt="half-star"
                    class="star-icon half"
                  >
                  <img 
                    v-else 
                    src="/images/star-empty.svg" 
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
          <Link v-if="isOwnProfile" href="/settings" class="btn-edit">
            <img src="/images/settings.svg" alt="Редактировать профиль">
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

        <div v-if="showExpandButton" @click="toggleExpand" class="expand">
          {{ isExpanded ? 'Свернуть' : 'Развернуть' }}
        </div>

        <div v-if="user.skills && user.skills.length > 0" class="user-skills">
          <h3>Навыки</h3>
          <div class="skills-list">
            <div 
              v-for="skill in user.skills" 
              :key="skill.id" 
              class="skill-tag"
              :class="getSkillClass(skill.name)"
            >
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-level">★ {{ skill.level }}</span>
            </div>
          </div>
        </div>

        <div v-if="!isOwnProfile && auth.user" class="profile-actions">
          <form @submit.prevent="toggleSubscription">
            <button type="submit">
              {{ user.is_subscribed ? 'Отписаться' : 'Подписаться' }}
            </button>
          </form>
          <Link :href="'/chats/start/' + user.id">
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

    <div v-if="isOwnProfile && closedVacancies && closedVacancies.length > 0" class="closed-vacancies">
      <h2>Завершённые вакансии</h2>
      <div class="posts">
        <Post
          v-for="post in closedVacancies"
          :key="post.id"
          :post="post"
        />
      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { getSkillClass } from '@/composables/useSkills'
import { Head, Link, useForm, usePage, router } from '@inertiajs/vue3';
import { computed, ref, onMounted, nextTick } from 'vue';
import Post from '@/Components/Post.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  user: Object,
  posts: Object, 
  auth: Object,
  closedVacancies: {
    type: Array,
    default: () => []
  },
  isOwnProfile: {
    type: Boolean,
    default: false
  }
});

useDarkMode();

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
    color: #fbbf24;
}

.star-icon.half {
    color: #fbbf24;
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
.desc{
  display: flex;
  align-items: center;
}
.desc img{
  width: 30px;
  height: 30px;
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
    justify-content: center;
    padding: 50px 0 0 150px;
}
.noposts h2{
  margin-left: 0px;
}
h2 {
    margin-left: 130px;
}

.post {
  overflow: hidden;
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

.user-skills {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
}

.user-skills h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 15px;
}

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.skills-list .skill-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
}

.skills-list .skill-name {
    font-weight: 500;
}

.skills-list .skill-level {
    font-size: 12px;
    opacity: 0.9;
}

.skills-list .skill-php { background: #6b21a8; color: white; }
.skills-list .skill-laravel { background: #ff5722; color: white; }
.skills-list .skill-js { background: #fbbf24; color: #1f2937; }
.skills-list .skill-vue { background: #16a34a; color: white; }
.skills-list .skill-react { background: #0ea5e9; color: white; }
.skills-list .skill-node { background: #15803d; color: white; }
.skills-list .skill-python { background: #2563eb; color: white; }
.skills-list .skill-django { background: #0f766e; color: white; }
.skills-list .skill-design { background: #ec4899; color: white; }
.skills-list .skill-figma { background: #f59e0b; color: #1f2937; }
.skills-list .skill-photoshop, .skills-list .skill-illustrator { background: #3b82f6; color: white; }
.skills-list .skill-copywriting, .skills-list .skill-content { background: #8b5cf6; color: white; }
.skills-list .skill-marketing, .skills-list .skill-seo, .skills-list .skill-smm { background: #14b8a6; color: white; }
.skills-list .skill-video { background: #ef4444; color: white; }
.skills-list .skill-3d { background: #f97316; color: white; }
.skills-list .skill-animation, .skills-list .skill-motion { background: #d946ef; color: white; }
.skills-list .skill-translation { background: #06b6d4; color: white; }
.skills-list .skill-data, .skills-list .skill-excel { background: #22c55e; color: white; }
.skills-list .skill-default { background: #64748b; color: white; }

.closed-vacancies {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
}

.closed-vacancies h2 {
    font-size: 20px;
    color: #6b7280;
    margin-bottom: 20px;
}

html.dark .Profileblock {
    color: #f1f5f9;
}

html.dark .container {
    color: #e2e8f0;
}

html.dark .created-at {
    color: #94a3b8;
}

html.dark .rating-value {
    color: #f1f5f9;
}

html.dark .aboutme {
    background-color: #1e293b;
    border-color: #334155;
}

html.dark .aboutme h1 {
    color: #f1f5f9;
}

html.dark .aboutme-header {
    border-color: #334155;
}

html.dark .aboutme-header a {
    color: #f1f5f9;
}

html.dark .aboutme textarea {
    background-color: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
}

html.dark .form-group label {
    color: #e2e8f0;
}

html.dark .form-group input[type="text"],
html.dark .form-group textarea {
    background-color: #1e293b;
    border-color: #334155;
    color: #f1f5f9;
}

html.dark .btn-cancel {
    background-color: #334155;
    color: #f1f5f9;
    border-color: #475569;
}

html.dark .noposts {
    color: #f1f5f9;
}

html.dark .noposts h1 {
    color: #f1f5f9;
}

html.dark h2 {
    color: #f1f5f9;
}

html.dark .post a {
    color: #f1f5f9;
}

html.dark .add-post-block {
    background-color: #334155;
}

html.dark .add-post-button {
    background-color: #475569;
    color: #f1f5f9;
}

html.dark .user-skills {
    border-color: #334155;
}

html.dark .user-skills h3 {
    color: #f1f5f9;
}

html.dark .closed-vacancies {
    border-color: #334155;
}

html.dark .closed-vacancies h2 {
    color: #94a3b8;
}

html.dark .expand {
    color: #e2e8f0;
}

html.dark .sendmes {
    border-color: #475569;
}
</style>