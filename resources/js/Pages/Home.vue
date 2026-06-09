<template>
    <Head title="Главная"/>
    <div class="block1">
      <img :src="isDark ? '/images/nightEarth.png' : '/images/Earth.png'" alt="Earth" class="hero-image" />
      <h1 class="hero-title">
        <span class="visket-text">
          V<span
            class="letter-i"
            :title="isDark ? 'переключить на светлую тему' : 'переключить на темную тему'"
            @click="toggleDarkMode"
          >
            I
            <svg class="sun-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" fill="currentColor"/>
              <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>SKET
        </span> — место, где работа находит работника<br/>и наоборот.
      </h1>
    </div>

    <div class="block2">
      <button class="filter-toggle" @click="filtersVisible = !filtersVisible">
        Фильтры <span>{{ filtersVisible ? '▼' : '▶' }}</span>
      </button>
      <div class="search-container">
        <input class="searchbar" v-model="query" type="text" placeholder="Поиск по постам" />
        <div class="view-mode-toggle">
          <button
            class="view-mode-btn"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            type="button"
          >
            <img src="/images/grid-view.svg" alt="Сетка" />
          </button>
          <button
            class="view-mode-btn"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            type="button"
          >
            <img src="/images/list-view.svg" alt="Список" />
          </button>
        </div>
      </div>
    </div>
    
    <div class="content-wrapper" :class="{ filtersOpen: filtersVisible }">
      <div v-if="filtersVisible" class="filters-overlay-mobile" @click="filtersVisible = false"></div>
      <div class="filterscontainer" ref="filtersContainer">
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
            <label>Бюджет:</label>
            <div class="budget-inputs">
              <input 
                type="number" 
                v-model.number="budgetFrom"
                placeholder="От"
                class="budget-input"
                min="0"
              />
              <input 
                type="number" 
                v-model.number="budgetTo"
                placeholder="До"
                class="budget-input"
                min="0"
              />
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
      
      <div class="main-wrapper" ref="mainWrapper">
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
        <div class="posts" :class="{ 'list-mode': viewMode === 'list' }">
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
  </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import Post from '@/Components/Post.vue'
import SkillsSelector from '@/Components/SkillsSelector.vue'
import { useDarkMode } from '@/composables/useDarkMode'

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
const { isDark, toggleDarkMode } = useDarkMode()

const query = ref('')
const typeFilter = ref('')
const selectedSkills = ref([])
const activeTab = ref('all')
const viewMode = ref(localStorage.getItem('viewMode') || 'grid')
const filtersVisible = ref(false)
const filtersContainer = ref(null)
const mainWrapper = ref(null)
const budgetFrom = ref(null)
const budgetTo = ref(null)

const syncFiltersHeight = () => {
  if (filtersContainer.value && mainWrapper.value) {
    filtersContainer.value.style.height = mainWrapper.value.offsetHeight + 'px'
  }
}

onMounted(() => {
  nextTick(() => {
    syncFiltersHeight()
    window.addEventListener('resize', syncFiltersHeight)
  })
})

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

  const hasBudgetFilter = Number.isFinite(budgetFrom.value) || Number.isFinite(budgetTo.value)

  if (hasBudgetFilter) {
    result = result.filter(post => {
      if (!post.is_vacancy || !post.vacancy) return false
      const vMin = post.vacancy.budget_min
      const vMax = post.vacancy.budget_max
      if (Number.isFinite(budgetFrom.value) && (vMin === null || vMin < budgetFrom.value)) return false
      if (Number.isFinite(budgetTo.value) && (vMax === null || vMax > budgetTo.value)) return false
      return true
    })
  } else if (typeFilter.value) {
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

watch(displayedPosts, () => {
  nextTick(syncFiltersHeight)
})

watch(viewMode, (newVal) => {
  localStorage.setItem('viewMode', newVal)
  nextTick(syncFiltersHeight)
})
</script>

<script>
export default {
  layout: AppLayout
}
</script>

<style scoped>

.filter-toggle {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 90px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
}

.filter-toggle:hover {
  border-color: rgb(255, 52, 52);
  color: rgb(255, 52, 52);
}

.filter-toggle span{
  font-size: 12px;
}

.search-container {
  display: flex;
  gap: 20px;
  align-items: center;
}

.searchbar {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
}

.searchbar:focus {
  outline: none;
  border-color: rgb(255, 52, 52);
}

.view-mode-toggle {
  display: flex;
  gap: 8px;
}

.view-mode-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 8px;
}

