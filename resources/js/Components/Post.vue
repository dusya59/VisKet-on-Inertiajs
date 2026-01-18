<template>
  <div class="post">
    <Link :href="post.show_url">
      <img v-if="post.image_url" :src="post.image_url" :alt="post.title" />
    </Link>

    <div class="post-content">
      <div>
        <Link :href="post.show_url">
          <h3 class="title">{{ post.title }}</h3>
        </Link>
        <p class="description">{{ post.description }}</p>
      </div>

      <small>
        Автор:
        <Link :href="post.user.profile_url" class="username">{{ post.user.name }}</Link>
      </small>

      <div class="post-actions">
        <button @click="toggleLike" type="button" :class="{ liked: isLiked }">
          {{ isLiked ? '❤️' : '🤍' }} {{ localLikes }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { router, Link } from '@inertiajs/vue3'

const props = defineProps({
  post: Object
})

const localLikes = ref(props.post.likes_count ?? 0)
const isLiked = ref(props.post.is_liked ?? false)

watch(() => props.post.likes_count, (newVal) => {
  localLikes.value = newVal
})

watch(() => props.post.is_liked, (newVal) => {
  isLiked.value = newVal
})

function toggleLike() {
  if (!props.post.like_url) {
    console.error('URL для лайка не указан')
    return
  }

  router.post(props.post.like_url, {}, {
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props.post) {
        localLikes.value = page.props.post.likes_count ?? localLikes.value
        isLiked.value = page.props.post.is_liked ?? isLiked.value
      }
    },
    onError: (error) => {
      console.error('Ошибка при лайке:', error)
    }
  })
}
</script>
