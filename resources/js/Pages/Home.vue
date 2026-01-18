<template>
  <div>
    <Head title="Главная"/>

    <div class="block">
      <h1>Место, где работа находит работника<br/>и наоборот.</h1>
      <img :src="heroImage" alt="bruh" />
    </div>

    <div class="block2">
      <input v-model="query" type="text" placeholder="Поиск по постам 🔍" />
      <div>
        <p>Выложи свой пост чтобы тебя заметили</p>

        <div v-if="authUser">
          <form :action="authUser.profile_url" method="GET">
            <button type="submit">Перейти в профиль</button>
          </form>
        </div>
        <div v-else>
          <form action="/login" method="GET">
            <button type="submit">Войти</button>
          </form>
        </div>
      </div>
    </div>
  <div class="posts">
      <Post
        v-for="post in posts"
        :key="post.id"
        :post="post"
      />
    </div>
    
  </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { computed, ref } from 'vue'
import { usePage, Head, Link } from '@inertiajs/inertia-vue3'
import Post from '@/Components/Post.vue'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  auth: {
    type: Object,
    default: () => ({})
  }
})


const posts = computed(() => props.posts || [])
const authUser = computed(() => props.auth?.user || null)

const heroImage = '/storage/91d6343e-e8d6-4fba-9fad-0bdba4d1e71c-Photoroom.png' 
const query = ref('')
</script>

<script>
export default {
  layout: AppLayout
}
</script>