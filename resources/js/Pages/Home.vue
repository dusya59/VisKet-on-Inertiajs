<template>
    <Head title="Главная"/>
    <div class="block1">
      <h1>Место, где работа находит работника<br/>и наоборот.</h1>
      <img :src="heroImage" alt="bruh" />
    </div>

    <div class="block2">
      <button class="filter-toggle" @click="filtersVisible = !filtersVisible">
        Фильтры {{ filtersVisible ? '▼' : '▶' }}
      </button>
      <div class="main-content">
        
        <input v-model="query" type="text" placeholder="Поиск по постам" />
      </div>
    </div>
    <div class="tabs":class="{ filtersOpen: filtersVisible }">
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
    <div class="block3">
      <div class="filterscontainer" :class="{ hidden: !filtersVisible }">
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
          <div class="selected-skills" v-if="selectedSkills.length > 0">
            <div 
              v-for="skill in selectedSkills" 
              :key="skill.id" 
              class="skill-tag"
              :class="getSkillClass(skill.name)"
            >
              <span class="skill-name">{{ skill.name }}</span>
              <div class="skill-level">
                <label>Уровень:</label>
                <select v-model="skill.level">
                  <option :value="1">1</option>
                  <option :value="2">2</option>
                  <option :value="3">3</option>
                  <option :value="4">4</option>
                  <option :value="5">5</option>
                </select>
              </div>
              <button type="button" class="remove-skill" @click="removeSkill(skill.id)">×</button>
            </div>
          </div>
    </div>
  </div>
  <div class="posts">
    <template v-if="displayedPosts.length > 0">
      <Post
        v-for="post in displayedPosts"
        :key="post.id"
        :post="post"
      />
    </template>
    <template v-else>
      <p v-if="activeTab === 'foryou' && !authUser" class="empty-message">
        Чтобы подобрать для вас лучшую работу — <Link href="/login/">авторизуйтесь</Link>
      </p>
      <p v-else class="empty-message">Пока ничего нет</p>
    </template>
  </div>
  </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { computed, ref, watch } from 'vue'
import { Head, Link } from '@inertiajs/inertia-vue3'
import Post from '@/Components/Post.vue'
import SkillsSelector from '@/Components/SkillsSelector.vue'
import { getSkillClass } from '@/composables/useSkills'

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
const filtersVisible = ref(false)

const removeSkill = (skillId) => {
  selectedSkills.value = selectedSkills.value.filter(s => s.id !== skillId)
}

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

.filter-toggle {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;
}

.filter-toggle:hover {
  border-color: rgb(255, 52, 52);
  color: rgb(255, 52, 52);
}

.main-content {
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

.selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
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

.skill-name {
  font-weight: 500;
}

.skill-level {
  display: flex;
  align-items: center;
  gap: 4px;
}

.skill-level label {
  font-size: 11px;
  opacity: 0.8;
}

.skill-level select {
  padding: 2px 6px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}

.skill-level select option {
  background: #333;
  color: white;
}

.remove-skill {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  padding: 0 4px;
}

.remove-skill:hover {
  opacity: 1;
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
.tabs.filtersOpen {
  padding: 0 0 0 350px;
}
.empty-message {
  width: 80%;
  position: absolute;
  text-align: center;
  color: #64748b;
  padding-top: 30px;
  font-size: 16px;
}

.empty-message a {
  color: rgb(255, 52, 52);
  text-decoration: underline;
}
.block3{
  display: flex;
}

.filterscontainer {
  overflow: hidden;
  max-width: 340px;
  border-right: 2px solid #e2e8f0;
}

.filterscontainer.hidden {
  max-width: 0;
  border-right-color: transparent;
}

.filters {
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 300px; 
  flex-shrink: 0;
  height: min-content;
}
</style>