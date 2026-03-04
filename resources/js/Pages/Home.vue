<template>
  <div>
    <Head title="Главная"/>

    <div class="block1">
      <h1>Место, где работа находит работника<br/>и наоборот.</h1>
      <img :src="heroImage" alt="bruh" />
    </div>

    <div class="block2">
      <input v-model="query" type="text" placeholder="Поиск по постам" />
      
      <div class="filters">
        <div class="filter-group">
          <label>Тип:</label>
          <div class="type-selector">
            <button 
              :class="{ active: typeFilter === '' }" 
              @click="typeFilter = ''"
            >
              Все
            </button>
            <button 
              :class="{ active: typeFilter === 'vacancy' }" 
              @click="typeFilter = 'vacancy'"
            >
              Вакансии
            </button>
            <button 
              :class="{ active: typeFilter === 'post' }" 
              @click="typeFilter = 'post'"
            >
              Посты
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>Навыки:</label>
          <SkillsSelector
            v-model="selectedSkills"
            :skills="skills"
          />
        </div>
      </div>
    </div>
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'all' }" 
        @click="activeTab = 'all'"
      >
        Все посты
      </button>
      <button 
        :class="{ active: activeTab === 'foryou' }" 
        @click="activeTab = 'foryou'"
      >
        Для вас
      </button>
    </div>
  </div> 
  <div class="posts">
      <Post
        v-for="post in displayedPosts"
        :key="post.id"
        :post="post"
      />
    </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { computed, ref, watch } from 'vue'
import { Head, } from '@inertiajs/inertia-vue3'
import Post from '@/Components/Post.vue'
import SkillsSelector from '@/Components/SkillsSelector.vue'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  skills: {
    type: Array,
    default: () => []
  },
  userSkills: {
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

const heroImage = '/images/Photoroom.png' 
const query = ref('')
const typeFilter = ref('')
const selectedSkills = ref([])
const activeTab = ref('all')

const calculateMatchPercentage = (vacancySkills, userSkillsArr) => {
  if (!vacancySkills || vacancySkills.length === 0) return 0
  if (!userSkillsArr || userSkillsArr.length === 0) return 0

  const userSkillIds = userSkillsArr.map(s => s.id)
  const matchedSkills = vacancySkills.filter(vs => userSkillIds.includes(vs.id))
  
  return Math.round((matchedSkills.length / vacancySkills.length) * 100)
}

const forYouPosts = computed(() => {
  const userSkillsArr = props.userSkills.length > 0 ? props.userSkills : selectedSkills.value
  
  if (userSkillsArr.length === 0) {
    return []
  }

  return posts.value
    .filter(post => post.is_vacancy && post.vacancy && post.vacancy.skills)
    .map(post => ({
      ...post,
      matchPercentage: calculateMatchPercentage(post.vacancy.skills, userSkillsArr)
    }))
    .filter(post => post.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
})

const filteredPosts = computed(() => {
  let result = posts.value

  if (query.value) {
    const q = query.value.toLowerCase()
    result = result.filter(post => 
      post.title.toLowerCase().includes(q) || 
      post.description.toLowerCase().includes(q)
    )
  }

  if (typeFilter.value) {
    if (typeFilter.value === 'vacancy') {
      result = result.filter(post => post.is_vacancy)
    } else {
      result = result.filter(post => !post.is_vacancy)
    }
  }

  if (selectedSkills.value.length > 0) {
    const skillIds = selectedSkills.value.map(s => s.id)
    result = result.filter(post => 
      post.vacancy && 
      post.vacancy.skills && 
      post.vacancy.skills.some(s => skillIds.includes(s.id))
    )
  }

  return result
})

const displayedPosts = computed(() => {
  if (activeTab.value === 'foryou') {
    return forYouPosts.value
  }
  return filteredPosts.value
})
</script>

<script>
export default {
  layout: AppLayout
}
</script>

<style scoped>

.filters {
  display: flex;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.filter-group .multiselect-container {
  max-width: 250px;
}

.type-selector {
  display: flex;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.type-selector button {
  padding: 8px 16px;
  border: none;
  background: white;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-selector button:not(:last-child) {
  border-right: 1px solid #e2e8f0;
}

.type-selector button:hover {
  background: #f8fafc;
  color: #334155;
}

.type-selector button.active {
  background: rgb(255, 52, 52);
  color: white;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e2e8f0;
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
  justify-content: center;
}

.tabs button {
  padding: 20px 100px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tabs button:hover {
  color: #334155;
}

.tabs button.active {
  color: rgb(255, 52, 52);
  border-bottom-color: rgb(255, 52, 52);
}
</style>