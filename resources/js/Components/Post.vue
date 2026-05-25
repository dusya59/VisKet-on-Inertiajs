<template>
  <div class="post">
    <div class="badges">
      <div v-if="post.is_vacancy" class="vacancy-badge">Вакансия</div>
      <div v-if="post.active === false && post.status !== 'closed'" class="hidden-badge" title="Этот пост видите только вы">
        <img src="/images/blind.svg" alt="Скрыто">
      </div>
      <div v-if="post.status === 'closed'" class="closed-badge">Завершено</div>
    </div>
    <Link :href="post.show_url">
      <img v-if="post.image_url" :src="post.image_url" :alt="post.title" />
    </Link>

    <div class="post-content">
      <div class="post-body">
        <Link :href="post.show_url">
          <h3 class="title">{{ post.title }}</h3>
        </Link>
        <p class="description">{{ post.description }}</p>
        <div v-if="post.is_vacancy && post.vacancy?.skills?.length" class="post-skills">
          <span
            v-for="skill in post.vacancy.skills"
            :key="skill.id"
            class="skill-tag"
            :class="getSkillClass(skill.name)"
          >
            <span class="skill-name">{{ skill.name }}</span>
          </span>
        </div>
      </div>

      <div class="post-footer">
        <small>
          Автор:
          <Link :href="post.user.profile_url" class="username">{{ post.user.name }}</Link>
        </small>

        <div class="post-actions">
          <button @click="toggleLike" type="button" :class="{ liked: isLiked }" id="like">
            {{ isLiked ? '❤️' : '🤍' }} {{ localLikes }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { router, Link } from '@inertiajs/vue3'
import { useDarkMode } from '@/composables/useDarkMode'
import { getSkillClass } from '@/composables/useSkills'

const props = defineProps({
  post: Object
})

useDarkMode()

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

  const previousLiked = isLiked.value
  const previousLikes = localLikes.value
  isLiked.value = !previousLiked
  localLikes.value = localLikes.value + (isLiked.value ? 1 : -1)

  router.post(props.post.like_url, {}, {
    preserveScroll: true,
    onError: (error) => {
      console.error('Ошибка при лайке:', error)
      isLiked.value = previousLiked
      localLikes.value = previousLikes
    }
  })
}
</script>

<style scoped>
.post {
  position: relative;
}

.badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.vacancy-badge {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.hidden-badge {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 6px 8px;
  border-radius: 10px;
}

.hidden-badge img {
  width: 20px;
  height: 20px;
  display: block;
  fill: white;
}

.closed-badge {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.post-content {
  display: flex;
  flex-direction: column;
  height: auto;
  bottom: 0;
}

.post-body {
  flex: 1;
}

.post-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
</style>