.view-mode-btn:hover {
  background: #e2e8f0;
}

.view-mode-btn.active {
  background: rgb(255, 52, 52);
}

.view-mode-btn.active img {
  filter: brightness(0) invert(1);
}

.view-mode-btn img {
  width: 24px;
  height: 24px;
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

.budget-inputs {
  display: flex;
  gap: 8px;
}

.budget-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #334155;
  transition: all 0.2s ease;
}

.budget-input:focus {
  outline: none;
  border-color: rgb(255, 52, 52);
  box-shadow: 0 0 0 3px rgba(255, 52, 52, 0.1);
}

.budget-input::placeholder {
  color: #cbd5e1;
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

.content-wrapper {
  display: flex;
  position: relative;
  overflow-x: hidden;
}

/* --- Изменено под Masonry сетку для Десктопа в режиме Списка --- */
.posts.list-mode {
  display: block;          /* Сменили с flex на block для работы колонок */
  columns: 2;              /* Разбиваем на 2 колонки */
  column-gap: 16px;        /* Расстояние между колонками */
}

/* Каждый элемент внутри masonry-списка на десктопе */
.posts.list-mode > * {
  break-inside: avoid;     /* Предотвращает разрыв карточки между колонками */
  margin-bottom: 16px;     /* Отступ снизу до следующего кирпичика */
}

.posts.list-mode :deep(.post) {
  flex-direction: row;
  width: 100%;
}

.posts.list-mode :deep(.post a) {
  color: black;
}

.posts.list-mode :deep(.post-content) {
  position: static;
  background: #e2e8f0;
  color: black;
  opacity: 1;
  width: 50%;
  border-radius: 0 10px 10px 0;
}

.posts.list-mode :deep(.post .title) {
  color: black;
}

.posts.list-mode :deep(#like) {
  color: black;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 300px; 
  flex-shrink: 0;
  height: min-content;
}

.filterscontainer {
  width: 300px;
  flex-shrink: 0;
  background: white;
  border-right: 2px solid #e2e8f0;
  margin-left: -300px;
  transition: margin-left 0.3s ease;
}

.content-wrapper.filtersOpen .filterscontainer {
  margin-left: 20px;
}

.main-wrapper {
  flex: 1;
  min-width: 0;
}

html.dark .filter-toggle {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

html.dark .searchbar {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark .view-mode-btn {
  background: #334155;
}

html.dark .view-mode-btn:hover {
  background: #475569;
}

html.dark .filter-group label {
  color: #94a3b8;
}

html.dark .budget-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark .budget-input:focus {
  border-color: rgb(255, 52, 52);
  box-shadow: 0 0 0 3px rgba(255, 52, 52, 0.2);
}

html.dark .budget-input::placeholder {
  color: #475569;
}

html.dark .type-selector {
  border-color: #334155;
}

html.dark .type-selector button:not(:last-child) {
  border-right-color: #334155;
}

html.dark .type-selector button:hover {
  background: #334155;
  color: #e2e8f0;
}

html.dark .tabs {
  border-bottom-color: #334155;
}

html.dark .tabs button {
  color: #94a3b8;
}

html.dark .tabs button:hover {
  color: #e2e8f0;
}

html.dark .empty-message {
  color: #94a3b8;
}

html.dark .filterscontainer {
  background: #0f172a;
  border-right-color: #334155;
}

html.dark .skill-level select option {
  background: #1e293b;
  color: #f1f5f9;
}

html.dark .posts.list-mode :deep(.post-content) {
  background: #1e293b;
  color: #f1f5f9;
}

html.dark .posts.list-mode :deep(.post a) {
  color: #f1f5f9;
}

html.dark .posts.list-mode :deep(.post .title) {
  color: #f1f5f9;
}

html.dark .posts.list-mode :deep(#like) {
  color: #f1f5f9;
}

.block1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-image {
  max-width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.hero-title {
  position: absolute;
  margin: 0 0 0 65vw;
  font-size: 36px;
  line-height: 1.3;
  width: 500px;
  font-weight: 400;
  color: rgb(255, 52, 52);
  font-family: 'Unbounded', sans-serif;
}

.visket-text {
    font-family: 'Unbounded', sans-serif;
    font-weight: 400;
}

.letter-i {
  position: relative;
  display: inline-block;
  cursor: pointer;
  font-family: 'Unbounded', sans-serif;
  font-weight: 400;
}

.sun-svg {
  position: absolute;
  top: -0.7em;
  left: -90%;
  transform: translateX(-50%);
  width: 0.9em;
  height: 0.9em;
  color: #f59e0b;
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ─── Mobile adaptation · VisKet homepage ─────────────────────────────────── */

/* ── 1. Hero block ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .block1 {
    position: relative;
    height: auto;
    min-height: 220px;
    padding: 1.5rem 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    overflow: hidden;
  }

  .hero-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    opacity: 0.35;
    pointer-events: none;
  }

  .hero-title {
    position: relative;
    z-index: 1;
    font-size: clamp(1.35rem, 5.5vw, 1.75rem);
    line-height: 1.25;
    margin: 0;
    width: fit-content;
  }

  .hero-title br {
    display: none;
  }

  .visket-text {
    display: block;
    margin-bottom: 0.15em;
  }
}

/* ── 2. Search / filter bar ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .block2 {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
  }

  .filter-toggle {
    flex-shrink: 0;
    white-space: nowrap;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .search-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .searchbar {
    flex: 1;
    min-width: 0;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  .view-mode-toggle {
    flex-shrink: 0;
    display: flex;
    gap: 5px;
  }

  .view-mode-btn {
    padding: 0.375rem;
  }

  .view-mode-btn img {
    width: 20px;
    height: 20px;
  }
}

/* ── 3. Content layout (посты + фильтры) ────────────────────────────────────── */
@media (max-width: 768px) {
  .content-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  .filterscontainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 280px;
    max-height: none;
    z-index: 11;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
  }

  .content-wrapper.filtersOpen .filterscontainer {
    transform: translateX(-20px);
  }

  .filters-overlay-mobile {
    position: absolute;
    inset: 0;
    z-index: 9;
    background: transparent;
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.875rem 1rem 1rem;
    border-bottom: 1px solid var(--border-color, rgba(0 0 0 / 0.1));
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.55;
  }

  .type-selector {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .type-selector button {
    flex: 1;
    min-width: 80px;
    text-align: center;
    padding: 0.4rem 0.5rem;
    font-size: 0.875rem;
  }

  .budget-inputs {
    display: flex;
    gap: 0.5rem;
  }

  .budget-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}

/* ── 4. Табы ────────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .main-wrapper {
    min-width: 0;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color, rgba(0 0 0 / 0.1));
    padding: 0 1rem;
    gap: 0;
  }

  .tabs button {
    flex: 1;
    padding: 0.75rem 0.25rem;
    font-size: 0.9rem;
    text-align: center;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: none;
  }

  .tabs button.active {
    border-bottom-color: currentColor;
  }
}

/* ── 5. Посты: 2 колонки в grid-режиме, 1 колонка в list-режиме ─────────────── */
@media (max-width: 768px) {
  .posts:not(.list-mode) {
    display: block;
    columns: 2;
    column-gap: 0.625rem;
    padding: 0.75rem;
  }

  .posts:not(.list-mode) > * {
    break-inside: avoid;
    margin-bottom: 0.625rem;
  }

  /* List-режим на мобилке: СБРОС ДЕСКТОПНОГО MASONRY (0 изменений на мобильном) */
  .posts.list-mode {
    display: flex !important;       /* Возвращаем flex-поток */
    flex-direction: column !important;
    gap: 0 !important;
    padding: 10px 0 10px 10px !important;
    columns: auto !important;       /* Сбрасываем колонки */
  }

  .posts.list-mode :deep(.post a) {
    width: 50%;
  }

  .posts.list-mode :deep(.post-content) {
    height: auto;
    width: 50%;
  }

  .posts.list-mode > * + * {
    border-top: 1px solid var(--border-color, rgba(0 0 0 / 0.08));
  }

  .posts .empty-message {
    grid-column: 1 / -1;
  }
}

/* ── 6. Пустое состояние ────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .empty-message {
    position: static;
    width: auto;
    padding: 2.5rem 1.5rem;
    text-align: center;
    font-size: 0.9rem;
    opacity: 0.6;
  }
}

/* ── 7. Очень маленькие экраны (< 360px) ────────────────────────────────────── */
@media (max-width: 360px) {
  .hero-title {
    font-size: 1.2rem;
  }

  .block2 {
    gap: 0.4rem;
    padding: 0.625rem 0.75rem;
  }

  .filter-toggle {
    padding: 0.45rem 0.5rem;
    font-size: 0.8rem;
  }

  .view-mode-btn img {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 1000px) {
  .hero-title {
    padding: 60px 0 0 20px;
  }
}
</style>